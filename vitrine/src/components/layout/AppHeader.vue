<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  search: [term: string]
}>()

const searchTerm = ref('')

function handleSearch() {
  emit('search', searchTerm.value.trim())
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSearch()
  }
}
</script>

<template>
  <header class="app-header" role="banner">
    <nav class="app-header__nav" aria-label="Navegação principal">
    <div class="app-header__logo">
      <span class="app-header__logo-text">PLACE OFFERS</span>
    </div>

    <div class="app-header__search">
      <input
        v-model="searchTerm"
        type="text"
        class="app-header__search-input"
        placeholder="Buscar produtos..."
        aria-label="Buscar produtos"
        @keydown="handleKeydown"
      />
      <button
        class="app-header__search-button"
        type="button"
        aria-label="Buscar"
        @click="handleSearch"
      >
        Buscar
      </button>
    </div>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.app-header__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 64px;
}

.app-header__logo {
  flex-shrink: 0;
}

.app-header__logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2a4a;
  letter-spacing: 0.05em;
}

.app-header__search {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 500px;
  margin: 0 auto;
}

.app-header__search-input {
  flex: 1;
  height: 44px;
  padding: 0 1rem;
  border: 1px solid #d1d5db;
  border-right: none;
  border-radius: 6px 0 0 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.app-header__search-input:focus-visible {
  border-color: #1a2a4a;
  box-shadow: 0 0 0 2px rgba(26, 42, 74, 0.2);
}

.app-header__search-button {
  height: 44px;
  min-width: 44px;
  padding: 0 1rem;
  border: 1px solid #1a2a4a;
  border-radius: 0 6px 6px 0;
  background-color: #1a2a4a;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.app-header__search-button:hover {
  background-color: #2d3f5e;
}

.app-header__search-button:focus-visible {
  outline: 2px solid #1a2a4a;
  outline-offset: 2px;
}

.app-header__search-button:active {
  background-color: #0f1a2e;
}

@media (max-width: 767px) {
  .app-header__nav {
    padding: 0 1rem;
  }

  .app-header__logo-text {
    font-size: 1rem;
  }

  .app-header__search {
    max-width: none;
    margin-left: 1rem;
  }

  .app-header__search-input {
    min-height: 44px;
  }

  .app-header__search-button {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>
