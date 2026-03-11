export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type LeadTemperature = "HOT" | "WARM" | "COLD";

export interface Lead {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  status: LeadStatus;
  score?: number;
  temperature?: LeadTemperature;
  createdAt: string;
  updatedAt: string;
}

export interface UserOption {
  id: string;
  name: string;
}

export interface BranchOption {
  id: string;
  name: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
}
