let currentUserId: string | null = null

export function setCurrentUserId(userId: string | null): void {
  currentUserId = userId
}

export function getCurrentUserId(): string | null {
  return currentUserId
}

export function requireCurrentUserId(): string {
  if (!currentUserId) {
    throw new Error('Not signed in')
  }
  return currentUserId
}

/** Test helper */
export function resetCurrentUserForTests(): void {
  currentUserId = null
}
