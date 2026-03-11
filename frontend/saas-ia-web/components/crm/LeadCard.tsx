"use client";

import { Lead } from "@/types/crm";

interface Props {
  lead: Lead;
  onClick: () => void;
}

export default function LeadCard({ lead, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-white/10 bg-zinc-900/80 p-4 transition hover:border-emerald-400/60 hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{lead.name}</div>
          {lead.company && (
            <div className="mt-1 text-xs text-zinc-400">{lead.company}</div>
          )}
        </div>

        {typeof lead.score === "number" && (
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[11px] font-medium text-emerald-300">
            {lead.score}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1 text-xs text-zinc-400">
        {lead.email && <div>{lead.email}</div>}
        {lead.phone && <div>{lead.phone}</div>}
      </div>
    </div>
  );
}
