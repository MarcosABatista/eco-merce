<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import { RouterView } from 'vue-router'

const route = useRoute()
const showHeader = computed(() => route.name !== 'login')
</script>

<template>
  <div class="app-container">
    <AppHeader v-if="showHeader" />
    <main :class="showHeader ? 'main-content' : ''">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}
</style>
