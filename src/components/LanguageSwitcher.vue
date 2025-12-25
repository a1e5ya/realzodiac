<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm font-medium transition-colors flex items-center gap-2"
    >
      <span>{{ currentLocale.toUpperCase() }}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-20 bg-gray-900 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl overflow-hidden z-50"
    >
      <button
        v-for="lang in languages"
        :key="lang"
        @click="selectLanguage(lang)"
        :class="[
          'w-full px-3 py-2 text-center text-sm transition-colors',
          currentLocale === lang
            ? 'bg-purple-600 text-white font-bold'
            : 'text-gray-300 hover:bg-white/10'
        ]"
      >
        {{ lang.toUpperCase() }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const isOpen = ref(false)

const languages = ['en', 'ru', 'fi', 'sv']

const currentLocale = computed(() => locale.value)

const selectLanguage = (code) => {
  locale.value = code
  localStorage.setItem('RealZodiac-language', code)
  isOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const dropdown = event.target.closest('.relative')
  if (!dropdown) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>