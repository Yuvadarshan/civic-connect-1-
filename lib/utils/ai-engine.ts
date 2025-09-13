// Enhanced AI engine for more sophisticated triage and deduplication

import type { Ticket, Category, Severity, AITriageResponse, AIDedupeResponse, GeoLocation } from "../../types"
import { calculateDistance } from "./geo"
import { comparePhash, generatePhash } from "./phash"

// Enhanced AI triage with more sophisticated logic
export class AITriageEngine {
  private categoryKeywords: Record<Category, string[]> = {
    Pothole: ["pothole", "road", "crack", "asphalt", "pavement", "hole", "bump", "uneven"],
    Streetlight: ["light", "lamp", "bulb", "dark", "illumination", "pole", "electricity", "broken light"],
    Garbage: ["trash", "garbage", "waste", "bin", "dump", "litter", "smell", "overflow", "dirty"],
    WaterLeak: ["water", "leak", "pipe", "burst", "flooding", "wet", "drip", "plumbing"],
    Drainage: ["drain", "sewer", "flood", "water", "clog", "overflow", "storm", "gutter"],
    Sidewalk: ["sidewalk", "pavement", "walkway", "pedestrian", "crack", "broken", "uneven"],
    TrafficSignal: ["signal", "traffic", "light", "red", "green", "yellow", "intersection", "crossing"],
    Signs: ["sign", "board", "missing", "damaged", "faded", "fallen", "visibility"],
    ParkEquipment: ["park", "playground", "bench", "swing", "slide", "equipment", "broken"],
    FallenTree: ["tree", "fallen", "branch", "storm", "blocking", "road", "path"],
    Encroachment: ["encroachment", "illegal", "construction", "blocking", "unauthorized", "violation"],
  }

  private severityIndicators = {
    critical: ["emergency", "dangerous", "urgent", "blocking", "major", "severe", "critical"],
    high: ["important", "significant", "affecting", "multiple", "busy", "main"],
    moderate: ["minor", "small", "occasional", "some", "moderate"],
    low: ["cosmetic", "aesthetic", "slight", "barely", "minimal"],
  }

  async performTriage(ticketData: Partial<Ticket>): Promise<AITriageResponse> {
    const text = `${ticketData.title || ""} ${ticketData.description || ""}`.toLowerCase()

    // Category detection with confidence scoring
    const categoryScores = this.calculateCategoryScores(text)
    const bestCategory = this.getBestCategory(categoryScores, ticketData.category)

    // Severity analysis
    const severity = this.analyzeSeverity(text, bestCategory.category, ticketData.severity)

    // Department routing
    const suggestedDept = this.getDepartment(bestCategory.category)

    // ETA estimation based on category and severity
    const eta = this.estimateETA(bestCategory.category, severity)

    // Priority scoring for monsoon mode
    const priorityScore = this.calculatePriorityScore(bestCategory.category, severity, ticketData.geo)

    return {
      category: bestCategory.category,
      severity,
      suggestedDept,
      eta,
      confidence: bestCategory.confidence,
      priorityScore,
      reasoning: this.generateReasoning(bestCategory, severity, text),
    }
  }

