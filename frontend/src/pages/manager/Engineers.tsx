import { useEffect, useState } from "react";
import client from "../../api/client";
import type { Engineer } from "../../types";

const CapacityBar = ({ pct }: { pct: number }) => {
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className={`${color} h-1.5 rounded-full`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
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
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status]}`}>
      {status}
    </span>
  );
};

const Engineers = () => {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [seniority, setSeniority] = useState("");

  const fetchEngineers = async () => {
    try {
      const params: any = {};
      if (seniority) params.seniority = seniority;
      const res = await client.get("/users/engineers/", { params });
      setEngineers(res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineers();
  }, [seniority]);

  const filtered = engineers.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Engineers</h1>
        <p className="text-gray-400 text-sm">
          Manage engineer profiles and skills
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search engineers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
        />
        <select
          value={seniority}
          onChange={(e) => setSeniority(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Seniority</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>
      </div>

      {/* Engineer cards grid */}
      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading engineers...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((eng) => {
            const allocated = (eng as any).allocated || 0;
            const pct = Math.round(
              (allocated / (eng.max_capacity || 100)) * 100
            );
            const status =
              pct >= 90 ? "OVERLOADED" : pct >= 70 ? "WARNING" : "SAFE";

            return (
              <div
                key={eng.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {eng.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{eng.name}</p>
                      <p className="text-gray-400 text-xs capitalize">
                        {eng.tech_role || "—"} Developer
                      </p>
                    </div>
                  </div>
                  <Badge status={status} />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-3" />

                {/* Info */}
                <div className="text-xs text-gray-500 mb-3">
                  <span className="capitalize">{eng.seniority || "—"}</span>
                  {" · "}
                  <span>Max: {eng.max_capacity}%</span>
                </div>

                {/* Capacity */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Capacity</span>
                    <span>{pct}%</span>
                  </div>
                  <CapacityBar pct={pct} />
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {(eng.skills || []).slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-400">
              No engineers found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Engineers;