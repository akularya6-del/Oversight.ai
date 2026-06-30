import { getContactProfile, getContactProfiles, isVipContact } from './contact-store';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Vercel KV
const mockKvGet = vi.fn();
const mockKvMget = vi.fn();

vi.mock('@vercel/kv', () => {
  return {
    kv: {
      get: (...args: any[]) => mockKvGet(...args),
      mget: (...args: any[]) => mockKvMget(...args),
    },
  };
});

describe('contact-store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getContactProfile', () => {
    it('returns the profile if it exists', async () => {
      const mockProfile = { email: 'test@example.com', name: 'Test User', tier: 'regular' };
      mockKvGet.mockResolvedValueOnce(mockProfile);

      const result = await getContactProfile('test@example.com');
      
      expect(mockKvGet).toHaveBeenCalledWith('contact:test@example.com');
      expect(result).toEqual(mockProfile);
    });

    it('returns null if profile is not found', async () => {
      mockKvGet.mockResolvedValueOnce(null);

      const result = await getContactProfile('unknown@example.com');
      
      expect(mockKvGet).toHaveBeenCalledWith('contact:unknown@example.com');
      expect(result).toBeNull();
    });

    it('handles kv.get failures gracefully', async () => {
      mockKvGet.mockRejectedValueOnce(new Error('KV connection error'));

      const result = await getContactProfile('error@example.com');
      
      expect(mockKvGet).toHaveBeenCalledWith('contact:error@example.com');
      expect(result).toBeNull();
    });
  });

  describe('getContactProfiles', () => {
    it('returns a map of profiles for existing emails', async () => {
      const mockProfile1 = { email: 'user1@example.com', name: 'User 1' };
      const mockProfile2 = { email: 'user2@example.com', name: 'User 2' };
      mockKvMget.mockResolvedValueOnce([mockProfile1, null, mockProfile2]);

      const emails = ['user1@example.com', 'unknown@example.com', 'user2@example.com'];
      const result = await getContactProfiles(emails);
      
      expect(mockKvMget).toHaveBeenCalledWith(
        'contact:user1@example.com',
        'contact:unknown@example.com',
        'contact:user2@example.com'
      );
      expect(result.size).toBe(2);
      expect(result.get('user1@example.com')).toEqual(mockProfile1);
      expect(result.get('user2@example.com')).toEqual(mockProfile2);
      expect(result.has('unknown@example.com')).toBe(false);
    });

    it('returns an empty map when emails array is empty', async () => {
      const result = await getContactProfiles([]);
      expect(mockKvMget).not.toHaveBeenCalled();
      expect(result.size).toBe(0);
    });

    it('handles kv.mget failures gracefully', async () => {
      mockKvMget.mockRejectedValueOnce(new Error('KV connection error'));

      const result = await getContactProfiles(['user@example.com']);
      expect(result.size).toBe(0);
    });
  });

  describe('isVipContact', () => {
    it('returns true if contact is VIP tier', async () => {
      mockKvGet.mockResolvedValueOnce({ tier: 'vip' });
      const result = await isVipContact('vip@example.com');
      expect(result).toBe(true);
    });

    it('returns false if contact is not VIP tier', async () => {
      mockKvGet.mockResolvedValueOnce({ tier: 'regular' });
      const result = await isVipContact('regular@example.com');
      expect(result).toBe(false);
    });

    it('returns false if contact does not exist', async () => {
      mockKvGet.mockResolvedValueOnce(null);
      const result = await isVipContact('unknown@example.com');
      expect(result).toBe(false);
    });
  });
});
