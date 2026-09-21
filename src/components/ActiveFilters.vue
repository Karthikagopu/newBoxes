<script setup lang="ts">
import type { Chip } from '../types'

defineProps<{ chips: Chip[] }>()
defineEmits<{ remove: [Chip]; clear: [] }>()
</script>

<template>
  <ul v-if="chips.length" class="chips" aria-label="Active filters">
    <li v-for="c in chips" :key="`${c.group}:${c.value}`">
      <span class="chip">
        {{ c.label }}
        <button type="button" class="remove" :aria-label="`Remove filter ${c.label}`" @click="$emit('remove', c)">
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="m2 2 6 6M8 2 2 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
        </button>
      </span>
    </li>
    <li v-if="chips.length > 1"><button type="button" class="clear" @click="$emit('clear')">Clear all</button></li>
  </ul>
</template>

<style scoped>
.chips { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); margin: 0 0 var(--space-3); padding: 0; list-style: none; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-1) 2px var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  font-size: var(--font-size-sm);
}
.remove {
  display: inline-flex;
  padding: var(--space-1);
  border: 0;
  border-radius: var(--radius-pill);
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
}
.remove:hover { background: var(--color-surface-sunken); color: var(--color-text); }
.clear { border: 0; background: none; padding: var(--space-1) var(--space-2); color: var(--color-accent); font: inherit; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); cursor: pointer; }
.clear:hover { color: var(--color-accent-hover); text-decoration: underline; }
</style>