  private calculateCategoryScores(text: string): Record<Category, number> {
    const scores = {} as Record<Category, number>

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let score = 0
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi")
        const matches = text.match(regex)
        if (matches) {
          score += matches.length * (keyword.length > 4 ? 2 : 1) // Longer keywords get more weight
        }
      }
      scores[category as Category] = score
    }

    return scores
  }

  private getBestCategory(
    scores: Record<Category, number>,
    userCategory?: Category,
  ): { category: Category; confidence: number } {
    const maxScore = Math.max(...Object.values(scores))
    const bestCategory = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as Category

    // If user provided category matches AI suggestion, boost confidence
    if (userCategory && userCategory === bestCategory) {
      return { category: bestCategory, confidence: Math.min(0.95, 0.7 + maxScore * 0.05) }
    }

    // If user category differs significantly, use user's choice but lower confidence
    if (userCategory && scores[userCategory] < maxScore * 0.5) {
      return { category: userCategory, confidence: 0.6 }
    }

    const confidence = maxScore > 0 ? Math.min(0.9, 0.5 + maxScore * 0.1) : 0.3
    return { category: bestCategory || userCategory || "Pothole", confidence }
  }

  private analyzeSeverity(text: string, category: Category, userSeverity?: Severity): Severity {
    let severityScore = userSeverity || 3

    // Check for severity indicators in text
    if (this.severityIndicators.critical.some((word) => text.includes(word))) {
      severityScore = Math.max(severityScore, 4) as Severity
    } else if (this.severityIndicators.high.some((word) => text.includes(word))) {
      severityScore = Math.max(severityScore, 3) as Severity
    } else if (this.severityIndicators.low.some((word) => text.includes(word))) {
      severityScore = Math.min(severityScore, 2) as Severity
    }

    // Category-specific severity adjustments
    const categoryAdjustments: Partial<Record<Category, number>> = {
      WaterLeak: 1, // Water leaks are generally more urgent
      TrafficSignal: 1, // Traffic signals affect safety
      FallenTree: 1, // Fallen trees can block roads
      Garbage: -1, // Garbage issues are generally less urgent
    }

    if (categoryAdjustments[category]) {
      severityScore += categoryAdjustments[category]
    }

    return Math.max(1, Math.min(5, Math.round(severityScore))) as Severity
  }

  private getDepartment(category: Category): string {
    const deptMapping: Record<Category, string> = {
      Pothole: "Roads & Infrastructure",
      Streetlight: "Electrical Department",
      Garbage: "Sanitation Department",
      WaterLeak: "Water Works Department",
      Drainage: "Water Works Department",
      Sidewalk: "Roads & Infrastructure",
      TrafficSignal: "Traffic Management",
      Signs: "Traffic Management",
      ParkEquipment: "Parks & Recreation",
      FallenTree: "Parks & Recreation",
      Encroachment: "Enforcement Department",
    }

    return deptMapping[category]
  }

  private estimateETA(category: Category, severity: Severity): string {
    const baseETAs: Record<Category, number> = {
      Pothole: 3, // days
      Streetlight: 1,
      Garbage: 0.5,
      WaterLeak: 1,
      Drainage: 2,
      Sidewalk: 5,
      TrafficSignal: 0.5,
      Signs: 2,
      ParkEquipment: 3,
      FallenTree: 1,
      Encroachment: 7,
    }

    let eta = baseETAs[category]

    // Adjust based on severity
    if (severity >= 4)
      eta *= 0.5 // High priority gets faster response
    else if (severity <= 2) eta *= 1.5 // Low priority takes longer

    if (eta < 1) return `${Math.round(eta * 24)} hours`
    return `${Math.round(eta)} days`
  }

  private calculatePriorityScore(category: Category, severity: Severity, geo?: GeoLocation): number {
    let score = severity * 20 // Base score from severity

    // Category-based priority
    const categoryPriority: Record<Category, number> = {
      WaterLeak: 30,
      TrafficSignal: 25,
      FallenTree: 20,
      Drainage: 15,
      Pothole: 10,
      Streetlight: 10,
      Garbage: 5,
      Sidewalk: 5,
      Signs: 5,
      ParkEquipment: 5,
      Encroachment: 0,
    }

    score += categoryPriority[category]

    // Location-based priority (mock - in real system would use demographic data)
    if (geo) {
      // Higher priority for central areas (mock logic)
      if (geo.lat > 28.61 && geo.lat < 28.62 && geo.lng > 77.2 && geo.lng < 77.23) {
        score += 15 // Central area bonus
      }
    }

    return Math.min(100, score)
  }

  private generateReasoning(
    categoryResult: { category: Category; confidence: number },
    severity: Severity,
    text: string,
  ): string {
    const reasons = []

    if (categoryResult.confidence > 0.8) {
      reasons.push(`High confidence categorization based on keyword analysis`)
    } else if (categoryResult.confidence < 0.5) {
      reasons.push(`Low confidence - manual review recommended`)
    }

    if (severity >= 4) {
      reasons.push(`High severity detected from description`)
    }

    const urgentWords = ["urgent", "emergency", "dangerous", "blocking"]
    if (urgentWords.some((word) => text.includes(word))) {
      reasons.push(`Urgent language detected`)
    }

    return reasons.join(". ") || "Standard categorization applied"
  }
}

// Enhanced deduplication engine
export class AIDedupeEngine {
  async checkDuplicate(ticketData: Partial<Ticket>, existingTickets: Ticket[]): Promise<AIDedupeResponse> {
    const candidates = this.findCandidates(ticketData, existingTickets)

    if (candidates.length === 0) {
      return {
        isDuplicate: false,
        similarity: 0,
        confidence: 0.9,
      }
    }

    const bestMatch = await this.findBestMatch(ticketData, candidates)

    if (bestMatch.similarity > 0.75) {
      return {
        isDuplicate: true,
        masterCaseId: bestMatch.ticket.id,
        similarity: bestMatch.similarity,
        confidence: bestMatch.confidence,
        reason: bestMatch.reason,
        suggestedAction: "merge",
      }
    } else if (bestMatch.similarity > 0.5) {
      return {
        isDuplicate: false,
        similarity: bestMatch.similarity,
        confidence: bestMatch.confidence,
        relatedCases: [bestMatch.ticket.id],
        reason: "Similar but distinct issue",
        suggestedAction: "link",
      }
    }

    return {
      isDuplicate: false,
      similarity: bestMatch.similarity,
      confidence: 0.8,
    }
  }

