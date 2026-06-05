const API_URL = process.env.AIDGRAPH_API_URL ?? 'https://api.aidgraph.com'

export async function GET(req: Request) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const authHeader = req.headers.get('Authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
  }

  let backendRes: Response
  try {
    backendRes = await fetch(`${API_URL}/status`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000),
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ status: 'error', message: 'Status check failed', error: String(err) }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const text = await backendRes.text()
  const contentType = backendRes.headers.get('Content-Type') ?? 'application/json'
  return new Response(text, {
    status: backendRes.status,
    headers: { 'Content-Type': contentType },
  })
}
