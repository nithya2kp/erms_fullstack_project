import { useEffect, useState } from "react";
import client from "../../api/client";

const Assignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    engineer: "",
    project: "",
    role: "",
    allocation_percentage: "",
    start_date: "",
    end_date: "",
  });

  const fetchData = async () => {
    try {
      const [aRes, eRes, pRes] = await Promise.all([
        client.get("/assignments/"),
        client.get("/users/engineers/"),
        client.get("/projects/"),
      ]);
      setAssignments(aRes.data.results || []);
      setEngineers(eRes.data.results || []);
      setProjects(pRes.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await client.post("/assignments/", {
        ...form,
        allocation_percentage: parseInt(form.allocation_percentage),
      });
      setShowForm(false);
      setForm({
        engineer: "",
        project: "",
        role: "",
        allocation_percentage: "",
        start_date: "",
        end_date: "",
      });
      fetchData();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to create assignment"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this assignment?")) return;
    try {
      await client.delete(`/assignments/${id}/`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-400 text-sm">
            Manage engineer-project assignments
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          + Assign Engineer
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            Create New Assignment
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Engineer *
                </label>
                <select
                  value={form.engineer}
                  onChange={(e) =>
                    setForm({ ...form, engineer: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select engineer...</option>
                  {engineers.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Project *
                </label>
                <select
                  value={form.project}
                  onChange={(e) =>
                    setForm({ ...form, project: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tech Lead"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Allocation % *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 50"
                  value={form.allocation_percentage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      allocation_percentage: e.target.value,
                    })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {creating ? "Assigning..." : "Assign Engineer"}
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

      {/* Assignments table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">All Assignments</h3>
        </div>
        {loading ? (
          <p className="text-gray-400 text-center py-12">
            Loading assignments...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs">
                  <th className="text-left px-5 py-3">Engineer</th>
                  <th className="text-left px-5 py-3">Project</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Allocation</th>
                  <th className="text-left px-5 py-3">Start</th>
                  <th className="text-left px-5 py-3">End</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-t border-gray-50 hover:bg-gray-50 ${
                      i % 2 === 0 ? "" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {a.engineer}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{a.project}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {a.role || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-blue-600 font-semibold">
                        {a.allocation_percentage}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {a.start_date}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {a.end_date || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-gray-400"
                    >
                      No assignments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;