  private findCandidates(ticketData: Partial<Ticket>, existingTickets: Ticket[]): Ticket[] {
    return existingTickets.filter((ticket) => {
      // Same category
      if (ticket.category !== ticketData.category) return false

      // Not resolved
      if (ticket.status === "Resolved") return false

      // Within geographic radius (500m)
      if (ticketData.geo && calculateDistance(ticket.geo, ticketData.geo) > 0.5) return false

      // Within time window (7 days)
      const daysDiff = (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysDiff > 7) return false

      return true
    })
  }

  private async findBestMatch(
    ticketData: Partial<Ticket>,
    candidates: Ticket[],
  ): Promise<{
    ticket: Ticket
    similarity: number
    confidence: number
    reason: string
  }> {
    let bestMatch = {
      ticket: candidates[0],
      similarity: 0,
      confidence: 0,
      reason: "",
    }

    for (const candidate of candidates) {
      const similarity = await this.calculateSimilarity(ticketData, candidate)
      const confidence = this.calculateConfidence(ticketData, candidate, similarity)

      if (similarity > bestMatch.similarity) {
        bestMatch = {
          ticket: candidate,
          similarity,
          confidence,
          reason: this.generateReason(ticketData, candidate, similarity),
        }
      }
    }

    return bestMatch
  }

  private async calculateSimilarity(ticket1: Partial<Ticket>, ticket2: Ticket): Promise<number> {
    let totalScore = 0
    let maxScore = 0

    // Text similarity (40% weight)
    const textSim = this.calculateTextSimilarity(
      `${ticket1.title || ""} ${ticket1.description || ""}`,
      `${ticket2.title} ${ticket2.description || ""}`,
    )
    totalScore += textSim * 40
    maxScore += 40

    // Geographic similarity (30% weight)
    if (ticket1.geo && ticket2.geo) {
      const distance = calculateDistance(ticket1.geo, ticket2.geo)
      const geoSim = Math.max(0, 1 - distance / 0.1) // 100m radius for full similarity
      totalScore += geoSim * 30
    }
    maxScore += 30

    // Category similarity (20% weight) - already filtered, so full score
    totalScore += 20
    maxScore += 20

    // Media similarity (10% weight)
    if (ticket1.media && ticket1.media.length > 0 && ticket2.media.length > 0) {
      const mediaSim = await this.calculateMediaSimilarity(ticket1.media, ticket2.media)
      totalScore += mediaSim * 10
    }
    maxScore += 10

    return totalScore / maxScore
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))

    const intersection = new Set([...words1].filter((word) => words2.has(word)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size // Jaccard similarity
  }

  private async calculateMediaSimilarity(media1: any[], media2: any[]): Promise<number> {
    if (media1.length === 0 || media2.length === 0) return 0

    let maxSimilarity = 0

    for (const m1 of media1) {
      for (const m2 of media2) {
        if (m1.type === m2.type && m1.type === "image") {
          // Use perceptual hash comparison for images
          const hash1 = m1.phash || (await generatePhash(m1.uri))
          const hash2 = m2.phash || (await generatePhash(m2.uri))
          const similarity = comparePhash(hash1, hash2)
          maxSimilarity = Math.max(maxSimilarity, similarity)
        }
      }
    }

    return maxSimilarity
  }

  private calculateConfidence(ticket1: Partial<Ticket>, ticket2: Ticket, similarity: number): number {
    let confidence = similarity

    // Boost confidence for very close geographic matches
    if (ticket1.geo && ticket2.geo) {
      const distance = calculateDistance(ticket1.geo, ticket2.geo)
      if (distance < 0.05) confidence += 0.1 // Within 50m
    }

    // Boost confidence for recent reports
    const hoursDiff = (Date.now() - new Date(ticket2.createdAt).getTime()) / (1000 * 60 * 60)
    if (hoursDiff < 24) confidence += 0.05

    return Math.min(0.95, confidence)
  }

  private generateReason(ticket1: Partial<Ticket>, ticket2: Ticket, similarity: number): string {
    const reasons = []

    if (ticket1.geo && ticket2.geo) {
      const distance = calculateDistance(ticket1.geo, ticket2.geo)
      if (distance < 0.1) {
        reasons.push(`Located within ${Math.round(distance * 1000)}m of existing report`)
      }
    }

    const textSim = this.calculateTextSimilarity(
      `${ticket1.title || ""} ${ticket1.description || ""}`,
      `${ticket2.title} ${ticket2.description || ""}`,
    )

    if (textSim > 0.6) {
      reasons.push(`High text similarity (${Math.round(textSim * 100)}%)`)
    }

    if (similarity > 0.8) {
      reasons.push(`Very similar issue characteristics`)
    }

    return reasons.join(". ") || `${Math.round(similarity * 100)}% similarity detected`
  }
}

// Singleton instances
export const aiTriageEngine = new AITriageEngine()
export const aiDedupeEngine = new AIDedupeEngine()
