import { STATUSES, type KnownSeverity, type RawRisk, type Risk, type Severity, type Status } from './types'

// "Moderate" is not one of the four levels in the spec. Assumption: it means Medium.
// Flagged in DECISIONS.md as something to confirm with the backend team.
const SEVERITY_ALIASES: Record<string, KnownSeverity> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  moderate: 'medium',
  low: 'low',
}

// Lower rank = more severe, so the first click on the Severity header ("ascending")
// puts Critical at the top, which is what a programme manager wants to see.
export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  unset: 4,
}

export const STATUS_RANK: Record<Status, number> = Object.fromEntries(
  STATUSES.map((s, i) => [s, i]),
) as Record<Status, number>

export function normalizeSeverity(raw: string): Severity {
  return SEVERITY_ALIASES[raw.trim().toLowerCase()] ?? 'unset'
}

export function normalizeStatus(raw: string): Status {
  const s = raw.trim().toLowerCase()
  if ((STATUSES as readonly string[]).includes(s)) return s as Status
  console.warn(`Unknown status "${raw}", falling back to "open"`)
  return 'open'
}

export function normalizeRisk(r: RawRisk): Risk {
  const severity = normalizeSeverity(r.severity)
  return {
    id: r.id,
    title: r.title,
    severity,
    severityRank: SEVERITY_RANK[severity],
    status: normalizeStatus(r.status),
    ownerId: r.owner_id,
    mitigationCount: r.mitigation_count,
    costImpactEur: r.cost_impact_eur,
    updatedAt: Date.parse(r.updated_at),
  }
}
