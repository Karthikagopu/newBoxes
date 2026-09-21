export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const
export type KnownSeverity = (typeof SEVERITIES)[number]
/** 'unset' = the API sent something we can't map (e.g. an empty string). */
export type Severity = KnownSeverity | 'unset'

export const STATUSES = ['open', 'mitigating', 'accepted', 'closed'] as const
export type Status = (typeof STATUSES)[number]

/** Shape of one item in GET /api/programmes/:id/risks, exactly as received. */
export interface RawRisk {
  id: string
  title: string
  severity: string
  status: string
  owner_id: string
  mitigation_count: number
  cost_impact_eur: number
  updated_at: string
}

export interface RisksResponse {
  programme_id: string
  page: number
  page_size: number
  risks: RawRisk[]
}

/** What the UI works with: normalised once at the boundary, never re-parsed per render. */
export interface Risk {
  id: string
  title: string
  severity: Severity
  severityRank: number
  status: Status
  ownerId: string
  mitigationCount: number
  costImpactEur: number
  updatedAt: number // epoch ms
}

export interface Owner {
  id: string
  name: string
}

export type SortKey = 'severity' | 'status' | 'cost' | 'updated'
export type SortDir = 'asc' | 'desc'
export type SortState = { key: SortKey; dir: SortDir } | null

export interface Filters {
  severity: KnownSeverity[]
  status: Status[]
  owners: string[]
}

export interface Chip {
  group: 'severity' | 'status' | 'owners'
  value: string
  label: string
}
