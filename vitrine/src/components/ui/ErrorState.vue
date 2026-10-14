<script setup lang="ts">
defineProps<{
  message: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="error-state" role="alert">
    <p class="error-state__message">{{ message }}</p>
    <button
      class="error-state__retry-btn"
      type="button"
      @click="emit('retry')"
    >
      Tentar novamente
    </button>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  gap: 1rem;
}

.error-state__message {
  font-size: 1rem;
  color: #333;
  margin: 0;
  line-height: 1.5;
}

.error-state__retry-btn {
  padding: 0.75rem 1.5rem;
  min-width: 44px;
  min-height: 44px;
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  background-color: #1a2a4a;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.error-state__retry-btn:hover {
  background-color: #2d3f5e;
}

.error-state__retry-btn:focus-visible {
  outline: 2px solid #1a2a4a;
  outline-offset: 2px;
}

.error-state__retry-btn:active {
  background-color: #1e40af;
}
</style>
