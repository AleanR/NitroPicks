import { useNavigate } from 'react-router-dom'

type Props = {
  knightPoints: number
}

function formatPoints(n: number) {
  return n.toLocaleString()
}

export default function BalancePanel({ knightPoints }: Props) {
  const navigate = useNavigate()

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        Knight Points Balance
      </p>

      <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-[#2b2208] to-[#1a1a1f] p-5">
        <div className="flex items-end gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="mb-1 h-7 w-7 shrink-0 text-yellow-400"
          >
            <path d="M13 2L3 14h7v8l10-12h-7z" />
          </svg>
          <span className="text-5xl font-extrabold tabular-nums text-white">
            {formatPoints(knightPoints)}
          </span>
          <span className="mb-1 text-2xl font-bold text-zinc-400">KP</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/redeem-points')}
        className="mt-4 w-full rounded-xl border border-zinc-700 bg-[#181b22] py-3 font-semibold text-yellow-400 transition hover:border-yellow-400"
      >
        Redeem Points →
      </button>
    </section>
  )
}
