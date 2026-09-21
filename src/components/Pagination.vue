<script setup lang="ts">
import { computed } from 'vue'
import { formatCount } from '../format'

const props = defineProps<{ page: number; pageCount: number; pageSize: number; total: number }>()
defineEmits<{ 'update:page': [number] }>()

const from = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const to = computed(() => Math.min(props.page * props.pageSize, props.total))

// 1 … 4 5 6 … 12  (first, last, and a window around the current page)
const items = computed<(number | '…')[]>(() => {
  const keep = new Set([1, props.pageCount, props.page - 1, props.page, props.page + 1])
  const nums = [...keep].filter((n) => n >= 1 && n <= props.pageCount).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('…')
    out.push(n)
  })
  return out
})
</script>

<template>
  <div v-if="total > 0" class="pagination">
    <p class="summary">Showing {{ formatCount(from) }}–{{ formatCount(to) }} of {{ formatCount(total) }}</p>
    <nav v-if="pageCount > 1" aria-label="Pagination">
      <ul>
        <li><button type="button" :disabled="page === 1" @click="$emit('update:page', page - 1)">Previous</button></li>
        <li v-for="(it, i) in items" :key="`${it}-${i}`">
          <span v-if="it === '…'" class="gap" aria-hidden="true">…</span>
          <button v-else type="button" class="num" :class="{ current: it === page }" :aria-current="it === page ? 'page' : undefined" :aria-label="`Page ${it}`" @click="$emit('update:page', it)">{{ it }}</button>
        </li>
        <li><button type="button" :disabled="page === pageCount" @click="$emit('update:page', page + 1)">Next</button></li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-top: 1px solid var(--color-border); }
.summary { margin: 0; font-size: var(--font-size-sm); color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
ul { display: flex; align-items: center; gap: var(--space-1); margin: 0; padding: 0; list-style: none; }
button { min-width: 32px; height: 32px; padding: 0 var(--space-2); border: 1px solid transparent; border-radius: var(--radius-sm); background: none; color: var(--color-text); font: inherit; font-size: var(--font-size-sm); cursor: pointer; font-variant-numeric: tabular-nums; }
button:hover:not(:disabled) { background: var(--color-surface-sunken); }
button:disabled { color: var(--color-border-strong); cursor: not-allowed; }
button.current { border-color: var(--color-accent); background: var(--color-accent); color: var(--color-text-inverse); }
.gap { display: inline-block; min-width: 24px; text-align: center; color: var(--color-text-muted); }
</style>
