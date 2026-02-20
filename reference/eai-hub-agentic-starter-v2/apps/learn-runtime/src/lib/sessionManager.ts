/**
 * Centralized Session Management for EvAI v20
 * Ensures consistent sessionId across all modules (NGBSE, HITL, Auto-Healing, Flow Logging)
 */

let currentSessionId: string | null = null;

/**
 * Generates a new session ID or returns existing one
 */
export function getOrCreateSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `evai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 New session created:', currentSessionId);
  }
  return currentSessionId;
}

/**
 * Explicitly creates a new session (e.g., on conversation start)
 */
export function createNewSession(): string {
  currentSessionId = `evai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log('🆔 Session created:', currentSessionId);
  return currentSessionId;
}

/**
 * Gets current session ID without creating new one
 */
export function getCurrentSessionId(): string | null {
  return currentSessionId;
}

/**
 * Clears current session (e.g., on logout or conversation reset)
 */
export function clearSession(): void {
  console.log('🆔 Session cleared:', currentSessionId);
  currentSessionId = null;
}
