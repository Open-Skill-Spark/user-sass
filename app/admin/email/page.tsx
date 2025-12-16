import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function EmailSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
        <p className="text-muted-foreground">
          Configure email provider and templates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Provider</CardTitle>
          <CardDescription>Current provider configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm"><strong>Provider:</strong> AWS SES / Gmail</p>
            <p className="text-sm text-muted-foreground">
              Configured via environment variables
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Email template editor and provider configuration UI are under development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
