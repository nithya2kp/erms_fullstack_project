import { useEffect, useState } from "react";
import client from "../../api/client";

const AIMatch = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await client.get("/projects/");
        setProjects(res.data.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  const handleMatch = async () => {
    if (!selectedProject) return;
    setLoading(true);
    setMatches([]);
    try {
      const res = await client.post("/ai/match-engineers/", {
        project_id: selectedProject,
      });
      setMatches(res.data.matches || []);
      setProjectInfo(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">AI Engineer Matching</h1>
        <p className="text-gray-400 text-sm">
          Smart skill-based engineer recommendations
        </p>
      </div>

      {/* Project selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">
              Select Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleMatch}
            disabled={!selectedProject || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 mt-4"
          >
            {loading ? "Finding..." : "Find Best Match"}
          </button>
        </div>

        {/* Required skills */}
        {projectInfo && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">
              Required Skills:
            </span>
            {projectInfo.required_skills.length > 0 ? (
              projectInfo.required_skills.map((skill: string) => (
                <span
                  key={skill}
                  className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">No skills set</span>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">🤖 AI is analyzing engineer skills...</p>
        </div>
      )}

      
      {!loading && matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            AI Recommended Engineers — Ranked by Match Score
          </h3>
          {matches.map((match, index) => (
            <div
              key={match.engineer_id}
              className={`bg-white rounded-xl border p-5 ${
                index === 0
                  ? "border-blue-300 shadow-sm"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    index === 0
                      ? "bg-blue-600"
                      : index === 1
                      ? "bg-gray-400"
                      : index === 2
                      ? "bg-amber-500"
                      : "bg-gray-300"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {match.name}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5 capitalize">
                        {match.tech_role} • {match.seniority}
                      </p>
                    </div>

                    {/* Match score */}
                    <div
                      className={`px-3 py-1.5 rounded-lg text-center ${
                        match.match_score >= 80
                          ? "bg-green-100"
                          : match.match_score >= 50
                          ? "bg-amber-100"
                          : "bg-red-100"
                      }`}
                    >
                      <p
                        className={`text-lg font-bold ${
                          match.match_score >= 80
                            ? "text-green-600"
                            : match.match_score >= 50
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {match.match_score}%
                      </p>
                      <p className="text-xs text-gray-500">Match</p>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      Allocated:{" "}
                      <span className="font-medium text-gray-700">
                        {match.allocated}%
                      </span>
                    </span>
                    <span>
                      Available:{" "}
                      <span className="font-medium text-green-600">
                        {match.available_capacity}%
                      </span>
                    </span>
                  </div>

                  {/* Matched skills */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {match.all_skills.map((skill: string) => {
                      const isMatched = match.matched_skills.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isMatched
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isMatched ? "✓ " : ""}{skill}
                        </span>
                      );
                    })}
                  </div>

                  {/* AI Recommendation */}
                  <div className="mt-3 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      🤖 AI Recommendation
                    </p>
                    <p className="text-sm text-gray-700">
                      {match.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && projectInfo && matches.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No matching engineers found for this project.</p>
          <p className="text-sm mt-1">
            Try adding required skills to the project or engineer profiles.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIMatch;