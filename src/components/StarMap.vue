<template>
  <div class="relative w-full h-full bg-black rounded-lg overflow-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-purple-300">Loading star data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center text-red-400">
        <p class="text-xl mb-2">❌ Failed to load stars</p>
        <p class="text-sm">{{ error }}</p>
        <button 
          @click="reloadData"
          class="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Canvas -->
    <canvas
      v-show="!loading && !error"
      ref="canvas"
      :width="canvasSize.width"
      :height="canvasSize.height"
      class="w-full h-full"
    />

    <!-- Stats Overlay (Debug) -->
    <div 
      v-if="!loading && !error && showStats"
      class="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-xs text-purple-300 font-mono"
    >
      <div>Stars: {{ stars?.features?.length || 0 }}</div>
      <div>Constellations: {{ constellations?.features?.length || 0 }}</div>
      <div>Zodiac visible: {{ zodiacCount }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useStarData } from '@/composables/useStarData'

const props = defineProps({
  date: {
    type: Date,
    default: () => new Date()
  },
  location: {
    type: Object,
    default: () => ({ lat: 60.1699, lon: 24.9384, name: 'Helsinki, Finland' })
  },
  showStats: {
    type: Boolean,
    default: false
  },
  showEarth: {
    type: Boolean,
    default: true
  }
})

// Star data
const { stars, constellations, loading, error, loadData } = useStarData()

// Canvas ref
const canvas = ref(null)
const canvasSize = ref({ width: 800, height: 800 })

// Zodiac constellations (the 13)
const zodiacIds = ['Ari', 'Tau', 'Gem', 'Cnc', 'Leo', 'Vir', 'Lib', 'Sco', 'Oph', 'Sgr', 'Cap', 'Aqr', 'Psc']

const zodiacCount = computed(() => {
  if (!constellations.value) return 0
  return constellations.value.features.filter(c => zodiacIds.includes(c.id)).length
})

const currentConstellation = computed(() => {
  const sunRA = getSunRA(props.date)
  return getCurrentConstellation(sunRA)
})

// Constellation names
const constellationNames = {
  'Ari': 'Aries',
  'Tau': 'Taurus',
  'Gem': 'Gemini',
  'Cnc': 'Cancer',
  'Leo': 'Leo',
  'Vir': 'Virgo',
  'Lib': 'Libra',
  'Sco': 'Scorpio',
  'Oph': 'Ophiuchus',
  'Sgr': 'Sagittarius',
  'Cap': 'Capricorn',
  'Aqr': 'Aquarius',
  'Psc': 'Pisces'
}

// Expose for parent component
defineExpose({
  currentConstellation,
  constellationName: computed(() => 
    currentConstellation.value ? constellationNames[currentConstellation.value] : null
  )
})

// Sun position (simplified calculation)
const getSunRA = (date) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  // Sun moves ~1° per day along ecliptic
  // March 21 (day 80) ≈ RA 0° (Vernal Equinox)
  const ra = ((dayOfYear - 80) * 0.9856) % 360
  return ra > 180 ? ra - 360 : ra
}

// Calculate solar altitude (how high Sun is above horizon)
// Returns altitude in degrees: 90 = zenith, 0 = horizon, -90 = nadir
const getSolarAltitude = (date, latitude, longitude) => {
  // Day of year
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  
  // Solar declination (how far north/south Sun is)
  // Varies from +23.5° (summer solstice) to -23.5° (winter solstice)
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  
  // Hour angle (Sun's position in sky based on time of day)
  const hours = date.getHours() + date.getMinutes() / 60
  const hourAngle = (hours - 12) * 15 // 15° per hour, noon = 0°
  
  // Convert to radians
  const latRad = latitude * Math.PI / 180
  const decRad = declination * Math.PI / 180
  const haRad = hourAngle * Math.PI / 180
  
  // Calculate altitude using formula:
  // sin(altitude) = sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(hourAngle)
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + 
                 Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)
  
  const altitude = Math.asin(sinAlt) * 180 / Math.PI
  
  return altitude
}

