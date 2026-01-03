<template>
  <div class="min-h-screen bg-black text-white">
    
    <!-- Hero Section -->
    <section id="hero" class="min-h-screen flex flex-col border-b border-purple-500/30 bg-gradient-to-b from-purple-900/20 to-black relative">
      <!-- Header Bar -->
      <div class="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
        <div class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          RealZodiac
        </div>
        <LanguageSwitcher />
      </div>
      
      <!-- Hero Content -->
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center px-4 max-w-4xl">
          <h1 class="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            RealZodiac
          </h1>
          <p class="text-xl md:text-2xl text-purple-300 mb-8">Find your real astronomical sign</p>
          <p class="text-gray-400 max-w-2xl mx-auto mb-8">
            Due to Earth's axial precession, zodiac signs have shifted by ~30 days since ancient times. 
            Discover where the Sun actually was when you were born.
          </p>
          
          <!-- Info Cards -->
          <div class="grid md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
            <div class="p-6 bg-red-900/20 rounded-lg border border-red-500/30">
              <h3 class="text-xl font-bold mb-3 text-red-300">❌ Astrology</h3>
              <p class="text-gray-300 text-sm">
                Based on positions from ~2,000 years ago. Doesn't account for axial precession.
              </p>
            </div>
            
            <div class="p-6 bg-green-900/20 rounded-lg border border-green-500/30">
              <h3 class="text-xl font-bold mb-3 text-green-300">✅ Astronomy</h3>
              <p class="text-gray-300 text-sm">
                Where the Sun actually is now, based on current observations.
              </p>
            </div>
          </div>
          
          <div class="p-6 bg-purple-900/20 rounded-lg border border-purple-500/30 mb-8 max-w-2xl mx-auto">
            <h3 class="text-xl font-bold mb-3 text-purple-300">⚕️ The 13th Constellation</h3>
            <p class="text-gray-300 text-sm mb-3">
              <strong class="text-purple-400">Ophiuchus</strong> (Nov 30 - Dec 17) is real but ignored by astrology.
            </p>
            <a href="https://en.wikipedia.org/wiki/Axial_precession" target="_blank" 
              class="text-sm text-purple-400 hover:text-purple-300 underline">
              Learn about Axial Precession →
            </a>
          </div>
          
          <!-- Navigation -->
          <nav class="flex flex-wrap gap-3 justify-center">
            <a href="#starmap" class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors">
              🌟 Explore Sky
            </a>
            <a href="#share" class="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold transition-colors">
              📤 Share
            </a>
            <a href="#credits" class="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-semibold transition-colors">
              ❤️ Support
            </a>
          </nav>
        </div>
      </div>
    </section>

    <!-- Star Map Section -->
    <section id="starmap" class="relative min-h-screen flex flex-col lg:flex-row border-b border-yellow-500/30">
      
      <!-- Left Controls Panel -->
      <div class="lg:absolute lg:top-8 lg:left-8 lg:z-10 z-20 lg:w-auto w-full">
        <!-- Mobile: Collapse Button -->
        <button
          @click="showControls = !showControls"
          class="lg:hidden w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 flex items-center justify-between"
        >
          <span class="text-sm font-semibold">⚙️ Controls</span>
          <span class="text-lg">{{ showControls ? '▼' : '▶' }}</span>
        </button>
        
        <!-- Controls -->
        <div
          :class="[
            'bg-black/90 backdrop-blur-sm border border-blue-500/50 lg:rounded-lg p-3 text-xs',
            'lg:block',
            showControls ? 'block' : 'hidden'
          ]"
        >
          
          <!-- Display Options -->
          <div class="mb-2 pb-2 border-b border-purple-500/30">
            <div class="text-[10px] text-purple-400 mb-1">Display:</div>
            <div class="flex flex-col gap-1">
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" v-model="showConstellationLines" class="w-3 h-3" />
                <span class="text-[10px]">Constellation Lines</span>
              </label>
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" v-model="showConstellationImages" class="w-3 h-3" />
                <span class="text-[10px]">Constellation Art</span>
              </label>
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" v-model="showPlanets" class="w-3 h-3" />
                <span class="text-[10px]">Planets</span>
              </label>
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" v-model="showHorizon" class="w-3 h-3" />
                <span class="text-[10px]">Earth Horizon</span>
              </label>
            </div>
          </div>
          
          <!-- Ophiuchus Toggle -->
          <div class="mb-2 pb-2 border-b border-purple-500/30">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="showOphiuchus" class="w-3 h-3" />
              <span class="text-[10px] text-purple-400">Highlight Ophiuchus</span>
            </label>
          </div>
          
          <div class="text-blue-300 font-semibold mb-2 text-[11px]">Birth Info</div>
          
          <!-- Date -->
          <div class="mb-2">
            <div class="flex items-center justify-between mb-1">
              <div class="text-[10px] text-blue-400">Date:</div>
              <button
                @click="setNow"
                class="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 rounded text-[10px] text-white"
              >
                Now
              </button>
            </div>
            
            <div class="flex gap-1">
              <div class="flex flex-col items-center">
                <button @mousedown="startHold('day', 1)" @mouseup="stopHold" @mouseleave="stopHold"
                  class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-t flex items-center justify-center text-xs">▲</button>
                <input type="text" inputmode="numeric" v-model="dayStr" @input="handleDayChange"
                  class="w-10 bg-gray-900/80 border-x border-blue-500/30 px-1 py-1 text-white text-center text-xs no-spin" placeholder="DD" />
                <button @mousedown="startHold('day', -1)" @mouseup="stopHold" @mouseleave="stopHold"
                  class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-b flex items-center justify-center text-xs">▼</button>
              </div>
              
              <span class="self-center text-gray-500 mt-6">/</span>
              
              <div class="flex flex-col items-center">
                <button @mousedown="startHold('month', 1)" @mouseup="stopHold" @mouseleave="stopHold"
                  class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-t flex items-center justify-center text-xs">▲</button>
                <input type="text" inputmode="numeric" v-model="monthStr" @input="handleMonthChange"
                  class="w-10 bg-gray-900/80 border-x border-blue-500/30 px-1 py-1 text-white text-center text-xs no-spin" placeholder="MM" />
                <button @mousedown="startHold('month', -1)" @mouseup="stopHold" @mouseleave="stopHold"
                  class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-b flex items-center justify-center text-xs">▼</button>
              </div>
              
              <span class="self-center text-gray-500 mt-6">/</span>
              
              <div class="flex flex-col items-center">
                <button @mousedown="startHold('year', 1)" @mouseup="stopHold" @mouseleave="stopHold"
                  class="w-16 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-t flex items-center justify-center text-xs">▲</button>
                <input type="text" inputmode="numeric" v-model="yearStr" @input="handleYearChange"
                  class="w-16 bg-gray-900/80 border-x border-blue-500/30 px-1 py-1 text-white text-center text-xs no-spin" placeholder="YYYY" />
                <button @mousedown="startHold('year', -1)" @mouseup="stopHold" @mouseleave="stopHold"
                  class="w-16 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-b flex items-center justify-center text-xs">▼</button>
              </div>
            </div>
          </div>
          
          <!-- Time -->
          <div class="mb-2">
            <div class="text-[10px] text-blue-400 mb-1">Time:</div>
            <div class="flex gap-1">
              <div class="flex flex-col items-center">
                <button @mousedown="startHold('hour', 1)" @mouseup="stopHold" @mouseleave="stopHold"
                  class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-t flex items-center justify-center text-xs">▲</button>
                <input type="text" inputmode="numeric" v-model="hourStr" @input="handleHourChange"
                  class="w-10 bg-gray-900/80 border-x border-blue-500/30 px-1 py-1 text-white text-center text-xs no-spin" placeholder="HH" />
                <button @mousedown="startHold('hour', -1)" @mouseup="stopHold" @mouseleave="stopHold"
                  class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-b flex items-center justify-center text-xs">▼</button>
              </div>
              
              <span class="self-center text-gray-500 mt-6">:</span>
              
              <div class="flex flex-col items-center">
                <button @mousedown="startHold('minute', 1)" @mouseup="stopHold" @mouseleave="stopHold"
                  class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-t flex items-center justify-center text-xs">▲</button>
                <input type="text" inputmode="numeric" v-model="minuteStr" @input="handleMinuteChange"
                  class="w-10 bg-gray-900/80 border-x border-blue-500/30 px-1 py-1 text-white text-center text-xs no-spin" placeholder="MM" />
                <button @mousedown="startHold('minute', -1)" @mouseup="stopHold" @mouseleave="stopHold"
                  class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-b flex items-center justify-center text-xs">▼</button>
              </div>
            </div>
          </div>
          
          <!-- Location Picker (show when horizon enabled) -->
          <div v-if="showHorizon" class="mb-2">
            <div class="flex items-center justify-between mb-1">
              <div class="text-[10px] text-blue-400">Location:</div>
              <button @click="setCurrentLocation" :disabled="loadingLocation"
                class="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-[10px] text-white">
                {{ loadingLocation ? '...' : 'Here' }}
              </button>
            </div>
            <LocationPicker v-model="location" @update:modelValue="handleLocationUpdate" />
          </div>
        </div>
      </div>
      
      <!-- Star Map -->
      <div class="flex-1 relative" :class="showControls ? 'h-[50vh] lg:h-screen' : 'h-screen'">
        <StarMap 
          ref="starMapRef"
          v-model:date="selectedDate"
          :location="location"
          :show-stats="false"
          :show-constellation-lines="showConstellationLines"
          :show-constellation-images="showConstellationImages"
          :show-planets="showPlanets"
          :show-horizon="showHorizon"
          :show-ophiuchus="showOphiuchus"
        />
      </div>
      
      <!-- Right Info Panel (Desktop) -->
      <div class="hidden lg:block lg:w-80 lg:p-8 bg-gradient-to-b from-green-900/10 to-transparent lg:absolute lg:top-8 lg:right-8 lg:z-10">
        <div class="bg-black/90 backdrop-blur-sm border border-green-500/50 rounded-lg p-4">
          <h2 class="text-2xl font-bold mb-4 text-green-300">Your Sign</h2>
          
          <div v-if="currentConstellationName">
            <p class="text-sm mb-2 text-green-400">The Sun is in:</p>
            <p class="text-4xl font-bold text-white mb-4">{{ currentConstellationName }}</p>
            
            <div class="text-xs text-green-400 space-y-1 mb-6">
              <p>📅 {{ formattedDate }}</p>
              <p v-if="showHorizon">📍 {{ location.name }}</p>
            </div>
            
            <div class="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <p class="text-xs text-green-300">
                This is where the Sun actually was in the sky on your birth date, based on real astronomical positions.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile Info (Bottom) -->
      <div class="lg:hidden bg-green-900/10 p-4 border-t border-green-500/30">
        <div class="text-center">
          <h2 class="text-xl font-bold mb-2 text-green-300">Your Sign</h2>
          <p v-if="currentConstellationName" class="text-3xl font-bold text-white">{{ currentConstellationName }}</p>
          <p class="text-xs text-green-400 mt-2">📅 {{ formattedDate }}</p>
        </div>
      </div>
    </section>

    <!-- Share Section -->
    <section id="share" class="min-h-screen flex items-center justify-center border-b border-pink-500/30 bg-gradient-to-b from-pink-900/10 to-black px-4">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-8 text-pink-300">Share Your Discovery</h2>
        <p class="text-gray-300 mb-8">Tell your friends about their real zodiac signs!</p>
        
        <div class="flex gap-4 justify-center flex-wrap">
          <button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
            Share on Twitter
          </button>
          <button class="px-6 py-3 bg-blue-800 hover:bg-blue-900 rounded-lg font-semibold transition-colors">
            Share on Facebook
          </button>
          <button class="px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold transition-colors">
            Copy Link
          </button>
        </div>
      </div>
    </section>

    <!-- Credits Section -->
    <section id="credits" class="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-900/10 to-black px-4">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-8 text-orange-300">Credits & Support</h2>
        
        <div class="space-y-6 text-gray-300 mb-8">
          <p>
            <strong class="text-orange-400">Star Data:</strong> 
            <a href="https://github.com/ofrohn/d3-celestial" target="_blank" class="text-blue-400 hover:underline">
              d3-celestial by Olaf Frohn
            </a>
          </p>
          
          <p>
            <strong class="text-orange-400">Built with:</strong> Vue 3, Vite, Tailwind CSS
          </p>
          
          <p class="text-sm">
            This project aims to educate people about the fascinating phenomenon of axial precession 
            and the true positions of celestial objects.
          </p>
        </div>
        
        <div class="flex gap-4 justify-center flex-wrap">
          <button class="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors">
            ☕ Support on Ko-fi
          </button>
          <a href="https://github.com" target="_blank" 
            class="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold transition-colors">
            ⭐ Star on GitHub
          </a>
        </div>
        
        <div class="mt-12 pt-8 border-t border-orange-500/30 text-sm text-gray-500">
          <p>Made with 💜 for astronomy enthusiasts</p>
          <p class="mt-2">
            <a href="#" class="hover:text-orange-400">Privacy Policy</a> · 
            <a href="#" class="hover:text-orange-400 ml-4">Terms of Service</a>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.no-spin::-webkit-outer-spin-button,
