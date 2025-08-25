import { useEffect, useState } from "react";
import client from "../../api/client";
import useAuthStore from "../../store/auth";

const CapacityBar = ({ pct }: { pct: number }) => {
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
};

const EngineerDashboard = () => {
  const { user } = useAuthStore();
  const [capacity, setCapacity] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [capRes, assignRes] = await Promise.all([
          client.get(`/users/engineers/${user?.id}/capacity/`),
          client.get(`/users/engineers/${user?.id}/assignments/`),
        ]);
        setCapacity(capRes.data);
        setAssignments(assignRes.data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  const pct = capacity?.utilization_percent || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-400 text-sm">{user?.name} — Engineer View</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 rounded-l-xl" />
          <p className="text-2xl font-bold text-gray-900 pl-2">{pct}%</p>
          <p className="text-gray-500 text-sm pl-2">My Capacity</p>
          <p className="text-amber-500 text-xs pl-2 font-medium">
            Currently allocated
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-xl" />
          <p className="text-2xl font-bold text-gray-900 pl-2">
            {assignments.length}
          </p>
          <p className="text-gray-500 text-sm pl-2">Active Projects</p>
          <p className="text-blue-500 text-xs pl-2 font-medium">
            Assigned this month
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-xl" />
          <p className="text-2xl font-bold text-gray-900 pl-2">
            {capacity?.available || 0}%
          </p>
          <p className="text-gray-500 text-sm pl-2">Available</p>
          <p className="text-green-500 text-xs pl-2 font-medium">
            Free capacity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Capacity breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            Capacity Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Allocated</span>
                <span>{capacity?.allocated || 0}%</span>
              </div>
              <CapacityBar pct={pct} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {capacity?.capacity || 0}%
                </p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-amber-500">
                  {capacity?.allocated || 0}%
                </p>
                <p className="text-xs text-gray-400">Allocated</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-500">
                  {capacity?.available || 0}%
                </p>
                <p className="text-xs text-gray-400">Available</p>
              </div>
            </div>
            <div className="mt-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  capacity?.status === "SAFE"
                    ? "bg-green-100 text-green-700"
                    : capacity?.status === "WARNING"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {capacity?.status || "SAFE"}
              </span>
            </div>
          </div>
        </div>

        {/* My assignments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">My Assignments</h3>
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                No assignments yet
              </p>
            ) : (
              assignments.map((a) => (
                <div
                  key={a.id}
                  className="border border-gray-100 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {a.project}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {a.role || "Engineer"} · {a.start_date} -{" "}
                        {a.end_date || "Ongoing"}
                      </p>
                    </div>
                    <span className="text-blue-600 font-bold text-sm">
                      {a.allocation_percentage}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <CapacityBar pct={a.allocation_percentage} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* My skills */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">My Profile</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Email</p>
            <p className="font-medium text-gray-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Role</p>
            <p className="font-medium text-gray-900 capitalize">
              {user?.tech_role || "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Seniority</p>
            <p className="font-medium text-gray-900 capitalize">
              {user?.seniority || "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Max Capacity</p>
            <p className="font-medium text-gray-900">
              {user?.max_capacity}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;