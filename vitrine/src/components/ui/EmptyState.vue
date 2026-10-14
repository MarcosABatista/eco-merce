<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <section class="empty-state" role="status" aria-live="polite">
    <div class="empty-state__icon" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    </div>
    <p class="empty-state__message">{{ message }}</p>
  </section>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-state__icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state__message {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
  max-width: 320px;
  line-height: 1.5;
}
</style>
