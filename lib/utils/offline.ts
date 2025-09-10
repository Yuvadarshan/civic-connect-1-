// Offline queue management utilities

export interface QueuedAction {
  id: string
  type: string
  payload: any
  timestamp: string
  retryCount: number
  maxRetries: number
}

export class OfflineQueue {
  private queue: QueuedAction[] = []
  private isProcessing = false

  constructor(private storageKey = "civic_connect_queue") {
    this.loadFromStorage()
  }

  add(type: string, payload: any, maxRetries = 3): string {
    const action: QueuedAction = {
      id: Date.now().toString(),
      type,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries,
    }

    this.queue.push(action)
    this.saveToStorage()
    return action.id
  }

  async process(processor: (action: QueuedAction) => Promise<boolean>): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    const actionsToProcess = [...this.queue]

    for (const action of actionsToProcess) {
      try {
        const success = await processor(action)

        if (success) {
          this.remove(action.id)
        } else {
          this.incrementRetry(action.id)
        }
      } catch (error) {
        console.error("Queue processing error:", error)
        this.incrementRetry(action.id)
      }
    }

    this.isProcessing = false
  }

  remove(id: string): void {
    this.queue = this.queue.filter((action) => action.id !== id)
    this.saveToStorage()
  }

  private incrementRetry(id: string): void {
    const action = this.queue.find((a) => a.id === id)
    if (action) {
      action.retryCount++
      if (action.retryCount >= action.maxRetries) {
        this.remove(id)
      } else {
        this.saveToStorage()
      }
    }
  }

  getPendingCount(): number {
    return this.queue.length
  }

  private saveToStorage(): void {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue))
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        try {
          this.queue = JSON.parse(stored)
        } catch (error) {
          console.error("Failed to load queue from storage:", error)
          this.queue = []
        }
      }
    }
  }
}
