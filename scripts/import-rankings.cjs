const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')
const { createClient } = require('@supabase/supabase-js')

const ROOT = process.cwd()
const RANKING_FILE = path.join(ROOT, 'Padel League - RANKINGS - APR 26.xlsx')
const MEMBERS_FILE = path.join(ROOT, 'LISTE DES JOUEURS CLUBS.xlsx')

const norm = value => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^A-Z0-9]+/gi, ' ')
  .trim()
  .toUpperCase()

const clean = value => String(value ?? '').trim()

const clubAlias = value => {
  const key = norm(value)
  if (!key) return ''
  if (key.includes('URBAN SPORT') && key.includes('GRAND BAIE')) return 'Urban Sport Grand Baie'
  if (key.includes('URBAN SPORT') && (key.includes('RIVIERE NOIRE') || key.includes('BLACK RIVER'))) return 'Urban Sport Black River'
  if (key.includes('RM CLUB') && key.includes('GRAND BAIE')) return 'RM Club Forbach'
  if (key.includes('RM CLUB') && key.includes('TAMARIN')) return 'RM Club Tamarin'
  if (key.includes('RM CLUB') && key.includes('AZURI')) return 'Studio by RM Azuri'
  if (key.includes('RM CLUB') && key.includes('PORT CHAMBLY')) return 'I Padel by RM Port Chambly'
  if (key.includes('RM CLUB') && key.includes('HENNESSY')) return 'I Padel by RM Hennessy'
  if (key.includes('ISLA')) return 'Isla Padel Grand Baie'
  if (key.includes('OXYGEN')) return 'Oxygen Moka'
  if (key.includes('CANA')) return 'Cana Beau Plan'
  if (key.includes('SPARC')) return 'SPARC Cascavelle'
  if (key.includes('LABOURDONNAIS') || key.includes('LSC')) return 'Labourdonnais Mapou'
  if (key.includes('MONT CHOISY') || key.includes('MCG')) return 'Mont Choisy Golf'
  if (key.includes('ENERGIA')) return 'Energia Pointe aux Canonniers'
  if (key.includes('TERRES BRUNES')) return 'Terres Brunes Sports & Leisure'
  if (key.includes('CLUB HOUSE')) return 'Club House Black River'
  return clean(value)
}

function loadMemberMap() {
  const wb = XLSX.readFile(MEMBERS_FILE)
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
  const map = new Map()
  for (const row of rows) {
    const first = clean(row.Name)
    const last = clean(row.Surname)
    if (!first && !last) continue
    const info = {
      mobile: clean(row.Mobile),
      email: clean(row.Email),
      club_name: clubAlias(row.Club),
      source_club_name: clean(row.Club),
      level: clean(row.Level),
    }
    for (const key of [norm(`${first} ${last}`), norm(`${last} ${first}`)]) {
      if (key && !map.has(key)) map.set(key, info)
    }
  }
  return map
}

function pointValue(row) {
  const key = Object.keys(row).find(item => norm(item) === 'TOTAL POINTS')
  return key ? Number(row[key] || 0) : 0
}

function parseRanking(sheetName, gender, members) {
  const wb = XLSX.readFile(RANKING_FILE)
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' })
  return rows
    .filter(row => clean(row.PLAYERS))
    .map(row => {
      const player = clean(row.PLAYERS)
      const info = members.get(norm(player)) ?? {}
      return {
        gender,
        rank: Number(row.RANK) || null,
        previous_rank: Number(row.RANK_1) || null,
        player_name: player,
        total_points: pointValue(row),
        club_name: info.club_name ?? '',
        source_club_name: info.source_club_name ?? '',
        mobile: info.mobile ?? '',
        email: info.email ?? '',
        level: info.level ?? '',
        source: 'Padel League - RANKINGS - APR 26.xlsx',
      }
    })
}

function loadRows() {
  const members = loadMemberMap()
  return [
    ...parseRanking('RANKING - MEN', 'H', members),
    ...parseRanking('RANKING WOMEN', 'F', members),
  ]
}

async function importSupabase(rows) {
  const env = Object.fromEntries(fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      const index = line.indexOf('=')
      return [line.slice(0, index), line.slice(index + 1)]
    }))
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { error: deleteError } = await sb.from('player_rankings').delete().neq('player_name', '__never__')
  if (deleteError) throw deleteError
  for (let index = 0; index < rows.length; index += 500) {
    const { error } = await sb.from('player_rankings').insert(rows.slice(index, index + 500))
    if (error) throw error
  }
}

function writeSeedSql(rows) {
  const sqlValue = value => {
    if (value === null || value === undefined || value === '') return 'NULL'
    return `'${String(value).replace(/'/g, "''")}'`
  }
  const sqlNumber = value => {
    if (value === null || value === undefined || value === '') return 'NULL'
    const numeric = Number(value)
    return Number.isFinite(numeric) ? String(numeric) : 'NULL'
  }
  const values = rows.map(row => `  (${[
    sqlValue(row.gender),
    sqlNumber(row.rank),
    sqlNumber(row.previous_rank),
    sqlValue(row.player_name),
    sqlNumber(row.total_points),
    sqlValue(row.club_name),
    sqlValue(row.source_club_name),
    sqlValue(row.mobile),
    sqlValue(row.email),
    sqlValue(row.level),
    sqlValue(row.source),
  ].join(', ')})`)

  const sql = [
    '-- Generated from scripts/import-rankings.cjs',
    'TRUNCATE TABLE player_rankings;',
    'INSERT INTO player_rankings (gender, rank, previous_rank, player_name, total_points, club_name, source_club_name, mobile, email, level, source) VALUES',
    `${values.join(',\n')};`,
    "NOTIFY pgrst, 'reload schema';",
    '',
  ].join('\n')
  const out = path.join(ROOT, 'supabase', '009_player_rankings_seed.sql')
  fs.writeFileSync(out, sql)
  console.log(`Generated seed SQL into ${out}`)
}

async function main() {
  const rows = loadRows()
  const out = path.join(ROOT, 'src', 'data', 'playerRankings.json')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`)
  console.log(`Generated ${rows.length} rankings into ${out}`)
  if (process.argv.includes('--supabase')) {
    await importSupabase(rows)
    console.log(`Imported ${rows.length} rankings into Supabase`)
  }
  if (process.argv.includes('--sql')) writeSeedSql(rows)
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
