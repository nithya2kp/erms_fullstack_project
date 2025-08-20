import { Outlet, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "⊞" },
  { label: "Engineers", path: "/engineers", icon: "👤" },
  { label: "Projects", path: "/projects", icon: "📁" },
  { label: "Assignments", path: "/assignments", icon: "📋" },
  { label: "Analytics", path: "/analytics", icon: "📊" },
  { label: "AI Match", path: "/ai-match", icon: "🤖" },
];

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNav =
    user?.role === "engineer"
      ? navItems.filter((i) => i.path === "/dashboard")
      : navItems;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 bg-[#1C2B3A] flex flex-col flex-shrink-0">
     
        <div className="bg-[#2563EB] px-4 py-4">
          <h1 className="text-white font-bold text-lg">ERMS</h1>
          <p className="text-blue-200 text-xs">Resource Manager</p>
        </div>

        {/* Navbar */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {filteredNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-[#2563EB] text-white font-semibold"
                    : "text-slate-300 hover:bg-[#243447]"
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Details */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-2 bg-[#243447] rounded-lg px-3 py-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user?.name}
              </p>
              <p className="text-slate-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 text-slate-400 text-xs hover:text-white transition text-left px-3 py-1"
          >
            Sign out →
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-gray-900 font-semibold text-base">
              Welcome, {user?.name}
            </h2>
            <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer">
              🔔
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;