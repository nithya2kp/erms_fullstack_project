export interface User {
  id: string;
  name: string;
  email: string;
  role: "engineer" | "manager";
  tech_role: string | null;
  seniority: string;
  max_capacity: number;
  department: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Engineer extends User {
  skills: string[];
  allocated?: number;
  capacity?: {
    total: number;
    allocated: number;
    available: number;
  };
  active_projects?: {
    project_id: string;
    project_name: string;
    allocation_percent: number;
  }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "completed";
  start_date: string;
  end_date: string | null;
  team_size: number;
  manager: string;
  department: string | null;
  assigned_engineers?: number;
  required_skills?: string[];
  engineers?: {
    engineer_id: string;
    name: string;
    role: string;
    allocation: number;
  }[];
}

export interface Assignment {
  id: string;
  engineer: string;
  project: string;
  role: string;
  allocation_percentage: number;
  start_date: string;
  end_date: string | null;
}

export interface AssignmentDetail {
  id: string;
  engineer_id: string;
  project_id: string;
  role: string;
  allocation_percentage: number;
  timeline: {
    start: string;
    end: string;
  };
}

export interface CapacityStatus {
  engineer_id: string;
  capacity: number;
  allocated: number;
  available: number;
  utilization_percent: number;
  status: "SAFE" | "WARNING" | "OVERLOADED";
}

export interface ManagerDashboard {
  summary: {
    total_engineers: number;
    active_projects: number;
    utilization_avg: number;
  };
  alerts: {
    overloaded_engineers: number;
    unassigned_projects: number;
  };
  top_projects: {
    project_id: string;
    name: string;
    allocation: number;
  }[];
}

export interface AIMatch {
  engineer_id: string;
  name: string;
  match_score: number;
  available_capacity: number;
  skills: string[];
  role: string;
  seniority: string;
  department: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  message: string;
  username: string;
}