// Moon position (simplified - relative to Sun)
const getMoonRA = (date) => {
  // Moon orbits Earth every ~29.5 days
  // Simplified: Moon moves ~13° per day relative to Sun
  const daysSinceNewMoon = (date.getTime() / 86400000) % 29.53
  const moonOffset = daysSinceNewMoon * 13.0 // degrees from Sun
  
  const sunRA = getSunRA(date)
  let moonRA = sunRA + moonOffset
  
  // Normalize to -180 to 180
  if (moonRA > 180) moonRA -= 360
  if (moonRA < -180) moonRA += 360
  
  return moonRA
}

// Moon phase calculation
const getMoonPhase = (date) => {
  const daysSinceNewMoon = (date.getTime() / 86400000) % 29.53
  return daysSinceNewMoon / 29.53 // 0 = new moon, 0.5 = full moon
}

// Detect which zodiac constellation the Sun is in
const getCurrentConstellation = (sunRA) => {
  // Approximate RA ranges for zodiac constellations (in degrees)
  const zodiacRanges = {
    'Psc': { start: -30, end: 30 },     // Pisces
    'Ari': { start: 30, end: 55 },      // Aries
    'Tau': { start: 55, end: 90 },      // Taurus
    'Gem': { start: 90, end: 120 },     // Gemini
    'Cnc': { start: 120, end: 140 },    // Cancer
    'Leo': { start: 140, end: 175 },    // Leo
    'Vir': { start: 175, end: 220 },    // Virgo (large)
    'Lib': { start: 220, end: 243 },    // Libra
    'Sco': { start: 243, end: 250 },    // Scorpio (small)
    'Oph': { start: 250, end: 268 },    // Ophiuchus
    'Sgr': { start: 268, end: 300 },    // Sagittarius
    'Cap': { start: 300, end: 328 },    // Capricorn
    'Aqr': { start: 328, end: 360 }     // Aquarius
  }

  // Normalize sunRA to 0-360
  let normalizedRA = sunRA
  if (normalizedRA < 0) normalizedRA += 360

  for (const [id, range] of Object.entries(zodiacRanges)) {
    if (range.start === -30) { // Pisces wraps around
      if (normalizedRA >= 330 || normalizedRA <= 30) return id
    } else if (normalizedRA >= range.start && normalizedRA < range.end) {
      return id
    }
  }

  return null
}

// Projection: Celestial coords (RA, Dec) → Screen (x, y)
const project = (ra, dec, sunRA, width, height) => {
  // Adjust RA relative to Sun (Sun stays at center)
  let adjustedRA = ra - sunRA
  
  // Wrap around seamlessly
  if (adjustedRA > 180) adjustedRA -= 360
  if (adjustedRA < -180) adjustedRA += 360
  
  // Closer zoom (bigger scale)
  const scale = Math.min(width, height) / 120 // was 200, now 120 = closer
  const x = width / 2 + adjustedRA * scale
  const y = height / 2 - dec * scale
  
  return { x, y, visible: Math.abs(adjustedRA) < 100 } // Only show visible range
}

