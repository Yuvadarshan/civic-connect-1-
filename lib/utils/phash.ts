// Perceptual hash stub for image deduplication
// In production, this would use a proper image hashing library

export function generatePhash(imageUri: string): Promise<string> {
  // Stub implementation - returns a mock hash based on URI
  return Promise.resolve(
    btoa(imageUri.slice(-20))
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 16),
  )
}

export function comparePhash(hash1: string, hash2: string): number {
  // Stub implementation - returns similarity score (0-1)
  if (hash1 === hash2) return 1.0

  let matches = 0
  const minLength = Math.min(hash1.length, hash2.length)

  for (let i = 0; i < minLength; i++) {
    if (hash1[i] === hash2[i]) matches++
  }

  return matches / Math.max(hash1.length, hash2.length)
}

export function isDuplicateImage(hash1: string, hash2: string, threshold = 0.8): boolean {
  return comparePhash(hash1, hash2) >= threshold
}
