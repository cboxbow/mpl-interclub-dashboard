import { LockKeyhole } from 'lucide-react'

export default function AdminLoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return (
    <div className="mx-auto max-w-md">
      <div className="glass-panel rounded-2xl p-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text">
          <LockKeyhole size={18}/> Acces admin
        </div>
        <h1 className="interclub-title text-3xl font-black uppercase leading-none">Connexion</h1>
        <p className="mt-3 text-sm text-gray-300">Entre le mot de passe admin pour gerer les scores, clubs, equipes et classements.</p>
        {searchParams.error && (
          <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            Mot de passe incorrect.
          </div>
        )}
        <form action="/api/admin/login" method="post" className="mt-5 space-y-3">
          <input type="hidden" name="next" value={searchParams.next || '/admin'} />
          <label className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Mot de passe
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 h-11 w-full rounded-md border border-cyan/40 bg-navy px-3 text-sm text-white outline-none focus:border-cyan"
            />
          </label>
          <button className="w-full rounded-md bg-cyan px-4 py-2 text-sm font-black uppercase text-navy hover:bg-cyan-dark">
            Entrer
          </button>
        </form>
      </div>
    </div>
  )
}
