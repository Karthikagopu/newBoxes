<script setup lang="ts">
import { SEVERITIES, STATUSES, type Filters, type Owner } from '../types'
import { capitalise } from '../format'
import OwnerSelect from './OwnerSelect.vue'

const props = defineProps<{ modelValue: Filters; owners: Owner[] }>()
const emit = defineEmits<{ 'update:modelValue': [Filters] }>()

function toggled<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}
const update = (patch: Partial<Filters>) => emit('update:modelValue', { ...props.modelValue, ...patch })
</script>

<template>
  <aside class="panel" aria-label="Filters">
    <h2 class="heading">Filters</h2>

    <fieldset class="group">
      <legend>Severity</legend>
      <label v-for="s in SEVERITIES" :key="s" class="check">
        <input type="checkbox" :checked="modelValue.severity.includes(s)" @change="update({ severity: toggled(modelValue.severity, s) })" />
        <span class="dot" :class="`dot--${s}`" aria-hidden="true"></span>
        {{ capitalise(s) }}
      </label>
    </fieldset>

    <fieldset class="group">
      <legend>Status</legend>
      <label v-for="s in STATUSES" :key="s" class="check">
        <input type="checkbox" :checked="modelValue.status.includes(s)" @change="update({ status: toggled(modelValue.status, s) })" />
        {{ capitalise(s) }}
      </label>
    </fieldset>

    <div class="group">
      <span class="legend">Owner</span>
      <OwnerSelect :model-value="modelValue.owners" :owners="owners" @update:model-value="update({ owners: $event })" />
    </div>
  </aside>
</template>

<style scoped>
.panel {
  align-self: start;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.heading { margin: 0 0 var(--space-4); font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); line-height: var(--line-height-tight); }
.group { display: block; margin: 0 0 var(--space-5); padding: 0; border: 0; min-width: 0; }
.group:last-child { margin-bottom: 0; }
legend, .legend {
  display: block;
  margin-bottom: var(--space-2);
  padding: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
}
.check { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-1) 0; font-size: var(--font-size-md); cursor: pointer; }
.check input { accent-color: var(--color-accent); }
.dot { width: 8px; height: 8px; border-radius: var(--radius-pill); }
.dot--critical { background: var(--color-critical); }
.dot--high { background: var(--color-high); }
.dot--medium { background: var(--color-medium); }
.dot--low { background: var(--color-low); }
</style>
