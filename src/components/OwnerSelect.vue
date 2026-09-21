<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Owner } from '../types'
import { ownerName } from '../data/users'
import OwnerAvatar from './OwnerAvatar.vue'

const props = defineProps<{ modelValue: string[]; owners: Owner[] }>()
const emit = defineEmits<{ 'update:modelValue': [string[]] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)

const summary = computed(() => {
  const n = props.modelValue.length
  if (n === 0) return 'All owners'
  if (n === 1) return ownerName(props.modelValue[0])
  return `${n} owners`
})

function toggle(id: string) {
  emit('update:modelValue', props.modelValue.includes(id) ? props.modelValue.filter((v) => v !== id) : [...props.modelValue, id])
}

function onDocMouseDown(e: MouseEvent) {
  if (open.value && !root.value?.contains(e.target as Node)) open.value = false
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    open.value = false
    button.value?.focus()
  }
}
onMounted(() => document.addEventListener('mousedown', onDocMouseDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocMouseDown))
</script>

<template>
  <div ref="root" class="owner-select" @keydown="onKeydown">
    <button ref="button" type="button" class="trigger" :aria-expanded="open" @click="open = !open">
      <span class="trigger-label">{{ summary }}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
    <div v-if="open" class="menu" role="group" aria-label="Owners">
      <label v-for="o in owners" :key="o.id" class="option">
        <input type="checkbox" :checked="modelValue.includes(o.id)" @change="toggle(o.id)" />
        <OwnerAvatar :owner-id="o.id" :size="20" />
        <span>{{ o.name }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.owner-select { position: relative; }
.trigger {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-md);
  cursor: pointer;
}
.trigger:hover { border-color: var(--color-text-muted); }
.trigger-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + var(--space-1));
  left: 0;
  right: 0;
  max-height: 264px;
  overflow-y: auto;
  padding: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}
.option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-md);
  cursor: pointer;
}
.option:hover { background: var(--color-surface-sunken); }
.option input { accent-color: var(--color-accent); }
</style>
