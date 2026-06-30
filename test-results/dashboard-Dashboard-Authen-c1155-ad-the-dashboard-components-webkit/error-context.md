# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard (Authenticated) >> should load the dashboard components
- Location: tests/e2e/dashboard.spec.ts:31:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Follow up: Seed Round').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Follow up: Seed Round').first()

```

```yaml
- banner:
  - link "Oversight Logo Oversight|":
    - /url: /
    - img "Oversight Logo"
    - text: Oversight|
  - text: Live Mode Connected to Google Workspace
  - img "QA Test User"
  - text: QA Test User
  - button "Sign out"
- main:
  - text: Today's Brief
  - heading "Good night, QA" [level=2]
  - paragraph: Here's what happened in the last 24 hours
  - text: Updated 0m ago
  - button "Refresh"
  - text: 43 Emails 8 Important 3 Urgent 3 Meetings 1 Invoices 6 Needs Reply 5 Follow-ups Executive Summary
  - paragraph: Today was dominated by investor conversations and client follow-ups. Three people requested meetings, one invoice requires your approval, and two clients are waiting for replies that are now overdue. No scheduling conflicts were detected for your upcoming week.
  - text: investor outreach product roadmap Q3 planning pricing discussions AI Insights You have not replied to Sarah Johnson in 4 days — she is a key client. Three separate conversations mention Friday as a deadline. Your inbox is 37% meeting-related today — above your typical 20%. Two investor emails arrived this morning — unusual for a Tuesday. Marcus Webb replied to your proposal — a positive signal worth following up. Important Emails 6 shown
  - textbox "Search by sender, subject, or keyword..."
  - button "All"
  - button "Urgent"
  - button "Important"
  - button "Meetings"
  - button "Finance"
  - button "Needs Reply"
  - 'button "S Sarah Johnson sarah@clientco.com 4h ago Re: Product Roadmap — Follow Up Sarah is following up on the product roadmap discussion from last week and wants to schedule a 30-minute call to align on Q3 priorities before the board meeting. Client CRITICAL Needs Reply 97% confidence"':
    - text: S Sarah Johnson sarah@clientco.com 4h ago
    - paragraph: "Re: Product Roadmap — Follow Up"
    - paragraph: Sarah is following up on the product roadmap discussion from last week and wants to schedule a 30-minute call to align on Q3 priorities before the board meeting.
    - text: Client CRITICAL Needs Reply 97% confidence
  - text: Reply and schedule a call for this week
  - 'button "M Marcus Webb marcus@venturelab.vc 2h ago Re: Oversight.ai — Seed Round Interest Marcus from VentureLab has reviewed the deck and expressed strong interest in a seed investment conversation. He is available Thursday or Friday this week. Client HIGH Needs Reply 94% confidence"':
    - text: M Marcus Webb marcus@venturelab.vc 2h ago
    - paragraph: "Re: Oversight.ai — Seed Round Interest"
    - paragraph: Marcus from VentureLab has reviewed the deck and expressed strong interest in a seed investment conversation. He is available Thursday or Friday this week.
    - text: Client HIGH Needs Reply 94% confidence
  - text: Book a call for Thursday or Friday
  - 'button "J James Chen james@acme.io 5h ago Invoice #1047 — Q2 Services Invoice #1047 for Q2 services totalling $12,400 has been submitted by Acme. Payment is due within 15 days. Finance HIGH 99% confidence"':
    - text: J James Chen james@acme.io 5h ago
    - paragraph: "Invoice #1047 — Q2 Services"
    - paragraph: "Invoice #1047 for Q2 services totalling $12,400 has been submitted by Acme. Payment is due within 15 days."
    - text: Finance HIGH 99% confidence
  - text: "Review and approve invoice #1047"
  - button "P Priya Sharma priya@designstudio.io 8h ago Meeting Request — Design Review Priya wants to schedule a design review session for the new dashboard UI. She has proposed Tuesday or Wednesday next week. Meeting NORMAL Needs Reply 91% confidence":
    - text: P Priya Sharma priya@designstudio.io 8h ago
    - paragraph: Meeting Request — Design Review
    - paragraph: Priya wants to schedule a design review session for the new dashboard UI. She has proposed Tuesday or Wednesday next week.
    - text: Meeting NORMAL Needs Reply 91% confidence
  - text: Confirm Tuesday or Wednesday slot
  - 'button "A Alex Torres alex@beta-user.com 10h ago Feedback: Oversight Beta Experience Beta user Alex has submitted detailed feedback praising the AI agent pipeline but requesting a faster sync speed and a mobile interface. Client NORMAL Needs Reply 88% confidence"':
    - text: A Alex Torres alex@beta-user.com 10h ago
    - paragraph: "Feedback: Oversight Beta Experience"
    - paragraph: Beta user Alex has submitted detailed feedback praising the AI agent pipeline but requesting a faster sync speed and a mobile interface.
    - text: Client NORMAL Needs Reply 88% confidence
  - text: Log feedback and send acknowledgment
  - button "N Notion team@mail.notion.so 12h ago Your Notion workspace weekly summary Weekly activity summary from Notion — 12 pages updated, 3 databases modified. Notification LOW 85% confidence":
    - text: N Notion team@mail.notion.so 12h ago
    - paragraph: Your Notion workspace weekly summary
    - paragraph: Weekly activity summary from Notion — 12 pages updated, 3 databases modified.
    - text: Notification LOW 85% confidence
  - text: Review when convenient
  - paragraph: Auto-refreshes every 15 minutes · Generated by Gemini 2.5 Flash
  - text: Action Queue
  - heading "1 items need attention" [level=1]
  - text: Live Sync
  - paragraph: "\"\""
  - paragraph: Draft email to investor@example.com
  - paragraph: Hi, Just following up on our seed round discussion. Best, Oversight
  - button "Approve"
  - button "Reject"
