"use client";

import { Lead, LeadStatus } from "@/types/crm";
import CrmColumn from "./CrmColumn";

interface Props {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

const statuses: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "Novos" },
  { value: "CONTACTED", label: "Contatados" },
  { value: "PROPOSAL", label: "Propostas" },
  { value: "NEGOTIATION", label: "Negociação" },
  { value: "WON", label: "Ganhos" },
  { value: "LOST", label: "Perdidos" },
];

export default function CrmPipeline({ leads, onLeadClick }: Props) {
  return (
    <div className="flex gap-5 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const columnLeads = leads.filter((lead) => lead.status === status.value);

        return (
          <CrmColumn
            key={status.value}
            status={status.value}
            title={status.label}
            leads={columnLeads}
            onLeadClick={onLeadClick}
          />
        );
      })}
    </div>
  );
}
