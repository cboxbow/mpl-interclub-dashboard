# MPL Interclub Championship 2026 — Dashboard

> Stack: **Next.js 14** · **Supabase** · **Tailwind CSS** · Deploy: **Vercel** via **GitHub**

## 🚀 Setup en 5 étapes

### 1. Créer le projet Supabase
1. Va sur [supabase.com](https://supabase.com) → New Project
2. Note ton **Project URL** et **anon key** (Settings > API)
3. Dans **SQL Editor**, exécute dans l'ordre :
   - `supabase/001_schema.sql`
   - `supabase/002_seed.sql`

### 2. Variables d'environnement
Copie `.env.example` → `.env.local` et remplis :
```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
ADMIN_PASSWORD=mpl2026admin
```

### 3. Lancer en local
```bash
npm install
npm run dev
# → http://localhost:3000
```

### 4. Pousser sur GitHub
```bash
git init
git add .
git commit -m "feat: MPL Interclub Dashboard v1"
git remote add origin https://github.com/TON_COMPTE/mpl-interclub-dashboard.git
git push -u origin main
```

### 5. Déployer sur Vercel
1. [vercel.com](https://vercel.com) → Import Git Repository
2. Sélectionne ton repo GitHub
3. Dans **Environment Variables**, ajoute les 4 variables `.env.local`
4. Deploy → ✅

---

## 🎯 Fonctionnalités

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Vue d'ensemble des 7 divisions + classements |
| Division | `/divisions/[id]` | Classement complet + calendrier des matchs |
| Calendrier | `/calendar` | Toutes les journées avec statuts |
| Admin Scores | `/admin/scores` | Saisir P1/P2/P3 par match par journée |
| Admin Clubs | `/admin/clubs` | Modifier les noms des clubs |

## 📊 Calcul automatique des classements

La vue SQL `standings` calcule automatiquement :
- **PTS** : 3 pts par victoire de rencontre
- **V/D** : Victoires et défaites de rencontre
- **P.V** : Pairs individuelles gagnées (P1+P2+P3)
- **ΔSets** : Différence de sets
- **ΔJeux** : Différence de jeux
- **Ordre** : PTS → P.V → ΔSets → ΔJeux

## 🏗️ Structure
```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
└── lib/              # Supabase client + TypeScript types
supabase/
├── 001_schema.sql    # Tables + vue standings + triggers
└── 002_seed.sql      # Données initiales (divisions, journées, matchs)
```

## ✏️ Personnaliser les clubs
1. Va sur `/admin/clubs`
2. Clique sur le crayon pour modifier un club
3. Sauvegarde → mise à jour immédiate dans tous les classements

## 🔴 Saisir les scores
1. Va sur `/admin/scores`
2. Sélectionne Division + Journée
3. Clique sur "Saisir scores" pour chaque match
4. Entrée les scores set par set pour P1, P2, P3
5. Le vainqueur est calculé automatiquement
6. Les classements se mettent à jour instantanément
