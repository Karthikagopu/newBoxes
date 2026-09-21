import type { Owner } from '../types'

// The risks endpoint only returns owner_id. Names come from here because there is
// no users endpoint in the brief (see DECISIONS.md). Avatars are initials, not images.
export const OWNERS: Owner[] = [
  { id: 'usr_8831', name: 'Anna Keller' },
  { id: 'usr_2210', name: 'Marcus Weber' },
  { id: 'usr_5502', name: 'Priya Nair' },
  { id: 'usr_9014', name: 'Tomás Silva' },
  { id: 'usr_3307', name: 'Lena Fischer' },
  { id: 'usr_6120', name: 'Jonas Becker' },
  { id: 'usr_7745', name: 'Sofia Rossi' },
  { id: 'usr_1189', name: 'Daniel Okafor' },
]

const byId = new Map(OWNERS.map((o) => [o.id, o]))

export const ownerName = (id: string) => byId.get(id)?.name ?? 'Unknown owner'

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function avatarHue(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360
  return h
}
