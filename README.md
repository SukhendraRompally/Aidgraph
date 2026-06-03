# AidGraph — AI for Good

> Due diligence on any nonprofit, anywhere in the world.

AidGraph is a ChatGPT-style research assistant for the nonprofit sector. Ask any question about a nonprofit organization — its mission, financials, governance, leadership, size, or focus area — and get a grounded, data-backed answer drawn from a database of **8 million+ NGOs worldwide**.

It is built for anyone who needs to make an informed decision about a nonprofit:

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
| **Financials** | "Which Animal Welfare Nonprofits in the UK have the highest assets?" |
| **Geography** | "Education nonprofits in India formed after 2000" |
| **Filters** | "US senior focused organizations with 10+ employees, tax-exempt" |
| **Follow-ups** | Full conversation history — ask follow-up questions naturally |
| **Multilingual** | Ask in any language — answers are returned in the same language |

### Data Points Available per Organization

Each NGO in the database may include:

- **Identity**: Name, EIN/registration ID, country, state, city, website, phone, email
- **Mission**: AI-summarized program description, beneficiary groups, and geographic reach
- **Financials**: Year-by-year revenue (2019–2025), expenses, assets, liabilities, donations
- **Operations**: Employee count, volunteer count, formation year, tax-exempt status
- **References**: Links to ProPublica and GuideStar for further due diligence

---

## The Dataset

AidGraph is powered by a dataset of **8M+ nonprofit organizations** compiled from public filings and registries.

**Dataset:** [sukhendrarompally/giveai on Hugging Face](https://huggingface.co/datasets/sukhendrarompally/giveai)

The dataset contains two record types:
- **`all_ngos`** — one record per NGO with a single embedding capturing the full organizational profile
- **`vectors_optimized`** — per-attribute embeddings for higher-precision retrieval on specific fields like mission, financials, and location

These are combined into **21.8M searchable vectors** in a Qdrant vector database.

**Coverage:** US, UK, Brazil, India, Australia, Canada, Germany, Chile, Colombia, Ireland, and 70+ more countries.

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
│  • Chat UI with thread history                           │
│  • Auth (Supabase)                                       │
│  • Proxies raw query + conversation history to backend   │
└───────────────────────┬─────────────────────────────────┘
                        │  POST /query  (raw text + history)
                        │  ← SSE stream (results + answer)
┌───────────────────────▼─────────────────────────────────┐
│              Backend  ·  FastAPI + Cloudflare Tunnel     │
│                                                          │
│  • Parses natural language → structured filters          │
│  • Embeds query → Qdrant semantic search                 │
│  • Web search enrichment for time-sensitive queries      │
│  • Streams AI-generated answer                           │
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
┌──────────▼──────────┐    ┌────────────▼────────────────┐
│  Qdrant Vector DB   │    │     Tavily Web Search        │
│  21.8M NGO vectors  │    │  Live enrichment + fallback  │
└─────────────────────┘    └─────────────────────────────┘
```

### Key design decisions

- **Backend owns all intelligence.** The frontend sends raw natural language and displays what comes back. No LLM calls or query logic on the frontend.
- **Streaming by default.** The backend streams its answer word-by-word over SSE so users see results immediately.
- **Conversation history.** Each query passes prior messages to the backend so follow-up questions retain full context.
- **Web search enrichment.** For time-sensitive queries (recent news, current leadership, closures) or low-confidence results, the backend supplements database answers with live web search.
- **Graceful degradation.** When filters return no matches, the system falls back to semantic similarity and explains what it found.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth + database | Supabase (email auth, thread/message storage) |
| Hosting | Vercel |
| Backend API | FastAPI (Python) |
| Vector database | Qdrant |
| LLM | DeepSeek |
| Embeddings | OpenAI `text-embedding-3-large` |
| Web search | Tavily |
| Tunnel | Cloudflare Tunnel |

---

## Frontend Features

- **Chat interface** — continuous conversation threads, just like ChatGPT or Claude
- **Thread history** — logged-in users can save and return to past research sessions
- **Multilingual** — ask in any language, receive answers in the same language
- **Freemium funnel** — 3 free queries for anonymous users, then sign-up prompt
- **Dataset notes** — when the backend modifies a query, a subtle info chip explains what happened
- **Auth** — email/password via Supabase
- **API access form** — prospective API customers can apply

---

## Backend API

The backend exposes a single primary endpoint at `https://api.aidgraph.com`:

```
POST /query
```

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

**Response (non-streaming):**
```json
{
  "answer": "Here are the top matching NGOs...",
  "results": [ { "ngo_name": "...", "country_code": "US", "max_revenue": 3752012 } ],
  "parsed_query": {
    "semantic_query": "environmental NGOs California",
    "filters": { "state": "CA", "min_revenue": 1000000 }
  }
}
```

**Streaming** (`stream: true`) returns Server-Sent Events:
```
data: {"results": [...], "parsed_query": {...}}
data: {"chunk": "word-by-word answer..."}
data: [DONE]
```

### Supported filter dimensions

Country · Region (Latin America, Africa, Europe, etc.) · US state · City · Min/max revenue · Min/max assets · Min/max employees · Formation year · Tax-exempt status · Political affiliation · Report type

---

## Running Locally

### Prerequisites

- Node.js 18+
- A running instance of the AidGraph backend (or point to `https://api.aidgraph.com`)
- A [Supabase](https://supabase.com) project

### Setup

```bash
git clone https://github.com/sukhendrarompally/Aidgraph
cd Aidgraph
npm install
```

Create a `.env.local` file:

```bash
AIDGRAPH_API_URL=https://api.aidgraph.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Run the database schema in your Supabase SQL editor (see `supabase/schema.sql`), then:

```bash
npm run dev
```

---

## Roadmap

- [ ] Expanded international NGO data coverage
- [ ] API access tier with rate limiting and key management
- [ ] Source citations linking answers to specific data fields
- [ ] Side-by-side org comparison
- [ ] Export research to PDF / CSV

---

## License

MIT

---

*AidGraph is built on the belief that better information leads to better giving.*
