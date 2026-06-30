# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> Landing Page >> should load and display hero content
- Location: tests/e2e/landing.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /Sign up/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /Sign up/i })

```

```yaml
- main:
  - navigation:
    - text: Oversight
    - link "Interactive Demo":
      - /url: /demo
    - button "Log In"
  - text: Loading Logo... Oversight 2.0 is Live
  - heading "Never drop a commitment. Ever again." [level=1]
  - paragraph: An autonomous intelligence layer that monitors your inbox, detects commitments, and stages actions for your 1-click approval.
  - button "🚀 Connect Google Workspace Uses your real data"
  - link "▶ Try Interactive Demo Instant • No sign-in required":
    - /url: /demo
  - text: Built with Google Gemini • Google Workspace • Next.js • AI Agents
  - heading "The Status Quo" [level=2]
  - paragraph: Your inbox wasn't built for modern workflows.
  - heading "Email Overload" [level=3]
  - paragraph: Hundreds of messages a day drown out the signal. The important requests get buried under newsletters and cc's.
  - heading "Missed Follow-ups" [level=3]
  - paragraph: Promises to &apos;get back to you next week&apos; are easily forgotten, damaging client trust and losing deals.
  - heading "Scheduling Conflicts" [level=3]
  - paragraph: Double-booking VIPs or missing travel itineraries leads to logistical nightmares and apologies.
  - heading "Cognitive Load" [level=3]
  - paragraph: The constant anxiety of &apos;Did I forget something?&apos; drains your energy and prevents deep, focused work.
  - heading "The Solution" [level=2]
  - heading "An intelligence layer that works for you." [level=3]
  - paragraph: Oversight continuously monitors your Gmail and Calendar, understands conversations, detects commitments, drafts actions, schedules meetings, and prepares everything for your approval.
  - text: Understands context, not just keywords. Learns your relationships and priorities. Nothing happens without your explicit approval. AI Drafted Reply Ready for review
  - paragraph: "\"I've drafted a response confirming the 2PM meeting and added it to your calendar.\""
  - button "Approve"
  - button "Edit"
  - heading "Interactive Workflow" [level=2]
  - heading "How it works in practice." [level=3]
  - heading "Email Arrives" [level=4]
  - paragraph: A client asks for a meeting next Tuesday.
  - heading "AI Reads Context" [level=4]
  - paragraph: Agent retrieves previous conversations with this client.
  - heading "AI Understands" [level=4]
  - paragraph: Recognizes the VIP status and urgency.
  - heading "Calendar Checked" [level=4]
  - paragraph: Agent cross-references your real-time availability.
  - heading "Action Drafted" [level=4]
  - paragraph: A reply and calendar invite are prepared.
  - heading "User Approves" [level=4]
  - paragraph: You click one button to approve.
  - heading "Done" [level=4]
  - paragraph: Email sent, calendar updated. Zero effort.
  - heading "Live Intelligence" [level=2]
  - heading "Total transparency. Zero confusion." [level=3]
  - paragraph: The biggest problem with AI is the "black box." Our Live Intelligence Layer constantly explains what the AI is doing, why it's doing it, and what happens next—in plain English.
  - paragraph: You never have to wonder if the system is working, if it missed something, or if it made a mistake. It feels like having a world-class Chief of Staff whispering in your ear.
  - text: Reasoning Just now
  - paragraph: Cross-checking your calendar...
  - paragraph: "\"Making sure the suggested 2PM slot doesn't conflict with your board meeting.\""
  - text: Completed
  - paragraph: Everything important has been reviewed.
  - heading "Multi-Agent Architecture" [level=2]
  - heading "A swarm of specialized AI working in perfect harmony." [level=3]
  - heading "Planner" [level=4]
  - paragraph: Figures out what work needs to be done.
  - paragraph: Breaks down your inbox into discrete, parallel tasks.
  - heading "Memory" [level=4]
  - paragraph: Remembers previous conversations.
  - paragraph: Retrieves context, preferences, and relationships.
  - heading "Context" [level=4]
  - paragraph: Reads the full email thread.
  - paragraph: Understands the nuance of long, messy chains.
  - heading "Reasoning" [level=4]
  - paragraph: Understands what the sender actually wants.
  - paragraph: Detects hidden intents and implied commitments.
  - heading "Verification" [level=4]
  - paragraph: Double checks before making recommendations.
  - paragraph: Ensures no conflicts and absolute safety.
  - heading "Execution" [level=4]
  - paragraph: Prepares actions for your approval.
  - paragraph: Stages calendar events and drafts replies.
  - heading "Technology Stack" [level=2]
  - heading "Built on giants." [level=3]
  - heading "Google Gemini" [level=4]
  - paragraph: State-of-the-art multimodal reasoning.
  - heading "Google Workspace API" [level=4]
  - paragraph: Native, deep integration with Gmail and Calendar.
  - heading "Google OAuth" [level=4]
  - paragraph: Enterprise-grade security and authentication.
  - heading "Next.js" [level=4]
  - paragraph: Lightning-fast, server-rendered React framework.
  - heading "TypeScript" [level=4]
  - paragraph: Type-safe, reliable architecture.
  - heading "TailwindCSS" [level=4]
  - paragraph: Pixel-perfect, utility-first styling.
  - heading "Framer Motion" [level=4]
  - paragraph: Fluid, 60fps micro-animations.
  - heading "Vercel" [level=4]
  - paragraph: Global edge network deployment.
  - heading "Enterprise Grade Security" [level=2]
  - heading "Your data is yours. Period." [level=3]
  - heading "Explicit Consent" [level=4]
  - paragraph: No email is sent and no calendar event is created without you clicking 'Approve'.
  - heading "OAuth Powered" [level=4]
  - paragraph: Zero passwords stored. We use secure Google OAuth tokens that can be revoked anytime.
  - heading "Private by Design" [level=4]
  - paragraph: Data is analyzed exclusively for your workflows and is never used to train global models.
  - heading "Undo Support" [level=4]
  - paragraph: Accidentally approved? You have 5 seconds to undo any action before it hits the network.
  - heading "Features" [level=2]
  - heading "Everything you need. Nothing you don't." [level=3]
  - text: AI Inbox Analysis Meeting Scheduling Draft Replies Follow-up Detection Conflict Detection VIP Recognition Context Awareness Approval Queue Undo Support Live Intelligence Interactive Demo
  - heading "Interactive Demo" [level=2]
  - heading "Don't take our word for it. Experience it yourself." [level=3]
  - paragraph: We built a fully interactive demo using realistic data. See the AI reason, approve actions, watch the Live Intelligence Layer, and experience the UI—without signing in.
  - link "Launch Interactive Demo Takes exactly 60 seconds":
    - /url: /demo
  - heading "Why Oversight Wins" [level=2]
  - heading "The ROI of Executive AI." [level=3]
  - text: 40% Less Cognitive Load
  - paragraph: Stop stressing about what you forgot.
  - text: 10h Saved per Month
  - paragraph: Automating routine follow-ups and scheduling.
  - text: 0 Missed Commitments
  - paragraph: Every thread is tracked until resolved.
  - text: 100% Transparency
  - paragraph: Live Intelligence explains every action.
  - text: For the Judges
  - heading "Why Oversight deserves to win." [level=3]
  - paragraph: We didn't just build a wrapper around an LLM. We built a production-ready, highly complex agentic system—and then we wrapped it in an obsessive, enterprise-grade UX.
  - heading "Google Technologies Used" [level=4]
  - paragraph: Powered natively by Gemini, Google Workspace APIs, and Google OAuth.
  - heading "Agentic AI" [level=4]
  - paragraph: A complex multi-agent pipeline (Planner, Memory, Context, Reasoning, Verification, Execution) acting autonomously.
  - heading "Human-in-the-Loop" [level=4]
  - paragraph: Radically safe UX. The AI stages everything, but the user must click 'Approve'. Zero hallucination risk.
  - heading "Production Architecture" [level=4]
  - paragraph: Deployed on Vercel Edge with Next.js, Upstash Redis KV, Server-Sent Events, and a highly concurrent backend.
  - heading "Trust & Transparency" [level=4]
  - paragraph: The Live Intelligence Layer solves the 'AI Black Box' problem by explaining every step in plain English.
  - heading "Enterprise UX" [level=4]
  - paragraph: Premium, motion-rich design (Linear/Cursor tier) proving that AI apps don't have to look like chatbots.
  - heading "FAQ" [level=2]
  - heading "Frequently Asked Questions" [level=3]
  - heading "How does it work?" [level=4]
  - heading "Does AI send emails automatically?" [level=4]
  - heading "Can I undo an action?" [level=4]
  - heading "Is my data private?" [level=4]
  - heading "How accurate is the AI?" [level=4]
  - heading "Why Google Workspace?" [level=4]
  - heading "How does Live Intelligence work?" [level=4]
  - heading "Ready to stop dropping important work?" [level=2]
  - button "Connect Google Workspace"
  - link "Try Interactive Demo":
    - /url: /demo
  - link "GitHub":
    - /url: https://github.com/google/gemini
  - link "Architecture":
    - /url: https://ai.google.dev/
  - link "Documentation":
    - /url: https://ai.google.dev/docs
  - text: © 2026 Oversight AI. All rights reserved. Built for the Google AI Hackathon.
- region "Live Intelligence Layer":
  - paragraph: Monitoring quietly in the background.
  - paragraph: Nothing is sent automatically. You always stay in control.
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | 
  4  | test.describe('Landing Page', () => {
  5  |   test('should load and display hero content', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     
  8  |     // Verify core text is visible
  9  |     await expect(page.getByText('Oversight', { exact: true })).toBeVisible();
  10 |     await expect(page.getByText('Never drop a commitment')).toBeVisible();
  11 |     
  12 |     // The "Sign up" button
  13 |     const getStartedBtn = page.getByRole('button', { name: /Sign up/i });
> 14 |     await expect(getStartedBtn).toBeVisible();
     |                                 ^ Error: expect(locator).toBeVisible() failed
  15 |   });
  16 | 
  17 |   test('should pass accessibility checks', async ({ page }) => {
  18 |     await page.goto('/');
  19 |     // Disable color-contrast check if the design uses subtle colors that fail strictly but are approved
  20 |     const accessibilityScanResults = await new AxeBuilder({ page })
  21 |       .disableRules(['color-contrast']) 
  22 |       .analyze();
  23 |     expect(accessibilityScanResults.violations).toEqual([]);
  24 |   });
  25 | 
  26 | });
  27 | 
```