import sample from './risks.json'
import { generateRisks } from './generate'
import type { RisksResponse, Status } from '../types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Stand-in for GET /api/programmes/:id/risks. `rows` synthesises a big programme. */
export async function fetchRisks(rows?: number): Promise<RisksResponse> {
  await delay(500) // long enough to see the skeleton
  if (rows && rows > 0) {
    return { programme_id: 'PRG-4417', page: 1, page_size: rows, risks: generateRisks(rows) }
  }
  return sample as RisksResponse
}

/** Stand-in for PATCH /api/risks/:id { status }. Swap the body for a real fetch. */
export async function saveStatus(_id: string, _status: Status): Promise<void> {
  await delay(250)
  // To exercise the rollback path, throw here: throw new Error('boom')
}
