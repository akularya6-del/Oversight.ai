export type ActionType = "draft_email" | "schedule_event";

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

export type EventPayload = {
  title: string;
  startDateTime: string; // ISO 8601
  endDateTime: string; // ISO 8601
  attendees: string[];
};

export type RelationshipTier = "vip" | "regular" | "unknown";

export type ContactProfile = {
  email: string;
  name: string;
  organization: string;
  relationshipSummary: string;
  tier: RelationshipTier;
  typicalResponseUrgency: "high" | "medium" | "low";
  keyTopics: string[];
  totalEmailsExchanged: number;
  lastContactedAt: string; // ISO 8601
  profileBuiltAt: string; // ISO 8601
};

export type StagedAction = {
  id: string; // crypto.randomUUID()
  type: ActionType;
  reasoning: string; // Gemini explains WHY it flagged this
  payload: EmailPayload | EventPayload;
  status: "pending_approval" | "executing" | "completed" | "dismissed";
  priority?: "high" | "normal";
  senderProfile?: ContactProfile;
};

export type PendingFollowup = {
  id: string;                  // crypto.randomUUID()
  threadId: string;            // Gmail thread ID from the send response
  messageId: string;           // Gmail message ID of the sent email
  originalSubject: string;
  originalTo: string;
  sentAt: string;              // ISO 8601
  checkAfter: string;          // ISO 8601 — sentAt + 24 hours
  status: 'waiting' | 'reply_found' | 'no_reply' | 'actioned';
};

export type FollowupInsight = {
  id: string;
  threadId: string;
  originalSubject: string;
  replyFrom: string;
  replySnippet: string;        // first 300 chars of reply body
  detectedAt: string;          // ISO 8601
  proposedAction: StagedAction | null; // Gemini's proposed Calendar event, or null
};
