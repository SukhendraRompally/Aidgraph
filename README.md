# AidGraph — AI for Good

> Due diligence on any nonprofit, anywhere in the world.

AidGraph is a ChatGPT-style research assistant for the nonprofit sector. Ask any question about a nonprofit organization — its mission, financials, governance, leadership, size, or focus area — and get a grounded, data-backed answer drawn from a database of **8 million+ NGOs worldwide**.

Built for anyone who needs to make an informed decision about a nonprofit:

- **Donors** deciding where to give
- **Grantmakers** evaluating applicants
- **Journalists** investigating charitable organizations
- **Researchers** studying the nonprofit sector
- **Foundations** conducting due diligence before partnerships

---

## What You Can Ask

AidGraph supports natural language questions across a wide range of due diligence topics:

| Category | Example questions |
|---|---|
| **Discovery** | "Environmental nonprofits in California with over $1M revenue" |
| **Deep dive** | "Tell me everything about Save the Children — mission, financials, governance" |
| **Comparison** | "Compare Doctors Without Borders and Direct Relief by size and focus" |
| **Financials** | "Which animal welfare nonprofits in the UK have the highest assets?" |
| **Geography** | "Education nonprofits in India formed after 2000" |
| **Filters** | "US senior-focused organizations with 10+ employees, tax-exempt" |
| **Follow-ups** | Full conversation history — ask follow-up questions naturally |
| **Multilingual** | Ask in any language — answers are returned in the same language |

### Data Points Available per Organization

Each NGO in the database may include:

- **Identity**: Name, registration ID, country, state, city, website, phone, email
- **Mission**: AI-summarized program description, beneficiary groups, and geographic reach
- **Financials**: Year-by-year revenue (2019–2025), expenses, assets, liabilities, donations received
- **Operations**: Employee count, volunteer count, formation year, tax-exempt status
- **References**: Links to public registries and watchdogs for further due diligence

---

## The Dataset

AidGraph is powered by an in-house compiled dataset of **8M+ nonprofit organizations** drawn from public filings and national charity registries across 80+ countries.

**Coverage**: US, UK, Brazil, India, Australia, Canada, Germany, Chile, Colombia, Ireland, and 70+ more countries.

The dataset is combined into **21.8M searchable vectors** in a vector database, enabling both semantic search (what an NGO *does*) and structured filtering (revenue, location, size, etc.) in a single query.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User (browser)                       │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Frontend  ·  Vercel (Next.js)               │
│                                                          │
│  • Chat UI with conversation thread history              │
│  • Auth (Supabase)                                       │
│  • Proxies raw query + conversation history to backend   │
└───────────────────────┬─────────────────────────────────┘
                        │  POST /query  (text + history)
                        │  ← SSE stream (results + answer)
┌───────────────────────▼─────────────────────────────────┐
│              Backend  ·  FastAPI + Cloudflare Tunnel     │
│                                                          │
│  1. Parse NL → semantic query + structured filters       │
│  2. Embed query → semantic vector search (21.8M points)  │
│  3. Generate draft answer from database results          │
│  4. Evaluate answer quality (agentic self-assessment)    │
│  5. If insufficient → targeted web search → re-answer   │
│  6. Stream final answer back to frontend                 │
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
┌──────────▼──────────┐    ┌────────────▼────────────────┐
│   Vector Database   │    │       Web Search             │
│   21.8M NGO vectors │    │  Live enrichment (conditional)│
└─────────────────────┘    └─────────────────────────────┘
```

### Key design decisions

- **Backend owns all intelligence.** The frontend sends raw natural language and displays what comes back — no AI logic on the frontend.
- **Streaming by default.** The backend streams its answer word-by-word over SSE so users see results immediately.
- **Conversation history.** Each query passes prior messages so follow-up questions retain full context, including pronoun resolution ("tell me more about *them*").
- **Agentic web search.** Rather than keyword triggers, the backend generates a draft answer first, then uses an AI evaluator to judge whether it's complete. Web search fires only when the evaluator determines the database answer is insufficient — e.g. recent news, current leadership, time-sensitive information.
- **Graceful degradation.** When filters return no matches, the system falls back to semantic similarity and explains what it found instead.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth + database | Supabase (email auth, thread/message storage) |
| Hosting | Vercel |
| Backend API | FastAPI (Python) |
| Vector database | Qdrant |
| Web search | Tavily |
| Tunnel | Cloudflare Tunnel |

---

## Frontend Features

- **Chat interface** — continuous conversation threads, just like ChatGPT or Claude
- **Thread history** — logged-in users can save and return to past research sessions
- **Streaming answers** — responses appear word-by-word as they're generated
- **Multilingual** — ask in any language, receive answers in the same language
- **Freemium funnel** — 3 free queries for anonymous users, then sign-up prompt
- **Query notes** — when the backend modifies or falls back on a query, a subtle chip explains what happened
- **Auth** — email/password via Supabase
- **API access form** — prospective API customers can apply

---

## Backend API

The backend is publicly available at `https://api.aidgraph.com`.

### `GET /health`
```json
{ "status": "ok", "points": 21888358 }
```

### `POST /query`

```json
{
  "query": "environmental NGOs in California with over $1M revenue",
  "messages": [
    { "role": "user",      "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "limit": 10,
  "stream": false
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `query` | string | required | Natural language search query |
| `messages` | array | `[]` | Prior conversation turns for multi-turn context |
| `limit` | int | 10 | Number of results (max 50) |
| `stream` | bool | false | Enable SSE streaming |

**Response (non-streaming):**
```json
{
  "answer": "Here are the top matching NGOs...",
  "results": [
    { "ngo_name": "...", "country_code": "US", "state": "CA", "max_revenue": 3752012, "website": "..." }
  ],
  "parsed_query": {
    "semantic_query": "environmental NGOs California",
    "filters": { "state": "CA", "min_revenue": 1000000 }
  }
}
```

**Response (streaming, `stream: true`):** Server-Sent Events
```
data: {"results": [...], "parsed_query": {...}}   ← first event (metadata + results)
data: {"chunk": "word-by-word answer..."}         ← streamed answer tokens
data: [DONE]
```

### Supported filter dimensions

Country · Region (Latin America, Africa, Europe, Southeast Asia, etc.) · US state · City · Min/max revenue · Min/max assets · Min/max employees · Formation year range · Tax-exempt status · Political affiliation · Report type

---

## Running Locally

### Prerequisites

- Node.js 18+
- A running instance of the AidGraph backend, or point directly to `https://api.aidgraph.com`
- A [Supabase](https://supabase.com) project

### Setup

```bash
git clone https://github.com/SukhendraRompally/Aidgraph
cd Aidgraph
npm install
```

Create `.env.local`:

```bash
AIDGRAPH_API_URL=https://api.aidgraph.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Run the database schema in your Supabase SQL editor (see `supabase/`), then:

```bash
npm run dev
```

---

## Roadmap

- [ ] Expanded international NGO data coverage
- [ ] API access tier with rate limiting and key management
- [ ] Source citations linking answers to specific data fields
- [ ] Side-by-side org comparison view
- [ ] Export research to PDF / CSV

---

## License

MIT

---

*AidGraph is built on the belief that better information leads to better giving.*
