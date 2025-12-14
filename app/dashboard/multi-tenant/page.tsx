export default function MultiTenantPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Multi-tenant Model</h1>
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Architecture Overview</h2>
        <p className="text-muted-foreground mb-4">
          This application follows a multi-tenant architecture where a single instance serves multiple organizations (tenants).
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>One App Instance:</strong> All tenants share the same application deployment and database.</li>
          <li><strong>Tenant Isolation:</strong> Data is logically isolated using a <code>team_id</code> (acting as <code>tenant_id</code>).</li>
          <li><strong>User Membership:</strong> Users can belong to multiple tenants (teams) with different roles.</li>
          <li><strong>Record Ownership:</strong> Every record (e.g., team members, roles) is associated with a specific tenant.</li>
        </ul>
      </div>
    </div>
  )
}
