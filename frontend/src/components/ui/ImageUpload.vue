<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, X } from 'lucide-vue-next'
import { uploadFile } from '@/services/uploadService'
import { normalizeImageUrl } from '@/utils/imageUrl'

const props = defineProps<{
  modelValue: string | null
  userId?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'file-selected': [file: File]
}>()

const isDragging = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const localPreview = ref<string | null>(null)

const previewUrl = computed(() => localPreview.value || normalizeImageUrl(props.modelValue))

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

async function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    await handleFile(files[0])
  }
}

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0])
  }
}

async function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('Selecione um arquivo de imagem válido.')
    return
  }

  // Se não tem userId, apenas emite o arquivo para o pai fazer upload depois
  if (!props.userId) {
    localPreview.value = URL.createObjectURL(file)
    emit('file-selected', file)
    return
  }

  isUploading.value = true
  try {
    const url = await uploadFile(file, props.userId)
    emit('update:modelValue', url)
  } catch (err) {
    alert('Erro ao fazer upload da imagem. Verifique se o MinIO está rodando.')
  } finally {
    isUploading.value = false
  }
}

function removeImage() {
  localPreview.value = null
  emit('update:modelValue', null)
}

function triggerFileInput() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="image-upload">
    <div
      v-if="!previewUrl"
      class="upload-zone"
      :class="{ 'upload-zone--dragging': isDragging }"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="triggerFileInput"
    >
      <Upload :size="32" color="#9ca3af" />
      <p class="upload-text" v-if="!isUploading">
        Arraste uma imagem ou <span class="upload-link">clique para selecionar</span>
      </p>
      <p class="upload-text" v-else>Enviando...</p>
    </div>

    <div v-else class="preview-container">
      <img :src="previewUrl" alt="Preview" class="preview-image" />
      <button class="remove-btn" @click="removeImage" aria-label="Remover imagem">
        <X :size="16" />
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="file-input-hidden"
      @change="onFileSelect"
    />
  </div>
</template>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.upload-zone:hover {
  border-color: #6366f1;
  background: #f8f7ff;
}

.upload-zone--dragging {
  border-color: #6366f1;
  background: #ede9fe;
}

.upload-text {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.upload-link {
  color: #6366f1;
  font-weight: 500;
}

.preview-container {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
}

.remove-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}

.remove-btn:hover {
  transform: scale(1.1);
}

.file-input-hidden {
  display: none;
}
</style>
