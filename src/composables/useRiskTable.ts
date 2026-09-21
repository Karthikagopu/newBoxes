import { computed, ref, shallowRef, triggerRef, watch } from 'vue'
import { fetchRisks, saveStatus } from '../data/api'
import { normalizeRisk, STATUS_RANK } from '../normalize'
import type { Filters, Risk, SortKey, SortState, Status } from '../types'

export const PAGE_SIZE = 25

const SORT_VALUE: Record<SortKey, (r: Risk) => number> = {
  severity: (r) => r.severityRank,
  status: (r) => STATUS_RANK[r.status],
  cost: (r) => r.costImpactEur,
  updated: (r) => r.updatedAt,
}

const emptyFilters = (): Filters => ({ severity: [], status: [], owners: [] })

export function useRiskTable() {
  // shallowRef: 10k row objects should not be wrapped in deep reactive proxies.
  // We mutate a row in place on status edit and call triggerRef instead.
  const rows = shallowRef<Risk[]>([])
  const programmeId = ref('')
  const loading = ref(true)
  const error = ref<string | null>(null)
  const saveError = ref<string | null>(null)

  const filters = ref<Filters>(emptyFilters())
  const sort = ref<SortState>(null)
  const page = ref(1)

  async function load(rowCount?: number) {
    loading.value = true
    error.value = null
    try {
      const res = await fetchRisks(rowCount)
      programmeId.value = res.programme_id
      rows.value = res.risks.map(normalizeRisk)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Something went wrong'
    } finally {
      loading.value = false
    }
  }

  const hasFilters = computed(() => {
    const f = filters.value
    return f.severity.length + f.status.length + f.owners.length > 0
  })

  const filtered = computed(() => {
    if (!hasFilters.value) return rows.value
    const sev = new Set<string>(filters.value.severity)
    const sta = new Set<string>(filters.value.status)
    const own = new Set<string>(filters.value.owners)
    // Within a group: OR. Across groups: AND.
    return rows.value.filter(
      (r) => (!sev.size || sev.has(r.severity)) && (!sta.size || sta.has(r.status)) && (!own.size || own.has(r.ownerId)),
    )
  })

  const sorted = computed(() => {
    const s = sort.value
    if (!s) return filtered.value // "none" = the order the API gave us
    const value = SORT_VALUE[s.key]
    const dir = s.dir === 'asc' ? 1 : -1
    return [...filtered.value].sort((a, b) => (value(a) - value(b)) * dir) // Array.sort is stable
  })

  const filteredCount = computed(() => sorted.value.length)
  const pageCount = computed(() => Math.max(1, Math.ceil(filteredCount.value / PAGE_SIZE)))
  const pageRows = computed(() => sorted.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

  watch([filters, sort], () => (page.value = 1), { deep: true })
  watch(pageCount, (n) => {
    if (page.value > n) page.value = n
  })

  /** ascending -> descending -> none, per the spec. Switching column starts at ascending. */
  function cycleSort(key: SortKey) {
    const s = sort.value
    if (!s || s.key !== key) sort.value = { key, dir: 'asc' }
    else if (s.dir === 'asc') sort.value = { key, dir: 'desc' }
    else sort.value = null
  }

  function clearFilters() {
    filters.value = emptyFilters()
  }

  /** Optimistic: update the UI now, roll back if the save fails. */
  async function changeStatus(risk: Risk, next: Status) {
    const prev = risk.status
    risk.status = next
    triggerRef(rows)
    try {
      await saveStatus(risk.id, next)
    } catch {
      risk.status = prev
      triggerRef(rows)
      saveError.value = `Couldn't save the status for ${risk.id}. It's back to ${prev}.`
    }
  }

  return {
    programmeId, loading, error, saveError,
    filters, sort, page,
    hasFilters, totalCount: computed(() => rows.value.length),
    filteredCount, pageCount, pageRows,
    load, cycleSort, clearFilters, changeStatus,
  }
}
