import TotalCard from "../../components/admin/dashboard/totalCard";
import RevenueGraph from "../../components/admin/dashboard/reveniewGraph";
import TopEventUsers from "../../components/admin/dashboard/topUsers";
import { PageHeader } from "../../components/common/PageHeader";

function Home() {
  return (
    <div className="space-y-7">
      <PageHeader
        title="Admin overview"
        description="Monitor platform growth, revenue, and community activity from one place."
      />
      <TotalCard />

      <div className="flex flex-col gap-6 lg:flex-row">
        <RevenueGraph />
        <TopEventUsers />
      </div>
    </div>
  );
}

export default Home;
