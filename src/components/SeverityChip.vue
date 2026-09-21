<script setup lang="ts">
import type { Severity } from '../types'
import { capitalise } from '../format'

defineProps<{ severity: Severity }>()
</script>

<template>
  <!-- The text label carries the meaning; colour is reinforcement, not the only signal. -->
  <span class="chip" :class="`chip--${severity}`">{{ severity === 'unset' ? 'Not set' : capitalise(severity) }}</span>
</template>

<style scoped>
.chip {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-pill);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  white-space: nowrap;
}
.chip--critical { color: var(--color-critical); background: var(--color-critical-bg); }
.chip--high { color: var(--color-high); background: var(--color-high-bg); }
.chip--medium { color: var(--color-medium); background: var(--color-medium-bg); }
.chip--low { color: var(--color-low); background: var(--color-low-bg); }
.chip--unset {
  color: var(--color-text-muted);
  background: var(--color-surface-sunken);
  box-shadow: inset 0 0 0 1px var(--color-border);
}
</style>