// Draw the star map
const draw = () => {
  if (!canvas.value || !stars.value || !constellations.value) return

  const ctx = canvas.value.getContext('2d')
  const { width, height } = canvasSize.value
  const sunRA = getSunRA(props.date)
  const currentConst = getCurrentConstellation(sunRA)

  // Clear canvas
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  // Draw stars
  stars.value.features.forEach(star => {
    const [ra, dec] = star.geometry.coordinates
    const projected = project(ra, dec, sunRA, width, height)

    // Only draw if visible
    if (!projected.visible) return
    if (projected.x < -50 || projected.x > width + 50) return
    if (projected.y < -50 || projected.y > height + 50) return

    const mag = star.properties.mag
    const size = Math.max(0.5, 2 - mag / 3)
    const opacity = Math.min(1, Math.max(0.1, (6 - mag) / 6))

    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.beginPath()
    ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2)
    ctx.fill()
  })

  // Detect current constellation
  // (already calculated above as currentConst)

  // Draw constellation lines (zodiac only)
  constellations.value.features
    .filter(c => zodiacIds.includes(c.id))
    .forEach(constellation => {
      const isOphiuchus = constellation.id === 'Oph'
      const isCurrent = constellation.id === currentConst
      
      // Color based on state
      let strokeColor
      let lineWidth
      
      if (isCurrent) {
        strokeColor = isOphiuchus ? '#a855f7' : '#fbbf24' // Current = purple or yellow
        lineWidth = 2.5
      } else if (isOphiuchus) {
        strokeColor = 'rgba(168, 85, 247, 0.4)' // Ophiuchus dim
        lineWidth = 1
      } else {
        strokeColor = 'rgba(148, 163, 184, 0.2)' // Other dim
        lineWidth = 0.8
      }
      
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = lineWidth

      constellation.geometry.coordinates.forEach(lineString => {
        ctx.beginPath()
        
        let prevPoint = null
        lineString.forEach(([ra, dec]) => {
          const projected = project(ra, dec, sunRA, width, height)
          
          // Skip if too far from view
          if (!projected.visible && prevPoint && !prevPoint.visible) {
            prevPoint = projected
            return
          }
          
          // Skip lines that cross the edge (those horizontal lines!)
          if (prevPoint && Math.abs(projected.x - prevPoint.x) > width / 2) {
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(projected.x, projected.y)
          } else if (!prevPoint) {
            ctx.moveTo(projected.x, projected.y)
          } else {
            ctx.lineTo(projected.x, projected.y)
          }
          
          prevPoint = projected
        })

        ctx.stroke()
      })
    })

  // Draw Sun at center
  const centerX = width / 2
  const centerY = height / 2

  // Sun glow
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30)
  gradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)')
  gradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.4)')
  gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
  ctx.fill()

  // Sun core
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
  ctx.fill()

  // Draw Moon (FIXED - moves naturally along ecliptic)
  const moonRA = getMoonRA(props.date)
  
  // Moon's declination varies between -28.5° and +28.5° (stays near ecliptic)
  // Simplified: Moon follows ecliptic like Sun, with slight variation
  const dayOfYear = Math.floor((props.date - new Date(props.date.getFullYear(), 0, 0)) / 86400000)
  const eclipticTilt = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  const moonDec = eclipticTilt // Moon follows ecliptic plane
  
  const moonPos = project(moonRA, moonDec, sunRA, width, height)
  
  // Only draw moon if visible on screen
  if (moonPos.visible && moonPos.x >= 0 && moonPos.x <= width && 
      moonPos.y >= 0 && moonPos.y <= height) {
    const moonPhase = getMoonPhase(props.date)
    const moonSize = 8
    
    // Moon glow (subtle)
    const moonGlow = ctx.createRadialGradient(
      moonPos.x, moonPos.y, 0,
      moonPos.x, moonPos.y, moonSize * 2
    )
    moonGlow.addColorStop(0, 'rgba(226, 232, 240, 0.4)')
    moonGlow.addColorStop(1, 'rgba(226, 232, 240, 0)')
    ctx.fillStyle = moonGlow
    ctx.beginPath()
    ctx.arc(moonPos.x, moonPos.y, moonSize * 2, 0, Math.PI * 2)
    ctx.fill()
    
    // Moon body (bright side)
    ctx.fillStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.arc(moonPos.x, moonPos.y, moonSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Moon shadow (phase)
    if (moonPhase < 0.45 || moonPhase > 0.55) {
      // Not full moon - draw shadow
      const shadowOffset = (moonPhase - 0.5) * moonSize * 2
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.beginPath()
      if (moonPhase < 0.5) {
        // Waxing - shadow on left
        ctx.ellipse(moonPos.x - shadowOffset, moonPos.y, Math.abs(shadowOffset), moonSize, 0, 0, Math.PI * 2)
      } else {
        // Waning - shadow on right
        ctx.ellipse(moonPos.x + shadowOffset, moonPos.y, Math.abs(shadowOffset), moonSize, 0, 0, Math.PI * 2)
      }
      ctx.fill()
    }
  }
}

// Redraw on date change
watch(() => props.date, () => {
  draw()
}, { immediate: false })

// Redraw on location change
watch(() => props.location, () => {
  draw()
}, { deep: true })

// Redraw on showEarth change
watch(() => props.showEarth, () => {
  draw()
})

// Redraw when data loads
watch([stars, constellations], () => {
  if (stars.value && constellations.value) {
    draw()
  }
})

// Handle resize
const handleResize = () => {
  if (!canvas.value) return
  
  const container = canvas.value.parentElement
  const width = container.clientWidth
  const height = container.clientHeight
  
  canvasSize.value = { width, height }
  
  // Redraw after resize
  setTimeout(() => draw(), 0)
}

// Reload data on error
const reloadData = () => {
  loadData()
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
</script>