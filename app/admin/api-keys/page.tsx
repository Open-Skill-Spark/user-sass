import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function APIKeysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Manage API keys for programmatic access
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Create and manage API keys</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No API keys created yet.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.key className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            API key management features are under development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