.no-spin::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spin[type=number] {
  -moz-appearance: textfield;
}
</style>

<script setup>
import { ref, computed, watch } from 'vue'
import StarMap from './components/StarMap.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import LocationPicker from './components/LocationPicker.vue'

const selectedDate = ref(new Date())

// String refs for inputs (allow free typing)
const dayStr = ref(selectedDate.value.getDate().toString())
const monthStr = ref((selectedDate.value.getMonth() + 1).toString())
const yearStr = ref(selectedDate.value.getFullYear().toString())
const hourStr = ref('12')
const minuteStr = ref('0')

// Computed number values (only convert when valid)
const day = computed(() => {
  const val = parseInt(dayStr.value)
  return isNaN(val) ? 1 : val
})
const month = computed(() => {
  const val = parseInt(monthStr.value)
  return isNaN(val) ? 1 : val
})
const year = computed(() => {
  const val = parseInt(yearStr.value)
  // Allow empty or partial input (like "-") without defaulting
  if (yearStr.value === '' || yearStr.value === '-') return 2026
  return isNaN(val) ? 2026 : val
})
const hour = computed(() => {
  const val = parseInt(hourStr.value)
  return isNaN(val) ? 0 : val
})
const minute = computed(() => {
  const val = parseInt(minuteStr.value)
  return isNaN(val) ? 0 : val
})

