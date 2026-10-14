<script setup lang="ts">
</script>

<template>
  <div id="vitrine-app">
    <a href="#main-content" class="skip-link">Pular para o conteúdo principal</a>
    <router-view />
  </div>
</template>

<style scoped>
#vitrine-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
