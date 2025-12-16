import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Badge } from "@/components/ui/badge"

export default function SocialConnectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Connections</h1>
        <p className="text-muted-foreground">
          Configure OAuth providers for social login
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OAuth Providers</CardTitle>
          <CardDescription>
            Enable and configure social login providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Google", icon: Icons.google, enabled: true },
            { name: "GitHub", icon: Icons.gitHub, enabled: true },
            { name: "Microsoft", icon: Icons.building, enabled: false },
            { name: "Apple", icon: Icons.shield, enabled: false },
          ].map((provider) => (
            <div
              key={provider.name}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <provider.icon className="h-6 w-6" />
                <div>
                  <p className="font-medium">{provider.name}</p>
                  <p className="text-sm text-muted-foreground">
                    OAuth 2.0 authentication
                  </p>
                </div>
              </div>
              <Badge variant={provider.enabled ? "default" : "secondary"}>
                {provider.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.link className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Full OAuth provider configuration interface is under development.
            Currently, Google and GitHub are configured via environment variables.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
