You are a senior AI fullstack engineer and system architect.

Your task is to build a production-ready AI Email Intelligence Agent that runs بالكامل on Vercel using a single Next.js application (no separate backend).

========================================
🎯 CORE OBJECTIVE
========================================
Build an AI-powered email assistant that:
- Connects to Gmail/Outlook via OAuth2
- Reads incoming emails
- Uses Groq LLM to summarize and analyze them
- Uses RAG to improve importance detection
- Displays results in a premium UI dashboard
- Runs entirely inside a Next.js (App Router) project deployed on Vercel

========================================
🏗️ ARCHITECTURE (STRICT REQUIREMENTS)
========================================
- Use Next.js (App Router) as FULLSTACK framework
- Do NOT create separate backend (no Express/FastAPI)
- Use:
  - Server Actions for business logic
  - Route Handlers (/api) for APIs and webhooks

- Everything must be deployable on Vercel directly

========================================
🔐 AUTHENTICATION (OAUTH)
========================================
Use NextAuth (Auth.js) inside Next.js:

Providers:
- Google (Gmail API)
- Microsoft (Outlook)

Requirements:
- Securely store access_token & refresh_token
- Auto-refresh tokens
- Use least-privilege scopes:
  - Gmail: gmail.readonly
  - Outlook: Mail.Read

========================================
📥 EMAIL INGESTION
========================================
- Fetch emails using Gmail API / Microsoft Graph
- Support:
  - Polling via Vercel Cron Jobs
  - OR webhook-based ingestion

Extract:
- sender
- subject
- timestamp
- body (clean HTML → text)

========================================
⚡ LLM PROCESSING (GROQ)
========================================
Use Groq API for inference.

Model:
- llama3-70b-8192 (primary)

Tasks:
1. Summarize email (2–4 lines)
2. Classify:
   - Action Required
   - Informational
   - Promotional
   - Spam
3. Detect urgency:
   - High / Medium / Low
4. Extract action items
5. Detect deadlines

STRICT OUTPUT FORMAT:
Return JSON only:
{
  "summary": "...",
  "category": "...",
  "urgency": "...",
  "action_items": ["..."],
  "deadline_detected": true/false
}

========================================
📚 RAG SYSTEM
========================================
Use vector database:

Preferred:
- Upstash Vector (serverless, Vercel-friendly)

Alternative:
- Pinecone

Store embeddings for:
- Past emails
- Important contacts (VIP)
- User preferences

Use RAG to:
- Detect important senders
- Identify ongoing threads
- Improve classification accuracy

========================================
⭐ IMPORTANCE ENGINE
========================================
Combine:
- LLM output
- RAG insights
- Rule-based scoring

Logic:
- HIGH:
  - VIP sender
  - Deadlines / meetings
  - Work-related

- MEDIUM:
  - Relevant but not urgent

- LOW:
  - Promotions / newsletters

OUTPUT:
{
  "importance": "High | Medium | Low",
  "priority_score": 0-100,
  "reason": "..."
}

========================================
🗄️ DATABASE
========================================
Use:
- Vercel Postgres OR Supabase

Store:
- users
- tokens
- emails
- embeddings references

========================================
🎨 PREMIUM UI REQUIREMENTS
========================================
Use:
- Tailwind CSS
- shadcn/ui
- Framer Motion

Design style:
- Dark mode default
- Glassmorphism (backdrop blur)
- Smooth animations
- Gradient accents (purple/indigo)

UI Pages:

1. Dashboard:
   - Email cards with:
     - summary
     - importance badge
     - priority score
     - action items

2. Filters:
   - High / Medium / Low

3. Email Detail View:
   - Full summary
   - Suggested reply (AI-generated optional)

========================================
✨ UI COMPONENT DESIGN
========================================
Each email card should look premium:

- Rounded-xl cards
- Soft shadows
- Hover animations
- Color-coded importance:
  - Red = High
  - Yellow = Medium
  - Green = Low

========================================
⚙️ FILE STRUCTURE
========================================
app/
  dashboard/
  api/
    auth/
    emails/
    analyze/
    webhook/

lib/
  groq.ts
  gmail.ts
  rag.ts

components/
  ui/
  email-card.tsx

========================================
🔄 AUTOMATION
========================================
- Use Vercel Cron Jobs to fetch emails periodically
- Process emails automatically
- Store results in DB

========================================
🤖 AUTONOMOUS LEARNING
========================================
- Allow user feedback:
  - mark as important
  - ignore similar emails

- Update embeddings accordingly

========================================
🔒 SECURITY
========================================
- Encrypt tokens
- Never expose email content
- Allow user data deletion

========================================
💡 ADVANCED FEATURES (OPTIONAL)
========================================
- AI reply generation
- Calendar integration
- Attachment summarization
- Slack/WhatsApp notifications

========================================
📦 FINAL OUTPUT REQUIREMENTS
========================================
Generate:

1. Complete Next.js project code
2. All API routes
3. OAuth setup
4. Groq integration
5. RAG pipeline
6. Database schema
7. Premium UI components
8. Environment variables setup
9. Step-by-step setup guide

========================================
🎯 FINAL GOAL
========================================
A production-ready AI email assistant that:
- Runs بالكامل on Vercel
- Looks like a premium SaaS product
- Uses Groq for ultra-fast AI
- Saves user time by highlighting important emails

Focus on:
Performance + Clean code + Scalability + Premium UX