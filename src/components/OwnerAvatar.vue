<script setup lang="ts">
import { avatarHue, initials, ownerName } from '../data/users'

const props = withDefaults(defineProps<{ ownerId: string; size?: number }>(), { size: 24 })
const hue = avatarHue(props.ownerId)
</script>

<template>
  <span
    class="avatar"
    aria-hidden="true"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.round(size * 0.42)}px`,
      background: `hsl(${hue} 45% 90%)`,
      color: `hsl(${hue} 55% 26%)`,
    }"
  >{{ initials(ownerName(ownerId)) }}</span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.02em;
}
</style>
