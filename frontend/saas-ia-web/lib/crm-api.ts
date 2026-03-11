import axios from "axios";
import { Lead } from "@/types/crm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export async function listLeads(): Promise<Lead[]> {
  const token = getToken();

  const response = await axios.get(`${API_URL}/v1/crm/leads`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateLeadStatus(leadId: string, status: string) {
  const token = getToken();

  await axios.patch(
    `${API_URL}/v1/crm/leads/${leadId}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function createLead(data: Partial<Lead>) {
  const token = getToken();

  const response = await axios.post(`${API_URL}/v1/crm/leads`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
