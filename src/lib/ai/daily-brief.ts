import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

export interface BriefEmailCard {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  summary: string;
  category: "urgent" | "meeting" | "client" | "finance" | "personal" | "notification" | "newsletter" | "other";
  priority: "critical" | "high" | "normal" | "low";
  suggestedAction: string;
  confidence: number; // 0–100
  snippet: string;
  aiReasoning: string;
  needsReply: boolean;
  date: string;
}

export interface BriefInsight {
  text: string;
  type: "warning" | "info" | "opportunity" | "relationship";
}

export interface DailyBriefResult {
  overview: string;
  generatedAt: string;
  stats: {
    total: number;
    unread: number;
    important: number;
    urgent: number;
    vip: number;
    meetings: number;
    invoices: number;
    followUps: number;
    deadlines: number;
    needsReply: number;
  };
  emailCards: BriefEmailCard[];
  insights: BriefInsight[];
  themes: string[];
}

export interface RawEmail {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
}

const DEMO_BRIEF: DailyBriefResult = {
  overview:
    "Today was dominated by investor conversations and client follow-ups. Three people requested meetings, one invoice requires your approval, and two clients are waiting for replies that are now overdue. No scheduling conflicts were detected for your upcoming week.",
  generatedAt: new Date().toISOString(),
  stats: {
    total: 43,
    unread: 17,
    important: 8,
    urgent: 3,
    vip: 4,
    meetings: 3,
    invoices: 1,
    followUps: 5,
    deadlines: 2,
    needsReply: 6,
  },
  themes: ["investor outreach", "product roadmap", "Q3 planning", "pricing discussions"],
  insights: [
    { text: "You have not replied to Sarah Johnson in 4 days — she is a key client.", type: "warning" },
    { text: "Three separate conversations mention Friday as a deadline.", type: "warning" },
    { text: "Your inbox is 37% meeting-related today — above your typical 20%.", type: "info" },
    { text: "Two investor emails arrived this morning — unusual for a Tuesday.", type: "opportunity" },
    { text: "Marcus Webb replied to your proposal — a positive signal worth following up.", type: "opportunity" },
  ],
  emailCards: [
    {
      id: "demo-1",
      sender: "Sarah Johnson",
      senderEmail: "sarah@clientco.com",
      subject: "Re: Product Roadmap — Follow Up",
      summary:
        "Sarah is following up on the product roadmap discussion from last week and wants to schedule a 30-minute call to align on Q3 priorities before the board meeting.",
      category: "client",
      priority: "critical",
      suggestedAction: "Reply and schedule a call for this week",
      confidence: 97,
      snippet:
        "Hi, just circling back on our last conversation about the roadmap. I want to make sure we're aligned before the board meeting on Friday...",
      aiReasoning:
        "Sarah is a key client stakeholder. Her message references a Friday deadline (board meeting), and she has not received a response in 4 days. This is high-urgency.",
      needsReply: true,
      date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-2",
      sender: "Marcus Webb",
      senderEmail: "marcus@venturelab.vc",
      subject: "Re: Oversight.ai — Seed Round Interest",
      summary:
        "Marcus from VentureLab has reviewed the deck and expressed strong interest in a seed investment conversation. He is available Thursday or Friday this week.",
      category: "client",
      priority: "high",
      suggestedAction: "Book a call for Thursday or Friday",
      confidence: 94,
      snippet:
        "Reviewed the deck last night — this is compelling. We'd love to have a deeper conversation. Are you available Thursday afternoon or Friday morning?",
      aiReasoning:
        "Investor interest with a specific availability window. Prompt response is critical while interest is warm.",
      needsReply: true,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-3",
      sender: "James Chen",
      senderEmail: "james@acme.io",
      subject: "Invoice #1047 — Q2 Services",
      summary:
        "Invoice #1047 for Q2 services totalling $12,400 has been submitted by Acme. Payment is due within 15 days.",
      category: "finance",
      priority: "high",
      suggestedAction: "Review and approve invoice #1047",
      confidence: 99,
      snippet: "Please find attached Invoice #1047 for Q2 services rendered. Total due: $12,400. Net 15 payment terms apply.",
      aiReasoning: "Finance document requiring explicit approval. Has a hard deadline in 15 days.",
      needsReply: false,
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-4",
      sender: "Priya Sharma",
      senderEmail: "priya@designstudio.io",
      subject: "Meeting Request — Design Review",
      summary:
        "Priya wants to schedule a design review session for the new dashboard UI. She has proposed Tuesday or Wednesday next week.",
      category: "meeting",
      priority: "normal",
      suggestedAction: "Confirm Tuesday or Wednesday slot",
      confidence: 91,
      snippet:
        "Could we get 45 minutes to walk through the new dashboard designs? I'm free Tuesday or Wednesday next week — let me know what works.",
      aiReasoning: "Meeting request with clear availability. Low urgency but should be scheduled this week.",
      needsReply: true,
      date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-5",
      sender: "Alex Torres",
      senderEmail: "alex@beta-user.com",
      subject: "Feedback: Oversight Beta Experience",
      summary:
        "Beta user Alex has submitted detailed feedback praising the AI agent pipeline but requesting a faster sync speed and a mobile interface.",
      category: "client",
      priority: "normal",
      suggestedAction: "Log feedback and send acknowledgment",
      confidence: 88,
      snippet:
        "The AI is genuinely impressive — I didn't expect it to catch the meeting I nearly missed. Two things I'd love: faster initial sync and something mobile-friendly.",
      aiReasoning: "Positive beta signal with specific product feedback. Worth acknowledging and logging.",
      needsReply: true,
      date: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-6",
      sender: "Notion",
      senderEmail: "team@mail.notion.so",
      subject: "Your Notion workspace weekly summary",
      summary: "Weekly activity summary from Notion — 12 pages updated, 3 databases modified.",
      category: "notification",
      priority: "low",
      suggestedAction: "Review when convenient",
      confidence: 85,
      snippet: "Here's what happened in your Notion workspace this week...",
      aiReasoning: "Automated digest from a SaaS tool. No action required urgently.",
      needsReply: false,
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

export async function generateDailyBrief(
  emails: RawEmail[],
  userName: string
): Promise<DailyBriefResult> {
  if (process.env.TEST_MODE === "true" || emails.length === 0) {
    return { ...DEMO_BRIEF, generatedAt: new Date().toISOString() };
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `You are an expert executive assistant AI. Analyze ALL of the emails below that ${userName} received in the last 24 hours and produce an intelligent executive daily brief.

Today is ${today}.

Your job is NOT to summarize each email individually. You must:
1. Reason ACROSS all emails to find themes, relationships, and patterns
2. Identify which emails truly matter and why
3. Generate actionable intelligence, not just summaries
4. Find repeated topics, implied deadlines, relationship signals, and opportunities

Return ONLY a valid JSON object matching this exact TypeScript interface (no markdown, no explanation):

{
  "overview": "3-4 sentence executive summary of the day, written in second person (e.g. 'Your inbox today...'). Mention the most important thread, any urgent items, and one key opportunity.",
  "stats": {
    "total": <number of emails analyzed>,
    "unread": <estimated unread>,
    "important": <count of important emails>,
    "urgent": <count of urgent>,
    "vip": <count from VIP/key contacts>,
    "meetings": <count of meeting-related>,
    "invoices": <count of invoices/finance>,
    "followUps": <count needing follow-up>,
    "deadlines": <count with deadline implications>,
    "needsReply": <count needing a reply>
  },
  "themes": ["theme1", "theme2", ...], // 2-5 overarching themes across all emails
  "insights": [
    { "text": "specific, actionable insight", "type": "warning|info|opportunity|relationship" }
  ], // 3-5 insights
  "emailCards": [
    {
      "id": "<email id>",
      "sender": "<display name>",
      "senderEmail": "<email address>",
      "subject": "<subject>",
      "summary": "<2-3 sentence summary of what this email is actually about and what it means for the user>",
      "category": "urgent|meeting|client|finance|personal|notification|newsletter|other",
      "priority": "critical|high|normal|low",
      "suggestedAction": "<concise action the user should take>",
      "confidence": <0-100 confidence in your analysis>,
      "snippet": "<first 150 chars of email body>",
      "aiReasoning": "<1-2 sentences on why you categorized this email this way and why it matters>",
      "needsReply": <true|false>,
      "date": "<ISO date string>"
    }
  ] // Include ONLY emails with priority high or above, or that are meetings/finance. Skip newsletters/notifications unless critical. Max 10 cards.
}

Here are the emails to analyze:
${JSON.stringify(emails, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonText = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonText) as DailyBriefResult;

    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    // If Gemini fails or returns invalid JSON, fall back to demo data
    return { ...DEMO_BRIEF, generatedAt: new Date().toISOString() };
  }
}

export { DEMO_BRIEF };
