'use client';

export default function Page() {
  return (
    <div className="space-y-5">
      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
        <div className="max-w-2xl text-sm leading-6 text-zinc-400">
          Este módulo vai consolidar caixa, receitas, despesas, metas, relatórios e visão executiva financeira.
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Status</div>
            <div className="mt-4 text-3xl font-semibold text-[#3BFF8C]">UI</div>
            <div className="mt-2 text-sm text-zinc-400">Estrutura visual pronta</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Fase</div>
            <div className="mt-4 text-3xl font-semibold text-white">Próxima</div>
            <div className="mt-2 text-sm text-zinc-400">Conexão com backend depois do core</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Projeto</div>
            <div className="mt-4 text-3xl font-semibold text-white">OS</div>
            <div className="mt-2 text-sm text-zinc-400">Módulo preparado para expansão</div>
          </div>
        </div>
      </div>
    </div>
  );
}
