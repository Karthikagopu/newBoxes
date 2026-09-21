<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { STATUSES, type Status } from '../types'
import { capitalise } from '../format'

const props = defineProps<{ status: Status; riskId: string }>()
const emit = defineEmits<{ change: [Status] }>()

const open = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const pos = ref({ top: 0, left: 0 })

const ITEM_HEIGHT = 32

async function openMenu() {
  // Menu is position: fixed so the table's overflow container can't clip it.
  const r = trigger.value!.getBoundingClientRect()
  const height = STATUSES.length * ITEM_HEIGHT + 8
  const flip = window.innerHeight - r.bottom < height + 8
  pos.value = { top: flip ? r.top - height - 4 : r.bottom + 4, left: r.left }
  open.value = true
  document.addEventListener('mousedown', onOutside)
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', onScroll)
  await nextTick()
  menu.value?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus()
}

function close(restoreFocus = true) {
  open.value = false
  document.removeEventListener('mousedown', onOutside)
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', onScroll)
  if (restoreFocus) trigger.value?.focus()
}

// Escape (or clicking away) closes without emitting: the value is only ever
// committed on an explicit selection, so there is nothing to "revert".
function choose(s: Status) {
  close()
  if (s !== props.status) emit('change', s)
}

function onOutside(e: MouseEvent) {
  const t = e.target as Node
  if (!menu.value?.contains(t) && !trigger.value?.contains(t)) close(false)
}
const onScroll = () => close(false)

function onKeydown(e: KeyboardEvent) {
  const items = Array.from(menu.value?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])
  const i = items.indexOf(document.activeElement as HTMLElement)
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    items[(i + 1) % items.length]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    items[(i - 1 + items.length) % items.length]?.focus()
  } else if (e.key === 'Tab') {
    close(false)
  }
}

onBeforeUnmount(() => close(false))
</script>

<template>
  <button
    ref="trigger"
    type="button"
    class="trigger"
    aria-haspopup="listbox"
    :aria-expanded="open"
    :aria-label="`Status of ${riskId}: ${capitalise(status)}. Change status`"
    @click="open ? close() : openMenu()"
  >
    {{ capitalise(status) }}
    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </button>

  <Teleport to="body">
    <ul v-if="open" ref="menu" class="menu" role="listbox" aria-label="Status" :style="{ top: `${pos.top}px`, left: `${pos.left}px` }" @keydown="onKeydown">
      <li
        v-for="s in STATUSES"
        :key="s"
        role="option"
        tabindex="-1"
        :aria-selected="s === status"
        :class="{ selected: s === status }"
        @click="choose(s)"
        @keydown.enter.prevent="choose(s)"
        @keydown.space.prevent="choose(s)"
      >{{ capitalise(s) }}</li>
    </ul>
  </Teleport>
</template>

<style scoped>
.trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin: calc(var(--space-1) * -1) calc(var(--space-2) * -1);
  padding: var(--space-1) var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.trigger svg { color: var(--color-text-muted); opacity: 0; }
.trigger:hover, .trigger:focus-visible, .trigger[aria-expanded='true'] { border-color: var(--color-border-strong); background: var(--color-surface); }
.trigger:hover svg, .trigger:focus-visible svg, .trigger[aria-expanded='true'] svg { opacity: 1; }

.menu {
  position: fixed;
  z-index: 100;
  min-width: 140px;
  margin: 0;
  padding: var(--space-1);
  list-style: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  font-size: var(--font-size-md);
}
.menu li { height: 32px; display: flex; align-items: center; padding: 0 var(--space-3); border-radius: var(--radius-sm); cursor: pointer; }
.menu li:hover, .menu li:focus { background: var(--color-surface-sunken); outline: none; }
.menu li.selected { font-weight: var(--font-weight-semibold); }
</style>