const starMapRef = ref(null)
const location = ref({ lat: 60.1699, lon: 24.9384, name: 'Helsinki, Finland' })
const showOphiuchus = ref(false)
const showControls = ref(true)
const loadingLocation = ref(false)

// Independent display toggles
const showConstellationLines = ref(true)
const showConstellationImages = ref(false)
const showPlanets = ref(false)
const showHorizon = ref(false)

let holdInterval = null
let holdTimeout = null

const startHold = (field, direction) => {
  if (direction > 0) incrementField(field)
  else decrementField(field)
  
  holdTimeout = setTimeout(() => {
    holdInterval = setInterval(() => {
      if (direction > 0) incrementField(field)
      else decrementField(field)
    }, 100)
  }, 500)
}

const stopHold = () => {
  if (holdTimeout) clearTimeout(holdTimeout)
  if (holdInterval) clearInterval(holdInterval)
}

const setNow = () => {
  const now = new Date()
  selectedDate.value = now
  dayStr.value = now.getDate().toString()
  monthStr.value = (now.getMonth() + 1).toString()
  yearStr.value = now.getFullYear().toString()
  hourStr.value = now.getHours().toString()
  minuteStr.value = now.getMinutes().toString()
}

const setCurrentLocation = () => {
  if (!navigator.geolocation) return
  loadingLocation.value = true
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude
      const lon = position.coords.longitude
      
      try {
        const response = await fetch(`https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`)
        const data = await response.json()
        const feature = data.features[0]
        const name = [feature.properties.name, feature.properties.city, feature.properties.country]
          .filter(Boolean).join(', ')
        location.value = { lat, lon, name: name || `${lat.toFixed(2)}, ${lon.toFixed(2)}` }
      } catch {
        location.value = { lat, lon, name: `${lat.toFixed(2)}, ${lon.toFixed(2)}` }
      }
      loadingLocation.value = false
    },
    () => { loadingLocation.value = false }
  )
}

