import { useEffect, useState } from "react";
import client from "../../api/client";
import type { Project } from "../../types";

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    planning: "bg-amber-100 text-amber-700",
    completed: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${colors[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    team_size: "",
    status: "planning",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await client.get("/projects/", { params });
      setProjects(res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await client.post("/projects/", {
        ...form,
        team_size: parseInt(form.team_size) || 1,
      });
      setShowForm(false);
      setForm({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        team_size: "",
        status: "planning",
      });
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-400 text-sm">
            Manage and track all engineering projects
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          + New Project
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            Create New Project
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Team Size
                </label>
                <input
                  type="number"
                  value={form.team_size}
                  onChange={(e) =>
                    setForm({ ...form, team_size: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Project"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["", "planning", "active", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Projects grid */}
      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading projects...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Status bar */}
              <div
                className={`h-1.5 ${
                  proj.status === "active"
                    ? "bg-green-500"
                    : proj.status === "planning"
                    ? "bg-amber-500"
                    : "bg-gray-400"
                }`}
              />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                  <StatusBadge status={proj.status} />
                </div>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                  {proj.description || "No description"}
                </p>
                <div className="border-t border-gray-100 pt-3 text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Team Size</span>
                    <span className="font-medium text-gray-700">
                      {proj.team_size || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start</span>
                    <span className="font-medium text-gray-700">
                      {proj.start_date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>End</span>
                    <span className="font-medium text-gray-700">
                      {proj.end_date || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engineers</span>
                    <span className="font-medium text-gray-700">
                      {proj.assigned_engineers || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-400">
              No projects found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;