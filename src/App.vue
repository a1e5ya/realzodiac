<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Hero Section -->
    <section id="hero" class="border-2 border-purple-500/30 bg-purple-900/10 p-8 m-4 rounded-lg">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-2">RealZodiac</h1>
        <p class="text-purple-300">Find your real astronomical sign</p>
      </div>
    </section>

    <!-- Star Map Section -->
    <section id="starmap" class="border-2 border-yellow-500/30 bg-yellow-900/10 p-4 m-4 rounded-lg relative">
      <h2 class="text-xl font-bold text-yellow-300 mb-2">Sky View</h2>
      
      <!-- Compact DateTime & Location Picker - Top Left Overlay -->
      <div class="absolute top-16 left-8 z-10 bg-black/90 backdrop-blur-sm border border-blue-500/50 rounded-lg p-4 text-xs">
        <div class="text-blue-300 font-semibold mb-3">Birth Info</div>
        
        <!-- Date with visible arrows -->
        <div class="mb-3">
          <div class="text-[10px] text-blue-400 mb-1">Date:</div>
          
          <div class="flex gap-1">
            <!-- Day -->
            <div class="flex flex-col items-center">
              <button
                @mousedown="startHold('day', 1)"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('day', 1)"
                @touchend="stopHold"
                class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-t flex items-center justify-center text-white text-xs transition-colors"
              >
                ▲
              </button>
              <input
                type="text"
                inputmode="numeric"
                v-model.number="day"
                @input="handleDayChange"
                class="w-10 bg-gray-900/80 border-x border-blue-500/30 px-1 py-1 text-white text-center text-xs no-spin"
                placeholder="DD"
              />
              <button
                @mousedown="startHold('day', -1)"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('day', -1)"
                @touchend="stopHold"
                class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-b flex items-center justify-center text-white text-xs transition-colors"
              >
                ▼
              </button>
            </div>
            
            <span class="self-center text-gray-500 mt-6">/</span>
            
            <!-- Month -->
            <div class="flex flex-col items-center">
              <button
                @mousedown="startHold('month', 1)"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('month', 1)"
                @touchend="stopHold"
                class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-t flex items-center justify-center text-white text-xs transition-colors"
              >
                ▲
              </button>
              <input
                type="text"
                inputmode="numeric"
                v-model.number="month"
                @input="handleMonthChange"
                class="w-10 bg-gray-900/80 border-x border-blue-500/30 px-1 py-1 text-white text-center text-xs no-spin"
                placeholder="MM"
              />
              <button
                @mousedown="startHold('month', -1)"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('month', -1)"
                @touchend="stopHold"
                class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-b flex items-center justify-center text-white text-xs transition-colors"
              >
                ▼
              </button>
            </div>
            
            <span class="self-center text-gray-500 mt-6">/</span>
            
            <!-- Year -->
            <div class="flex flex-col items-center">
              <button
                @mousedown="startHold('year', 1)"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('year', 1)"
                @touchend="stopHold"
                class="w-16 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-t flex items-center justify-center text-white text-xs transition-colors"
              >
                ▲
              </button>
              <input
                type="text"
                inputmode="numeric"
                v-model.number="year"
                @input="handleYearChange"
                class="w-16 bg-gray-900/80 border-x border-blue-500/30 px-1 py-1 text-white text-center text-xs no-spin"
                placeholder="YYYY"
              />
              <button
                @mousedown="startHold('year', -1)"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('year', -1)"
                @touchend="stopHold"
                class="w-16 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-b flex items-center justify-center text-white text-xs transition-colors"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
        
        <!-- Time with visible arrows -->
        <div class="mb-3">
          <div class="text-[10px] text-blue-400 mb-1">Time:</div>
          <div class="flex gap-1">
            <!-- Hour -->
            <div class="flex flex-col items-center">
              <button
                @mousedown="startHold('hour', 1)"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('hour', 1)"
                @touchend="stopHold"
                class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-t flex items-center justify-center text-white text-xs transition-colors"
              >
                ▲
              </button>
              <input
                type="text"
                inputmode="numeric"
                v-model.number="hour"
                @input="handleHourChange"
                class="w-10 bg-gray-900/80 border-x border-blue-500/30 px-1 py-1 text-white text-center text-xs no-spin"
                placeholder="HH"
              />
              <button
                @mousedown="startHold('hour', -1)"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('hour', -1)"
                @touchend="stopHold"
                class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-b flex items-center justify-center text-white text-xs transition-colors"
              >
                ▼
              </button>
            </div>
            
            <span class="self-center text-gray-500 mt-6">:</span>
            
            <!-- Minute -->
            <div class="flex flex-col items-center">
              <button
                @mousedown="startHold('minute', 1)"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('minute', 1)"
                @touchend="stopHold"
                class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-t flex items-center justify-center text-white text-xs transition-colors"
              >
                ▲
              </button>
              <input
                type="text"
                inputmode="numeric"
                v-model.number="minute"
                @input="handleMinuteChange"
                class="w-10 bg-gray-900/80 border-x border-blue-500/30 px-1 py-1 text-white text-center text-xs no-spin"
                placeholder="MM"
              />
              <button
                @mousedown="startHold('minute', -1)"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('minute', -1)"
                @touchend="stopHold"
                class="w-10 h-6 bg-blue-700/30 hover:bg-blue-600/50 rounded-b flex items-center justify-center text-white text-xs transition-colors"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
        
        <!-- Location Picker -->
        <div>
          <div class="text-[10px] text-blue-400 mb-1">Location:</div>
          <LocationPicker
            v-model="location"
            @update:modelValue="handleLocationUpdate"
          />
        </div>
      </div>
      
      <div class="h-[600px]">
        <StarMap 
          ref="starMapRef"
          :date="selectedDate" 
          :location="location"
          :show-stats="true"
        />
      </div>
    </section>

    <!-- Info Box Section -->
    <section id="infobox" class="border-2 border-green-500/30 bg-green-900/10 p-8 m-4 rounded-lg">
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-4">Your Astronomical Sign</h2>
        
        <div v-if="currentConstellationName" class="text-green-300">
          <p class="text-lg mb-2">The Sun is in:</p>
          <p class="text-5xl font-bold text-white mb-4">
            {{ currentConstellationName }}
          </p>
          
          <div class="text-sm text-green-400 space-y-1">
            <p>📅 {{ formattedDate }}</p>
            <p v-if="location">📍 {{ location.name }}</p>
          </div>
          
          <div class="mt-6 p-4 bg-green-900/20 rounded-lg max-w-md mx-auto">
            <p class="text-sm text-green-300">
              This is where the Sun actually was in the sky on your birth date, 
              based on real astronomical positions of the constellations.
            </p>
          </div>
        </div>
        
        <div v-else class="text-green-400">
          <p>Loading constellation data...</p>
        </div>
      </div>
    </section>

    <!-- Share Section -->
    <section id="share" class="border-2 border-pink-500/30 bg-pink-900/10 p-8 m-4 rounded-lg">
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-2">SHARE</h2>
        <p class="text-pink-300">Social sharing buttons</p>
      </div>
    </section>

    <!-- Thanksgiving Section -->
    <section id="thanksgiving" class="border-2 border-orange-500/30 bg-orange-900/10 p-8 m-4 rounded-lg">
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-2">THANKSGIVING</h2>
        <p class="text-orange-300">Credits, support, links</p>
      </div>
    </section>

    <!-- Language Switcher -->
    <LanguageSwitcher />
  </div>
