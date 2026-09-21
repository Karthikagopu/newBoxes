<script setup lang="ts">
import type { Risk, SortKey, SortState, Status } from '../types'
import { formatAbsolute, formatEur, formatRelative } from '../format'
import { ownerName } from '../data/users'
import SeverityChip from './SeverityChip.vue'
import OwnerAvatar from './OwnerAvatar.vue'
import StatusCell from './StatusCell.vue'

defineProps<{ rows: Risk[]; sort: SortState; loading: boolean; skeletonRows: number }>()
defineEmits<{ sort: [SortKey]; 'change-status': [Risk, Status] }>()

interface Column { id: string; label: string; align?: 'right'; sortKey?: SortKey }
const columns: Column[] = [
  { id: 'id', label: 'ID' },
  { id: 'title', label: 'Title' },
  { id: 'severity', label: 'Severity', sortKey: 'severity' },
  { id: 'status', label: 'Status', sortKey: 'status' },
  { id: 'owner', label: 'Owner' },
  { id: 'mitigations', label: 'Mitigations', align: 'right' },
  { id: 'cost', label: 'Cost impact', align: 'right', sortKey: 'cost' },
  { id: 'updated', label: 'Updated', sortKey: 'updated' },
]

const now = Date.now()

function ariaSort(col: Column, sort: SortState) {
  if (!col.sortKey) return undefined
  if (sort?.key !== col.sortKey) return 'none'
  return sort.dir === 'asc' ? 'ascending' : 'descending'
}
const isActive = (col: Column, sort: SortState) => !!col.sortKey && sort?.key === col.sortKey
</script>

<template>
  <div class="wrap">
    <table>
      <caption class="sr-only">Risks</caption>
      <colgroup>
        <col style="width: 96px" />
        <col />
        <col style="width: 108px" />
        <col style="width: 128px" />
        <col style="width: 172px" />
        <col style="width: 108px" />
        <col style="width: 124px" />
        <col style="width: 124px" />
      </colgroup>
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.id"
            scope="col"
            :class="{ right: col.align === 'right', active: isActive(col, sort) }"
            :aria-sort="ariaSort(col, sort)"
          >
            <button v-if="col.sortKey" type="button" class="sort-btn" @click="$emit('sort', col.sortKey!)">
              {{ col.label }}
              <svg class="arrow" width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
                <path d="M5 1 8.5 5h-7z" :class="{ on: isActive(col, sort) && sort?.dir === 'asc' }" />
                <path d="M5 11 1.5 7h7z" :class="{ on: isActive(col, sort) && sort?.dir === 'desc' }" />
              </svg>
            </button>
            <template v-else>{{ col.label }}</template>
          </th>
        </tr>
      </thead>

      <tbody v-if="loading" aria-busy="true">
        <tr v-for="n in skeletonRows" :key="n" class="skeleton-row">
          <td v-for="col in columns" :key="col.id"><span class="bar" :style="{ width: col.id === 'title' ? '70%' : '60%' }"></span></td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr v-for="r in rows" :key="r.id">
          <td class="id">{{ r.id }}</td>
          <td class="title" :title="r.title">{{ r.title }}</td>
          <td :class="{ sorted: sort?.key === 'severity' }"><SeverityChip :severity="r.severity" /></td>
          <td :class="{ sorted: sort?.key === 'status' }">
            <StatusCell :status="r.status" :risk-id="r.id" @change="$emit('change-status', r, $event)" />
          </td>
          <td>
            <span class="owner">
              <OwnerAvatar :owner-id="r.ownerId" :size="24" />
              <span class="owner-name">{{ ownerName(r.ownerId) }}</span>
            </span>
          </td>
          <td class="right num">{{ r.mitigationCount }}</td>
          <td class="right num" :class="{ sorted: sort?.key === 'cost' }">{{ formatEur(r.costImpactEur) }}</td>
          <td class="muted" :class="{ sorted: sort?.key === 'updated' }" :title="formatAbsolute(r.updatedAt)">{{ formatRelative(r.updatedAt, now) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.wrap { overflow-x: auto; }
table { width: 100%; min-width: 960px; border-collapse: collapse; table-layout: fixed; font-size: var(--font-size-md); }
th, td { padding: 0 var(--space-4); height: 48px; border-bottom: 1px solid var(--color-border); text-align: left; vertical-align: middle; }
tbody tr:last-child td { border-bottom: 0; }
th {
  height: 44px;
  background: var(--color-surface-sunken);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  white-space: nowrap;
}
th.right, td.right { text-align: right; }
th.active { color: var(--color-accent); box-shadow: inset 0 -2px 0 var(--color-accent); }

.sort-btn { display: inline-flex; align-items: center; gap: var(--space-1); margin: 0 calc(var(--space-2) * -1); padding: var(--space-1) var(--space-2); border: 0; border-radius: var(--radius-sm); background: none; color: inherit; font: inherit; cursor: pointer; }
.sort-btn:hover { color: var(--color-text); }
th.active .sort-btn:hover { color: var(--color-accent-hover); }
.arrow path { fill: var(--color-border-strong); }
.arrow path.on { fill: var(--color-accent); }

tbody tr:hover td { background: var(--color-surface-sunken); }
td.sorted { background: color-mix(in srgb, var(--color-surface-sunken) 55%, transparent); }
td.id { font-size: var(--font-size-sm); color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
td.title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
td.num { font-variant-numeric: tabular-nums; }
td.muted { color: var(--color-text-muted); white-space: nowrap; }
.owner { display: flex; align-items: center; gap: var(--space-2); min-width: 0; }
.owner-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.bar { display: block; height: 12px; border-radius: var(--radius-sm); background: linear-gradient(90deg, var(--color-surface-sunken), var(--color-border), var(--color-surface-sunken)); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) { .bar { animation: none; } }
.skeleton-row:hover td { background: none; }
</style>
