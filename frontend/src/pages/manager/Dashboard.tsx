import { useEffect, useState } from "react";
import client from "../../api/client";
import type { ManagerDashboard } from "../../types";

const StatCard = ({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1 relative overflow-hidden">
    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${color} rounded-l-xl`} />
    <span className="text-2xl font-bold text-gray-900 pl-2">{value}</span>
    <span className="text-gray-500 text-sm pl-2">{label}</span>
    <span className={`text-xs pl-2 font-medium ${color.replace("bg-", "text-")}`}>
      {sub}
    </span>
  </div>
);

const CapacityBar = ({ pct }: { pct: number }) => {
  const color =
    pct >= 90
      ? "bg-red-500"
      : pct >= 70
      ? "bg-amber-500"
      : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8">{pct}%</span>
    </div>
  );
};

const Badge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    SAFE: "bg-green-100 text-green-700",
    WARNING: "bg-amber-100 text-amber-700",
    OVERLOADED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState<ManagerDashboard | null>(null);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, engRes] = await Promise.all([
          client.get("/analytics/dashboard/manager/"),
          client.get("/users/engineers/"),
        ]);
        setDashboard(dashRes.data);
        setEngineers(engRes.data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-400 text-sm">
          Overview of team capacity and project status
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Engineers"
          value={dashboard?.summary.total_engineers || 0}
          sub="Active members"
          color="bg-blue-500"
        />
        <StatCard
          label="Active Projects"
          value={dashboard?.summary.active_projects || 0}
          sub="In progress"
          color="bg-green-500"
        />
        <StatCard
          label="Overloaded"
          value={dashboard?.alerts.overloaded_engineers || 0}
          sub=">80% capacity"
          color="bg-red-500"
        />
        <StatCard
          label="Avg Utilization"
          value={`${dashboard?.summary.utilization_avg || 0}%`}
          sub="Team average"
          color="bg-amber-500"
        />
      </div>

      {/* Engineers table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            Engineers — Capacity Overview
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Seniority</th>
                <th className="text-left px-5 py-3">Capacity</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {engineers.map((eng, i) => {
                const allocated = eng.allocated || 0;
                const pct = Math.round(
                  (allocated / (eng.max_capacity || 100)) * 100
                );
                const status =
                  pct >= 90
                    ? "OVERLOADED"
                    : pct >= 70
                    ? "WARNING"
                    : "SAFE";
                return (
                  <tr
                    key={eng.id}
                    className={`border-t border-gray-50 hover:bg-gray-50 transition ${
                      i % 2 === 0 ? "" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {eng.name}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {eng.tech_role || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500 capitalize">
                      {eng.seniority || "—"}
                    </td>
                    <td className="px-5 py-3 w-40">
                      <CapacityBar pct={pct} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={status} />
                    </td>
                  </tr>
                );
              })}
              {engineers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    No engineers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top projects */}
      {dashboard?.top_projects && dashboard.top_projects.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">
              Top Projects by Allocation
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {dashboard.top_projects.map((proj) => (
              <div key={proj.project_id} className="flex items-center gap-4">
                <span className="text-sm text-gray-700 w-48 truncate">
                  {proj.name}
                </span>
                <div className="flex-1">
                  <CapacityBar pct={proj.allocation} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;