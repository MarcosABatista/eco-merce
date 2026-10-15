<!-- app/app.vue — Raiz da vitrine: UApp (contexto de toast/overlay do Nuxt UI) envolvendo -->
<!-- NuxtLayout + NuxtPage. É o ponto de montagem único do app; o conteúdo real vem das -->
<!-- páginas (file-based routing) adicionadas nas features seguintes. -->

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
