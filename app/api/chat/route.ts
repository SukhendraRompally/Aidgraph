export const maxDuration = 60 // seconds — prevents Vercel from timing out on longer conversations

const API_URL = process.env.AIDGRAPH_API_URL ?? 'https://api.aidgraph.com'

type RawMsg = { role: string; parts?: { type: string; text?: string }[]; content?: string }

function toContent(m: RawMsg): string {
  return m.parts?.find(p => p.type === 'text')?.text ?? m.content ?? ''
}

export async function POST(req: Request) {
  const { messages }: { messages: RawMsg[] } = await req.json()

  // Normalize to {role, content}
  const normalized = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: toContent(m) }))

  // Split last user message as query; everything before it is conversation history
  const lastUserIdx = normalized.map(m => m.role).lastIndexOf('user')
  const query = normalized[lastUserIdx]?.content ?? ''
  const priorMessages = normalized.slice(0, lastUserIdx)

  const backendRes = await fetch(`${API_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      ...(priorMessages.length > 0 && { messages: priorMessages }),
      stream: true,
      limit: 10,
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!backendRes.ok || !backendRes.body) {
    return new Response(
      'data: {"type":"error","errorText":"Backend unavailable"}\n\ndata: [DONE]\n\n',
      { headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  // Convert backend SSE → client SSE format
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'))
      const reader = backendRes.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (raw === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
              return
            }
            try {
              const event = JSON.parse(raw)
              if ('results' in event) {
                // First event: results + parsed_query — surface any dataset note
                const note = event.parsed_query?._note
                if (note) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'note', value: note })}\n\n`))
                }
              } else if ('chunk' in event) {
                // Streaming text chunk
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', value: event.chunk })}\n\n`))
              }
            } catch { /* skip malformed lines */ }
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', errorText: String(err) })}\n\n`))
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
