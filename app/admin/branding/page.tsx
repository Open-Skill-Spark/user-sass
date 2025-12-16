import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function BrandingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branding</h1>
        <p className="text-muted-foreground">
          Customize the look and feel of your application
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>Upload your company logo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Icons.palette className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Logo upload coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>Set your primary brand color</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Primary Color</label>
                <div className="mt-2 h-10 rounded border bg-primary"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.palette className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Full branding customization interface is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
