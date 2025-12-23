<template>
  <div class="fixed bottom-4 left-4 z-50">
    <div class="bg-black/50 backdrop-blur-md rounded-lg border border-purple-500/30 p-2">
      <div class="flex gap-1">
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          :class="[
            'px-3 py-1 rounded text-sm font-medium transition-all',
            currentLocale === lang.code
              ? 'bg-purple-500 text-white'
              : 'text-purple-300 hover:bg-purple-500/20'
          ]"
          :title="lang.name"
        >
          {{ lang.flag }} {{ lang.code.toUpperCase() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' }
]

const currentLocale = computed(() => locale.value)

const changeLanguage = (lang) => {
  locale.value = lang
  // Save preference
  localStorage.setItem('RealZodiac-language', lang)
}
</script>