</template>

<style scoped>
/* Hide native number input spinners */
.no-spin::-webkit-outer-spin-button,
.no-spin::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spin[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>

<script setup>
import { ref, computed, watch } from 'vue'
import StarMap from './components/StarMap.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import LocationPicker from './components/LocationPicker.vue'

// State
const selectedDate = ref(new Date())
const day = ref(selectedDate.value.getDate())
const month = ref(selectedDate.value.getMonth() + 1) // 1-12
const year = ref(selectedDate.value.getFullYear())
const hour = ref(12)
const minute = ref(0)
const starMapRef = ref(null)
const location = ref({
  lat: 60.1699,
  lon: 24.9384,
  name: 'Helsinki, Finland'
})

// Hold-to-repeat functionality
let holdInterval = null
let holdTimeout = null

const startHold = (field, direction) => {
  // First click
  if (direction > 0) {
    incrementField(field)
  } else {
    decrementField(field)
  }
  
  // Start repeating after 500ms
  holdTimeout = setTimeout(() => {
    holdInterval = setInterval(() => {
      if (direction > 0) {
        incrementField(field)
      } else {
        decrementField(field)
      }
    }, 100) // Repeat every 100ms
  }, 500)
}

const stopHold = () => {
  if (holdTimeout) {
    clearTimeout(holdTimeout)
    holdTimeout = null
  }
  if (holdInterval) {
    clearInterval(holdInterval)
    holdInterval = null
  }
}

// Watch individual date/time components and update selectedDate
watch([day, month, year, hour, minute], () => {
  const newDate = new Date(year.value, month.value - 1, day.value, hour.value, minute.value)
  if (!isNaN(newDate.getTime())) {
    selectedDate.value = newDate
  }
})

// Smart handlers with cascading increments
const handleKeyDown = (event, field) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    incrementField(field)
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    decrementField(field)
  }
}

