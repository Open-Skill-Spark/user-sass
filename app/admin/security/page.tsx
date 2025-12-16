import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide security policies
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.shieldAlert className="h-5 w-5" />
              Multi-Factor Authentication
            </CardTitle>
            <CardDescription>
              MFA enforcement and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure MFA policies, enforcement rules, and backup codes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.lock className="h-5 w-5" />
              Password Policies
            </CardTitle>
            <CardDescription>
              Password complexity requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set minimum length, complexity rules, and expiration policies.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.monitorSmartphone className="h-5 w-5" />
              Session Management
            </CardTitle>
            <CardDescription>
              Session timeout and limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure session duration, concurrent session limits, and idle timeout.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.globe className="h-5 w-5" />
              IP Restrictions
            </CardTitle>
            <CardDescription>
              Whitelist and blacklist IPs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Control access based on IP addresses and geographic locations.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.shieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Advanced security configuration interface is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
