import type { RawRisk } from '../types'
import { OWNERS } from './users'

// Deterministic PRNG so "?rows=10000" always produces the same data.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SUBJECTS = ['Casting supplier', 'Weld inspection', 'Harness routing', 'Coating line', 'Torque spec', 'Calibration fixtures', 'Press operator training', 'Packaging spec', 'Supplier audit', 'Drawing revision', 'Coolant contract', 'Fixture wear', 'Paint shop capacity', 'Firmware release', 'Tooling lead time']
const ISSUES = ['single-sourced', 'below spec', 'overdue', 'capacity constrained', 'not finalised', 'ambiguous in work instruction', 'delayed at Site B', 'expiring next quarter', 'causing rework', 'not propagated to Site C']
// Deliberately messy, like the real sample: mixed casing, "Moderate", and blanks.
const SEVERITIES = ['Critical', 'critical', 'High', 'HIGH', 'High', 'Medium', 'medium', 'Medium', 'Moderate', 'Low', 'Low', 'low', '']
const STATUSES = ['open', 'open', 'mitigating', 'mitigating', 'accepted', 'closed']

export function generateRisks(count: number): RawRisk[] {
  const rand = mulberry32(4417)
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    id: `RSK-${1000 + i}`,
    title: `${pick(SUBJECTS)} ${pick(ISSUES)}${rand() < 0.15 ? ' — impacts the export variant and the Q4 ramp plan across all three sites' : ''}`,
    severity: pick(SEVERITIES),
    status: pick(STATUSES),
    owner_id: pick(OWNERS).id,
    mitigation_count: Math.floor(rand() * 7),
    cost_impact_eur: Math.round((rand() ** 3 * 600_000) / 500) * 500,
    updated_at: new Date(now - rand() * 180 * 86_400_000).toISOString(),
  }))
}
