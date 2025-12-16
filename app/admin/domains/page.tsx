import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function DomainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Domains</h1>
        <p className="text-muted-foreground">
          Manage custom domains for your application
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Domains</CardTitle>
          <CardDescription>Add and verify custom domains</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No custom domains configured yet.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.globe className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Custom domain management features are under development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
