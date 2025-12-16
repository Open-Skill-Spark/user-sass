import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function ImportExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import/Export</h1>
        <p className="text-muted-foreground">
          Bulk user operations and data migration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import Users</CardTitle>
            <CardDescription>Bulk import from CSV or JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Icons.database className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Import feature coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download user data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Icons.database className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Export feature coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.database className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bulk import/export features are under development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
