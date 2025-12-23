<script setup>
import { ref, computed, watch } from 'vue'
import { Search, MapPin, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ lat: 60.1699, lon: 24.9384, name: 'Helsinki, Finland' })
  }
})

const emit = defineEmits(['update:modelValue'])

// State
const searchQuery = ref('')
const suggestions = ref([])
const isLoading = ref(false)
const isOpen = ref(false)
const selectedLocation = ref(props.modelValue)

// Debounce timer
let searchTimeout = null

// Search locations using Photon API
const searchLocations = async (query) => {
  if (!query || query.length < 2) {
    suggestions.value = []
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=en`
    )
    const data = await response.json()

    suggestions.value = data.features.map(feature => ({
      name: feature.properties.name || 'Unknown',
      city: feature.properties.city,
      state: feature.properties.state,
      country: feature.properties.country,
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      type: feature.properties.type,
      osm_type: feature.properties.osm_type,
      // Build display name
      displayName: [
        feature.properties.name,
        feature.properties.city,
        feature.properties.state,
        feature.properties.country
      ].filter(Boolean).join(', ')
    }))

    isOpen.value = suggestions.value.length > 0

  } catch (error) {
    console.error('Location search error:', error)
    suggestions.value = []
  } finally {
    isLoading.value = false
  }
}

// Debounced search
const onInput = (event) => {
  const query = event.target.value
  searchQuery.value = query

  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchLocations(query)
  }, 300)
}

// Select location
const selectLocation = (location) => {
  selectedLocation.value = {
    lat: location.lat,
    lon: location.lon,
    name: location.displayName
  }
  
  searchQuery.value = location.displayName
  isOpen.value = false
  suggestions.value = []
  
  emit('update:modelValue', selectedLocation.value)
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  setTimeout(() => {
    isOpen.value = false
  }, 200)
}

// Icon for location type
const getLocationIcon = (type) => {
  const icons = {
    city: '🏙️',
    town: '🏘️',
    village: '🏡',
    hamlet: '🏠',
    country: '🌍',
    state: '📍',
    county: '📍',
  }
  return icons[type] || '📍'
}

// Display current location
const currentLocationName = computed(() => {
  return selectedLocation.value.name
})

// Initialize with current location
watch(() => props.modelValue, (newVal) => {
  selectedLocation.value = newVal
  searchQuery.value = newVal.name
}, { immediate: true })
</script>

<template>
  <div class="location-picker">
    <!-- Search Input -->
    <div class="relative">
      <div class="relative">
        <Search 
          :size="16" 
          class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          :value="searchQuery"
          @input="onInput"
          @focus="isOpen = suggestions.length > 0"
          @blur="closeDropdown"
          placeholder="Search city..."
          class="w-full pl-8 pr-8 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
        <Loader2 
          v-if="isLoading"
          :size="16" 
          class="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 animate-spin"
        />
      </div>

      <!-- Suggestions Dropdown -->
      <div
        v-if="isOpen && suggestions.length > 0"
        class="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
      >
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          @click="selectLocation(suggestion)"
          class="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 flex items-start gap-2"
        >
          <span class="text-sm mt-0.5">{{ getLocationIcon(suggestion.type) }}</span>
          <div class="flex-1">
            <div class="text-white text-xs font-medium">
              {{ suggestion.name }}
            </div>
            <div class="text-[10px] text-gray-400">
              {{ [suggestion.city, suggestion.state, suggestion.country].filter(Boolean).join(', ') }}
            </div>
          </div>
        </button>
      </div>

      <!-- No results -->
      <div
        v-if="isOpen && !isLoading && suggestions.length === 0 && searchQuery.length >= 2"
        class="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg px-3 py-2 text-gray-400 text-[10px]"
      >
        No locations found
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #1f2937;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>