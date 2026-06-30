import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai";
import { ContactProfile, RelationshipTier } from "@/types/actions";
import { EmailContext } from "@/lib/google/contact-history";
import { env } from "@/lib/env";

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "profile_contact",
        description: "Build a relationship profile for an email contact based on conversation history.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: {
              type: SchemaType.STRING,
              description: "Full name inferred from email signature or headers",
            },
            organization: {
              type: SchemaType.STRING,
              description: "Company or domain they represent",
            },
            relationshipSummary: {
              type: SchemaType.STRING,
              description: "Exactly 2 sentences — who this person is to the user and what they typically discuss",
            },
            tier: {
              type: SchemaType.STRING,
              description: "Relationship tier (must be exactly one of: 'vip', 'regular', 'unknown')",
            },
            typicalResponseUrgency: {
              type: SchemaType.STRING,
              description: "Urgency of their correspondence (must be exactly one of: 'high', 'medium', 'low')",
            },
            keyTopics: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "2-4 recurring topics from the threads",
            },
            totalEmailsExchanged: {
              type: SchemaType.NUMBER,
              description: "Total count of emails from the provided history",
            },
          },
          required: [
            "name",
            "organization",
            "relationshipSummary",
            "tier",
            "typicalResponseUrgency",
            "keyTopics",
            "totalEmailsExchanged",
          ],
        },
      },
    ],
  },
];

export async function buildContactProfile(
  senderEmail: string,
  senderName: string,
  emailThread: EmailContext[]
): Promise<ContactProfile> {
  const defaultProfile: ContactProfile = {
    email: senderEmail,
    name: senderName || senderEmail,
    organization: "Unknown",
    relationshipSummary: "Insufficient data to build a profile.",
    tier: "unknown",
    typicalResponseUrgency: "low",
    keyTopics: [],
    totalEmailsExchanged: emailThread.length,
    lastContactedAt:
      emailThread.length > 0
        ? emailThread[emailThread.length - 1].date
        : new Date().toISOString(),
    profileBuiltAt: new Date().toISOString(),
  };

  if (emailThread.length < 2) {
    return defaultProfile;
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are building a relationship intelligence profile for a professional email contact. Analyze the provided email thread history between the user and this contact. Assess the nature of the relationship, its importance, and the typical urgency of their correspondence. Be specific and precise. Do not generalize. Call the profile_contact tool with your findings. If there is insufficient data to profile this contact (fewer than 2 emails), still call the tool but set tier to 'unknown' and urgency to 'low'.`,
    tools,
  });

  const prompt = `Contact email: ${senderEmail}\nContact name (from headers): ${senderName}\nEmail history with this contact (${
    emailThread.length
  } emails):\n\n${JSON.stringify(emailThread, null, 2)}\n\nBuild a relationship profile for this contact.`;

  try {
    const result = await model.generateContent(prompt);
    const functionCall = result.response.functionCalls()?.[0];

    if (functionCall && functionCall.name === "profile_contact") {
      const args = functionCall.args as {
        name?: string;
        organization: string;
        relationshipSummary: string;
        tier: string;
        typicalResponseUrgency: string;
        keyTopics?: string[];
        totalEmailsExchanged?: number;
      };
      return {
        email: senderEmail,
        name: args.name || senderName || senderEmail,
        organization: args.organization,
        relationshipSummary: args.relationshipSummary,
        tier: args.tier as RelationshipTier,
        typicalResponseUrgency: args.typicalResponseUrgency as "high" | "medium" | "low",
        keyTopics: args.keyTopics || [],
        totalEmailsExchanged: args.totalEmailsExchanged ?? emailThread.length,
        lastContactedAt:
          emailThread.length > 0
            ? emailThread[emailThread.length - 1].date
            : new Date().toISOString(),
        profileBuiltAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error(`[contact-profiler] Failed to profile ${senderEmail}:`, error);
  }

  return defaultProfile;
}
