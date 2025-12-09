/**
 * Username validation utilities
 * Rules: 3-20 characters, alphanumeric + _ . / -, case-insensitive, reserved words filter
 */

// Reserved words that cannot be used as usernames
const RESERVED_WORDS = new Set([
  // System/admin words
  'admin', 'administrator', 'root', 'system', 'support', 'help',
  // API/system routes
  'api', 'www', 'www1', 'www2', 'www3', 'www4', 'www5', 'www6', 'www7', 'www8', 'www9',
  // Common service names
  'mail', 'email', 'webmaster', 'postmaster', 'noreply', 'no-reply',
  // Common page names
  'about', 'contact', 'terms', 'privacy', 'login', 'signup', 'signin', 'signout', 'logout',
  'settings', 'profile', 'dashboard', 'home', 'index', 'search', 'explore',
  // Technical terms
  'null', 'undefined', 'true', 'false', 'test', 'demo', 'staging', 'production', 'localhost',
  'dev', 'development', 'prod', 'beta', 'alpha', 'v1', 'v2', 'v3',
  // App-specific reserved words
  'todos', 'notes', 'achievements', 'goals', 'stakes', 'wallet', 'rewards', 'penalties',
  'invite', 'invitation', 'user', 'users', 'account', 'accounts',
  // Common social terms
  'follow', 'following', 'followers', 'like', 'likes', 'share', 'shares',
]);

// Username validation regex: 3-20 chars, alphanumeric + _ . / -
const USERNAME_REGEX = /^[a-zA-Z0-9._/-]{3,20}$/;

export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Sanitizes username input by trimming and converting to lowercase
 */
export function sanitizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/**
 * Checks if a word is in the reserved words list
 */
export function isReservedWord(username: string): boolean {
  const normalized = sanitizeUsername(username);
  return RESERVED_WORDS.has(normalized);
}

/**
 * Validates username format and rules
 */
export function validateUsername(username: string): UsernameValidationResult {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Username cannot be empty' };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Username must be no more than 20 characters' };
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and characters: _ . / -',
    };
  }

  if (isReservedWord(trimmed)) {
    return { valid: false, error: 'This username is reserved and cannot be used' };
  }

  // Check for consecutive special characters (optional enhancement)
  if (/[._/-]{2,}/.test(trimmed)) {
    return {
      valid: false,
      error: 'Username cannot contain consecutive special characters',
    };
  }

  // Check if starts or ends with special character
  if (/^[._/-]|[._/-]$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Username cannot start or end with special characters',
    };
  }

  return { valid: true };
}

/**
 * Gets username validation rules as a human-readable string
 */
export function getUsernameRules(): string {
  return '3-20 characters, letters, numbers, and _ . / - allowed. Cannot start or end with special characters.';
}