- region "Live Intelligence Layer":
  - paragraph: Everything important has been reviewed.
  - paragraph: No scheduling conflicts detected. Inbox analyzed.
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Dashboard (Authenticated)', () => {
  4  |   // Use a global setup or beforeEach to authenticate
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // 1. Go to sign-in page
  7  |     await page.goto('/api/auth/signin');
  8  | 
  9  |     // 2. Click on the Credentials (Test Auth) provider sign in form
  10 |     // NextAuth automatically generates a form for the credentials provider
  11 |     const usernameInput = page.locator('input[name="username"]');
  12 |     const passwordInput = page.locator('input[name="password"]');
  13 |     const signInButton = page.locator('button:has-text("Sign in with Test Auth")');
  14 | 
  15 |     // If TEST_MODE is working, this form will be visible
  16 |     await expect(usernameInput).toBeVisible({ timeout: 10000 });
  17 |     
  18 |     // 3. Login
  19 |     await usernameInput.fill('testuser');
  20 |     await passwordInput.fill('testpass');
  21 |     await signInButton.click();
  22 | 
  23 |     // 4. Verify we are redirected to the homepage or dashboard
  24 |     await page.waitForURL('**/');
  25 |     await page.goto('/dashboard');
  26 |     
  27 |     // Check for dashboard skeleton or main UI
  28 |     await expect(page.getByText('QA Test User')).toBeVisible({ timeout: 15000 });
  29 |   });
  30 | 
  31 |   test('should load the dashboard components', async ({ page }) => {
  32 |     // Ensure we are actually on the dashboard
  33 |     await expect(page).toHaveURL(/.*dashboard/);
  34 | 
  35 |     // Debugging: Log what's on the page if we fail
  36 |     try {
> 37 |       await expect(page.getByText('Follow up: Seed Round').first()).toBeVisible({ timeout: 5000 });
     |                                                                     ^ Error: expect(locator).toBeVisible() failed
  38 |     } catch (e) {
  39 |       console.log("PAGE TEXT CONTENT ON FAILURE:", await page.locator('body').innerText());
  40 |       throw e;
  41 |     }
  42 |     
  43 |     await expect(page.getByRole('button', { name: /Approve/i }).first()).toBeVisible({ timeout: 5000 });
  44 |   });
  45 | });
  46 | 
```