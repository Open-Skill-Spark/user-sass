import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground">
          Configure webhooks for event notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
          <CardDescription>Receive real-time event notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No webhooks configured yet.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.webhook className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Webhook configuration and management features are under development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
