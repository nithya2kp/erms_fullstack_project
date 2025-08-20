import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import useAuthStore from "../../store/auth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await client.post("/users/auth/login/", { email, password });
      const { access } = res.data;

      // Get user profile
      const meRes = await client.get("/users/auth/me/", {
        headers: { Authorization: `Bearer ${access}` },
      });

      login(meRes.data, access);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      
      <div className="w-1/2 bg-[#1C2B3A] flex flex-col items-center justify-center">
        <div className="bg-[#2563EB] px-8 py-3 rounded-lg mb-6">
          <h1 className="text-white text-3xl font-bold">ERMS</h1>
        </div>
        <p className="text-slate-300 text-sm">Engineering Resource</p>
        <p className="text-slate-300 text-sm">Management System</p>
      </div>

      {/* Login form */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Sign in to your account
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Handling*/}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@erms.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Error Handling */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-gray-400 text-xs">
              Don't have an account? Contact your admin
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;