import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Civic Connect AI</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Empowering citizens and municipal administrators with AI-powered civic issue management
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/citizen/login">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                <Users className="h-5 w-5 mr-2" />
                Citizen Portal
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline">
                <Shield className="h-5 w-5 mr-2" />
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                For Citizens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Report issues with photos and GPS</li>
                <li>• AI-powered categorization</li>
                <li>• Real-time status tracking</li>
                <li>• Duplicate detection</li>
                <li>• Community transparency</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                For Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Live intake dashboard</li>
                <li>• Automated routing & assignment</li>
                <li>• SLA monitoring</li>
                <li>• Field operations oversight</li>
                <li>• Performance analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                AI-Powered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Smart issue triage</li>
                <li>• Duplicate detection</li>
                <li>• Predictive analytics</li>
                <li>• Automated workflows</li>
                <li>• Performance insights</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
