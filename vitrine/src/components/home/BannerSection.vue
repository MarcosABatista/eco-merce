<script setup lang="ts">
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'

const props = defineProps<{
  title: string
}>()

const { truncateText } = useFormatters()

const displayTitle = computed(() => truncateText(props.title, 60))
</script>

<template>
  <section class="banner-section" aria-label="Banner promocional">
    <h2 class="banner-title">{{ displayTitle }}</h2>
  </section>
</template>

<style scoped>
.banner-section {
  width: 100%;
  background: linear-gradient(135deg, #1a2a4a, #2d3f5e);
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.banner-title {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

@media (min-width: 768px) {
  .banner-section {
    padding: 2.5rem 2rem;
  }

  .banner-title {
    font-size: 2rem;
  }
}
</style>
