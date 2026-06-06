import { StatCard } from "../../components/dashboard/StatCard";
import { StatusBadge, LoadingSpinner, EmptyState } from "../../components/common";

export function TestComponentsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold border-b pb-4">Component Test Page</h1>

      {/* StatCard Test */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">StatCards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Revenue" value="$45,231" trend="+20.1%" color="primary" />
          <StatCard label="Active Users" value="2,450" trend="+15%" color="success" />
          <StatCard label="Bounce Rate" value="45%" trend="-5%" color="error" />
        </div>
      </section>

      {/* StatusBadge Test */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">StatusBadges</h2>
        <div className="flex flex-wrap gap-4">
          <StatusBadge status="draft" />
          <StatusBadge status="pending_approval" />
          <StatusBadge status="approved" />
          <StatusBadge status="on_sale" />
          <StatusBadge status="rejected" />
          <StatusBadge status="paused" />
          <StatusBadge status="expired" />
          <StatusBadge status="suspended" />
          <StatusBadge status="issued" />
          <StatusBadge status="used" />
          <StatusBadge status="cancelled" />
          <StatusBadge status="locked" />
        </div>
      </section>

      {/* LoadingSpinner Test */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">LoadingSpinner</h2>
        <div className="flex items-center gap-8 bg-base-200 p-6 rounded-box">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
        </div>
      </section>

      {/* EmptyState Test */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">EmptyState</h2>
        <EmptyState 
          title="No vouchers found" 
          description="Get started by creating your first voucher to offer discounts."
          action={<button className="btn btn-primary">Create Voucher</button>}
        />
      </section>
    </div>
  );
}
