import { ContactProfile } from "@/types/actions";

import { kv } from '@vercel/kv';

export async function getContactProfile(email: string): Promise<ContactProfile | null> {
  if (!kv) return null;
  try {
    const profile = await kv.get(`contact:${email.toLowerCase()}`);
    return (profile as ContactProfile) || null;
  } catch (error) {
    console.warn(`[contact-store] Failed to fetch profile for ${email}`, error);
    return null;
  }
}

export async function getContactProfiles(emails: string[]): Promise<Map<string, ContactProfile>> {
  const map = new Map<string, ContactProfile>();
  if (!kv || emails.length === 0) return map;

  try {
    const keys = emails.map(e => `contact:${e.toLowerCase()}`);
    const results = (await kv.mget(...keys)) as (ContactProfile | null)[];
    
    results.forEach((profile) => {
      if (profile && profile.email) {
        map.set(profile.email.toLowerCase(), profile);
      }
    });
  } catch (error) {
    console.warn(`[contact-store] Failed to fetch multiple profiles`, error);
  }
  return map;
}

export async function isVipContact(email: string): Promise<boolean> {
  const profile = await getContactProfile(email);
  return profile?.tier === "vip";
}