const incrementField = (field) => {
  switch(field) {
    case 'minute':
      if (minute.value >= 59) {
        minute.value = 0
        incrementField('hour')
      } else {
        minute.value++
      }
      break
    case 'hour':
      if (hour.value >= 23) {
        hour.value = 0
        incrementField('day')
      } else {
        hour.value++
      }
      break
    case 'day':
      const daysInMonth = new Date(year.value, month.value, 0).getDate()
      if (day.value >= daysInMonth) {
        day.value = 1
        incrementField('month')
      } else {
        day.value++
      }
      break
    case 'month':
      if (month.value >= 12) {
        month.value = 1
        incrementField('year')
      } else {
        month.value++
      }
      break
    case 'year':
      if (year.value < 2100) {
        year.value++
      }
      break
  }
}

const decrementField = (field) => {
  switch(field) {
    case 'minute':
      if (minute.value <= 0) {
        minute.value = 59
        decrementField('hour')
      } else {
        minute.value--
      }
      break
    case 'hour':
      if (hour.value <= 0) {
        hour.value = 23
        decrementField('day')
      } else {
        hour.value--
      }
      break
    case 'day':
      if (day.value <= 1) {
        decrementField('month')
        day.value = new Date(year.value, month.value, 0).getDate()
      } else {
        day.value--
      }
      break
    case 'month':
      if (month.value <= 1) {
        month.value = 12
        decrementField('year')
      } else {
        month.value--
      }
      break
    case 'year':
      if (year.value > 1900) {
        year.value--
      }
      break
  }
}

const handleMinuteChange = (event) => {
  let val = parseInt(event.target.value) || 0
  
  if (val > 59) {
    minute.value = 0
    incrementField('hour')
  } else if (val < 0) {
    minute.value = 59
    decrementField('hour')
  } else {
    minute.value = val
  }
}

const handleHourChange = (event) => {
  let val = parseInt(event.target.value) || 0
  
  if (val > 23) {
    hour.value = 0
    incrementField('day')
  } else if (val < 0) {
    hour.value = 23
    decrementField('day')
  } else {
    hour.value = val
  }
}

const handleDayChange = (event) => {
  let val = parseInt(event.target.value) || 1
  const daysInMonth = new Date(year.value, month.value, 0).getDate()
  
  if (val > daysInMonth) {
    day.value = 1
    incrementField('month')
  } else if (val < 1) {
    decrementField('month')
    day.value = new Date(year.value, month.value, 0).getDate()
  } else {
    day.value = val
  }
}

const handleMonthChange = (event) => {
  let val = parseInt(event.target.value) || 1
  
  if (val > 12) {
    month.value = 1
    incrementField('year')
  } else if (val < 1) {
    month.value = 12
    decrementField('year')
  } else {
    month.value = val
  }
  
  // Adjust day if it exceeds days in new month
  const daysInMonth = new Date(year.value, month.value, 0).getDate()
  if (day.value > daysInMonth) {
    day.value = daysInMonth
  }
}

const handleYearChange = (event) => {
  let val = parseInt(event.target.value) || 2000
  if (val < 1900) val = 1900
  if (val > 2100) val = 2100
  year.value = val
}

// Computed
const dateString = computed({
  get: () => selectedDate.value.toISOString().split('T')[0],
  set: (val) => {
    const newDate = new Date(val)
    newDate.setHours(hour.value, minute.value)
    selectedDate.value = newDate
    day.value = newDate.getDate()
    month.value = newDate.getMonth() + 1
    year.value = newDate.getFullYear()
  }
})

const formattedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', { 
    weekday: 'short',
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  })
})

const currentConstellationName = computed(() => {
  return starMapRef.value?.constellationName || null
})

// Location handler
const handleLocationUpdate = (newLocation) => {
  location.value = newLocation
  console.log('Location updated:', newLocation)
  // Future: Use this for Rising Sign calculation
}
</script>