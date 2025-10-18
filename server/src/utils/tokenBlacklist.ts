// Simple in-memory token blacklist
// In production, use Redis or database
const blacklistedTokens = new Set<string>();

export const tokenBlacklist = {
  add: (token: string) => {
    blacklistedTokens.add(token);
  },
  
  has: (token: string): boolean => {
    return blacklistedTokens.has(token);
  },
  
  clear: () => {
    blacklistedTokens.clear();
  },
  
  size: (): number => {
    return blacklistedTokens.size;
  }
};