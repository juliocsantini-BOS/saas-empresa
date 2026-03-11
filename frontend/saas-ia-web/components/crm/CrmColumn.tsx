"use client";

import { Lead, LeadStatus } from "@/types/crm";
import LeadCard from "./LeadCard";

interface Props {
  status: LeadStatus;
  title: string;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export default function CrmColumn({
  status,
  title,
  leads,
  onLeadClick,
}: Props) {
  return (
    <div className="min-w-[320px] max-w-[320px] rounded-3xl border border-white/10 bg-zinc-950/70 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="text-xs text-zinc-500">{status}</div>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
          {leads.length}
        </div>
      </div>

      <div className="space-y-3">
        {leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-zinc-500">
            Nenhum lead nesta etapa.
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead)}
            />
          ))
        )}
      </div>
    </div>
  );
}