// Update date immediately when numbers change
watch([day, month, year, hour, minute], () => {
  const newDate = new Date(year.value, month.value - 1, day.value, hour.value, minute.value)
  if (!isNaN(newDate.getTime())) {
    selectedDate.value = newDate
  }
})

// Update inputs when date changes from external sources (drag, slider, etc.)
watch(selectedDate, (newDate) => {
  // Only update if values actually changed (avoid circular updates)
  if (newDate.getDate() !== day.value) dayStr.value = newDate.getDate().toString()
  if (newDate.getMonth() + 1 !== month.value) monthStr.value = (newDate.getMonth() + 1).toString()
  // Don't auto-update year to allow free typing including negative years
  if (newDate.getHours() !== hour.value) hourStr.value = newDate.getHours().toString()
  if (newDate.getMinutes() !== minute.value) minuteStr.value = newDate.getMinutes().toString()
})

const incrementField = (field) => {
  switch(field) {
    case 'minute': 
      if (minute.value >= 59) {
        minuteStr.value = '0'
        incrementField('hour')
      } else {
        minuteStr.value = (minute.value + 1).toString()
      }
      break
    case 'hour': 
      if (hour.value >= 23) {
        hourStr.value = '0'
        incrementField('day')
      } else {
        hourStr.value = (hour.value + 1).toString()
      }
      break
    case 'day': 
      const dim = new Date(year.value, month.value, 0).getDate()
      if (day.value >= dim) {
        dayStr.value = '1'
        incrementField('month')
      } else {
        dayStr.value = (day.value + 1).toString()
      }
      break
    case 'month': 
      if (month.value >= 12) {
        monthStr.value = '1'
        incrementField('year')
      } else {
        monthStr.value = (month.value + 1).toString()
      }
      break
    case 'year': 
      yearStr.value = (year.value + 1).toString()
      break
  }
}

