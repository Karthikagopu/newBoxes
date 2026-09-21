<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import FilterPanel from './components/FilterPanel.vue'
import ActiveFilters from './components/ActiveFilters.vue'
import RiskTable from './components/RiskTable.vue'
import Pagination from './components/Pagination.vue'
import { PAGE_SIZE, useRiskTable } from './composables/useRiskTable'
import { OWNERS, ownerName } from './data/users'
import { capitalise, formatCount } from './format'
import type { Chip, Filters, Risk, Status } from './types'

const t = useRiskTable()

// ?rows=10000 swaps the 12-row sample for generated data, to check performance.
onMounted(() => {
  const n = Number(new URLSearchParams(location.search).get('rows'))
  t.load(Number.isFinite(n) && n > 0 ? n : undefined)
})

const chips = computed<Chip[]>(() => {
  const f = t.filters.value
  return [
    ...f.severity.map((v) => ({ group: 'severity' as const, value: v, label: `Severity: ${capitalise(v)}` })),
    ...f.status.map((v) => ({ group: 'status' as const, value: v, label: `Status: ${capitalise(v)}` })),
    ...f.owners.map((v) => ({ group: 'owners' as const, value: v, label: `Owner: ${ownerName(v)}` })),
  ]
})

function removeChip(chip: Chip) {
  const f = t.filters.value
  t.filters.value = { ...f, [chip.group]: (f[chip.group] as string[]).filter((v) => v !== chip.value) } as Filters
}

const isEmpty = computed(() => !t.loading.value && !t.error.value && t.filteredCount.value === 0)
const resultsMessage = computed(() => (t.loading.value ? '' : `${formatCount(t.filteredCount.value)} risks shown`))

// Auto-dismiss the save error so it doesn't linger.
let timer: ReturnType<typeof setTimeout> | undefined
watch(t.saveError, (msg) => {
  clearTimeout(timer)
  if (msg) timer = setTimeout(() => (t.saveError.value = null), 6000)
})

const onChangeStatus = (risk: Risk, next: Status) => t.changeStatus(risk, next)
</script>

<template>
  <div class="page">
    <header class="header">
      <h1>Risk register</h1>
      <p v-if="t.programmeId.value" class="sub">Programme {{ t.programmeId.value }}</p>
    </header>

    <div class="layout">
      <FilterPanel v-model="t.filters.value" :owners="OWNERS" />

      <main class="main">
        <ActiveFilters :chips="chips" @remove="removeChip" @clear="t.clearFilters" />

        <p v-if="t.saveError.value" class="toast" role="alert">{{ t.saveError.value }}</p>
        <p class="sr-only" aria-live="polite">{{ resultsMessage }}</p>

        <section class="card">
          <div v-if="t.error.value" class="state" role="alert">
            <p class="state-title">Couldn't load risks</p>
            <p class="state-body">{{ t.error.value }}</p>
            <button type="button" class="btn" @click="t.load()">Try again</button>
          </div>

          <template v-else>
            <RiskTable
              :rows="t.pageRows.value"
              :sort="t.sort.value"
              :loading="t.loading.value"
              :skeleton-rows="10"
              @sort="t.cycleSort"
              @change-status="onChangeStatus"
            />

            <div v-if="isEmpty" class="state">
              <template v-if="t.hasFilters.value">
                <p class="state-title">No risks match these filters</p>
                <button type="button" class="btn" @click="t.clearFilters">Clear filters</button>
              </template>
              <p v-else class="state-title">No risks in this programme yet</p>
            </div>

            <Pagination
              v-if="!t.loading.value"
              v-model:page="t.page.value"
              :page-count="t.pageCount.value"
              :page-size="PAGE_SIZE"
              :total="t.filteredCount.value"
            />
          </template>
        </section>
      </main>
    </div>
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--color-surface-sunken);
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
}
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
</style>

<style scoped>
.page { max-width: 1600px; margin: 0 auto; padding: var(--space-5); }
.header { display: flex; align-items: baseline; gap: var(--space-3); margin-bottom: var(--space-5); }
h1 { margin: 0; font-size: 20px; font-weight: var(--font-weight-semibold); line-height: var(--line-height-tight); }
.sub { margin: 0; color: var(--color-text-muted); font-size: var(--font-size-sm); }

.layout { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: var(--space-5); align-items: start; }
@media (max-width: 900px) { .layout { grid-template-columns: minmax(0, 1fr); } }

.main { min-width: 0; }
.card { overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); box-shadow: var(--shadow-sm); }

.state { padding: var(--space-6) var(--space-4); text-align: center; border-top: 1px solid var(--color-border); }
.state-title { margin: 0 0 var(--space-3); font-weight: var(--font-weight-semibold); }
.state-body { margin: 0 0 var(--space-3); color: var(--color-text-muted); }
.btn { padding: var(--space-2) var(--space-4); border: 0; border-radius: var(--radius-md); background: var(--color-accent); color: var(--color-text-inverse); font: inherit; font-weight: var(--font-weight-medium); cursor: pointer; }
.btn:hover { background: var(--color-accent-hover); }

.toast { margin: 0 0 var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); background: var(--color-critical-bg); color: var(--color-critical); font-size: var(--font-size-sm); }
</style>
