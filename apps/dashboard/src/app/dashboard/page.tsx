export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        J.A.R.V.I.S Dashboard
      </h1>
      <p className="text-muted-foreground">
        Welcome to the monitoring dashboard. Phase 01: Project Setup complete.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Bot Status</h3>
          <p className="text-2xl font-bold text-primary">Online</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Conversations</h3>
          <p className="text-2xl font-bold text-primary">-</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Memory Usage</h3>
          <p className="text-2xl font-bold text-primary">-</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">API Latency</h3>
          <p className="text-2xl font-bold text-primary">-</p>
        </div>
      </div>
    </div>
  );
}