const decrementField = (field) => {
  switch(field) {
    case 'minute': 
      if (minute.value <= 0) {
        minuteStr.value = '59'
        decrementField('hour')
      } else {
        minuteStr.value = (minute.value - 1).toString()
      }
      break
    case 'hour': 
      if (hour.value <= 0) {
        hourStr.value = '23'
        decrementField('day')
      } else {
        hourStr.value = (hour.value - 1).toString()
      }
      break
    case 'day':
      if (day.value <= 1) {
        decrementField('month')
        dayStr.value = new Date(year.value, month.value, 0).getDate().toString()
      } else {
        dayStr.value = (day.value - 1).toString()
      }
      break
    case 'month': 
      if (month.value <= 1) {
        monthStr.value = '12'
        decrementField('year')
      } else {
        monthStr.value = (month.value - 1).toString()
      }
      break
    case 'year': 
      yearStr.value = (year.value - 1).toString()
      break
  }
}

const handleMinuteChange = (e) => {
  minuteStr.value = e.target.value
}

const handleHourChange = (e) => {
  hourStr.value = e.target.value
}

const handleDayChange = (e) => {
  dayStr.value = e.target.value
}

const handleMonthChange = (e) => {
  monthStr.value = e.target.value
}

const handleYearChange = (e) => {
  yearStr.value = e.target.value
}

const formattedDate = computed(() => {
  const date = selectedDate.value
  const yr = date.getFullYear()
  const isBC = yr < 0
  const displayYear = isBC ? Math.abs(yr) : yr
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric'
  }) + `, ${displayYear}${isBC ? ' BC' : ''}`
})

const currentConstellationName = computed(() => starMapRef.value?.constellationName || null)

const handleLocationUpdate = (newLocation) => {
  location.value = newLocation
}
</script>