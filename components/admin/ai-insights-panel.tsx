"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Zap, BarChart3 } from "lucide-react"

interface AIInsightsPanelProps {
  ticketId?: string
  showBatchProcessing?: boolean
}

export function AIInsightsPanel({ ticketId, showBatchProcessing = false }: AIInsightsPanelProps) {
  const [aiMetrics, setAIMetrics] = useState({
    triageAccuracy: 0.87,
    dedupeAccuracy: 0.92,
    avgProcessingTime: 1.2,
    totalProcessed: 1247,
  })

  const [batchProcessing, setBatchProcessing] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)

  const handleBatchProcess = async () => {
    setBatchProcessing(true)
    setBatchProgress(0)

    // Simulate batch processing
    const interval = setInterval(() => {
      setBatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setBatchProcessing(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="space-y-4">
      {/* AI Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Triage Accuracy</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {Math.round(aiMetrics.triageAccuracy * 100)}%
                </Badge>
              </div>
              <Progress value={aiMetrics.triageAccuracy * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dedupe Accuracy</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {Math.round(aiMetrics.dedupeAccuracy * 100)}%
                </Badge>
              </div>
              <Progress value={aiMetrics.dedupeAccuracy * 100} className="h-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{aiMetrics.avgProcessingTime}s</p>
              <p className="text-xs text-muted-foreground">Avg Processing Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{aiMetrics.totalProcessed.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Processed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>High Confidence:</strong> 15 tickets ready for auto-acknowledgment
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Review Needed:</strong> 3 potential duplicates detected with low confidence
            </AlertDescription>
          </Alert>

          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              <strong>Pattern Detected:</strong> Increased pothole reports in Ward 2 - consider proactive inspection
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Batch Processing */}
      {showBatchProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Batch AI Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Process multiple tickets with AI triage and deduplication</p>

            {batchProcessing ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Processing tickets...</span>
                  <span className="text-sm font-medium">{batchProgress}%</span>
                </div>
                <Progress value={batchProgress} className="h-2" />
              </div>
            ) : (
              <Button onClick={handleBatchProcess} className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Process Pending Tickets
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Confidence Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Confidence Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span>High (&gt;80%)</span>
              <span className="font-medium">67%</span>
            </div>
            <Progress value={67} className="h-1" />

            <div className="flex justify-between items-center text-xs">
              <span>Medium (60-80%)</span>
              <span className="font-medium">25%</span>
            </div>
            <Progress value={25} className="h-1" />

            <div className="flex justify-between items-center text-xs">
              <span>Low (&lt;60%)</span>
              <span className="font-medium">8%</span>
            </div>
            <Progress value={8} className="h-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
