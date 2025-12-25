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
      class="w-full h-full cursor-grab active:cursor-grabbing"
      @mousedown="handleDragStart"
      @mousemove="handleDragMove"
      @mouseup="handleDragEnd"
      @mouseleave="handleDragEnd"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleDragEnd"
    />

    <!-- Stats Overlay (Debug) -->
    <div 
      v-if="!loading && !error && showStats"
      class="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-xs text-purple-300 font-mono"
    >
      <div>Stars: {{ stars?.features?.length || 0 }}</div>
      <div>Constellations: {{ constellations?.features?.length || 0 }}</div>
      <div>Zodiac visible: {{ zodiacCount }}</div>
      <div>Solar altitude: {{ solarAltitude.toFixed(1) }}°</div>
      <div>Solar azimuth: {{ solarAzimuth.toFixed(1) }}°</div>
      <div>Sun {{ solarAltitude > 0 ? 'above' : 'below' }} horizon</div>
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
  },
  showOphiuchus: {
    type: Boolean,
    default: false
  },
  viewMode: {
    type: String,
    default: 'simple'
  }
})

const emit = defineEmits(['update:date'])

// Touch/drag interaction state
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartDate = ref(null)

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

const solarAltitude = computed(() => {
  return getSolarAltitude(props.date, props.location.lat, props.location.lon)
})

const solarAzimuth = computed(() => {
  return getSolarAzimuth(props.date, props.location.lat, props.location.lon)
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
const getSolarAltitude = (date, latitude, longitude) => {
  // Day of year
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  
  // Solar declination (how far north/south Sun is)
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  
  // Hour angle (Sun's position in sky based on time of day)
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  const hourAngle = (hours - 12) * 15 // 15° per hour, noon = 0°
  
  // Convert to radians
  const latRad = latitude * Math.PI / 180
  const decRad = declination * Math.PI / 180
  const haRad = hourAngle * Math.PI / 180
  
  // Calculate altitude
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + 
                 Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)
  
  const altitude = Math.asin(sinAlt) * 180 / Math.PI
  
  return altitude
}

// Calculate solar azimuth (compass direction where Sun is)
const getSolarAzimuth = (date, latitude, longitude) => {
  // Day of year
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  
  // Solar declination
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  
  // Hour angle
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  const hourAngle = (hours - 12) * 15
  
  // Convert to radians
  const latRad = latitude * Math.PI / 180
  const decRad = declination * Math.PI / 180
  const haRad = hourAngle * Math.PI / 180
  
  // Calculate altitude (needed for azimuth)
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + 
                 Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)
  const altitude = Math.asin(sinAlt)
  
  // Calculate azimuth using atan2 (more robust than acos)
  const sinAz = Math.cos(decRad) * Math.sin(haRad) / Math.cos(altitude)
  const cosAz = (Math.sin(decRad) - Math.sin(latRad) * Math.sin(altitude)) / 
                (Math.cos(latRad) * Math.cos(altitude))
  
  let azimuth = Math.atan2(sinAz, cosAz) * 180 / Math.PI
  
  // Normalize to 0-360
  if (azimuth < 0) azimuth += 360
  
  return azimuth
}

// FIXED: Moon position calculation
const getMoonRA = (date) => {
  // Known new moon: Jan 6, 2000, 18:14 UTC
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0).getTime()
  const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon) / 86400000
  
  // Synodic month (time between new moons)
  const synodicMonth = 29.53058867
  const daysSinceNewMoon = daysSinceKnownNewMoon % synodicMonth
  
  // Moon moves 360° in 27.32 days (sidereal month) relative to stars
  // But appears to move 360° in 29.53 days relative to Sun (synodic month)
  // So relative to Sun: 360° / 29.53 days = 12.19° per day
  const moonOffset = daysSinceNewMoon * 12.19
  
  const sunRA = getSunRA(date)
  let moonRA = sunRA + moonOffset
  
  // Normalize to 0-360 first, then to -180 to 180
  moonRA = moonRA % 360
  if (moonRA > 180) moonRA -= 360
  if (moonRA < -180) moonRA += 360
  
  return moonRA
}

// Moon phase calculation
const getMoonPhase = (date) => {
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0).getTime()
  const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon) / 86400000
  const daysSinceNewMoon = daysSinceKnownNewMoon % 29.53058867
  return daysSinceNewMoon / 29.53058867 // 0 = new moon, 0.5 = full moon
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
  const scale = Math.min(width, height) / 120
  const x = width / 2 + adjustedRA * scale
  const y = height / 2 - dec * scale
  
  return { x, y, visible: Math.abs(adjustedRA) < 100 }
}

// Draw the star map
const draw = () => {
  if (!canvas.value || !stars.value || !constellations.value) return

  const ctx = canvas.value.getContext('2d')
  const { width, height } = canvasSize.value
  const sunRA = getSunRA(props.date)
  const currentConst = getCurrentConstellation(sunRA)
  const altitude = getSolarAltitude(props.date, props.location.lat, props.location.lon)

  // Clear canvas
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  // Draw stars
  stars.value.features.forEach(star => {
    const [ra, dec] = star.geometry.coordinates
    const projected = project(ra, dec, sunRA, width, height)

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
    
    // Draw star names in full mode for bright stars
    if (props.viewMode === 'full' && mag < 2.0 && star.properties.name) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '10px sans-serif'
      ctx.fillText(star.properties.name, projected.x + 8, projected.y - 8)
    }
  })

  // Draw constellation lines (zodiac only)
  constellations.value.features
    .filter(c => zodiacIds.includes(c.id))
    .forEach(constellation => {
      const isOphiuchus = constellation.id === 'Oph'
      const isCurrent = constellation.id === currentConst
      
      let strokeColor, lineWidth
      
      // Ophiuchus visibility controlled by toggle
      if (isOphiuchus && !props.showOphiuchus) {
        // When toggle is OFF, always show Ophiuchus as dim gray
        strokeColor = 'rgba(148, 163, 184, 0.2)'
        lineWidth = 0.8
      } else if (isCurrent) {
        // Highlight current constellation
        strokeColor = isOphiuchus ? '#a855f7' : '#fbbf24'
        lineWidth = 2.5
      } else if (isOphiuchus) {
        // Non-current Ophiuchus when toggle is ON
        strokeColor = 'rgba(168, 85, 247, 0.4)'
        lineWidth = 1
      } else {
        // All other constellations
        strokeColor = 'rgba(148, 163, 184, 0.2)'
        lineWidth = 0.8
      }
      
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = lineWidth

      constellation.geometry.coordinates.forEach(lineString => {
        ctx.beginPath()
        
        let prevPoint = null
        lineString.forEach(([ra, dec]) => {
          const projected = project(ra, dec, sunRA, width, height)
          
          if (!projected.visible && prevPoint && !prevPoint.visible) {
            prevPoint = projected
            return
          }
          
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
  
  // Draw constellation names in full mode
  if (props.viewMode === 'full') {
    constellations.value.features
      .filter(c => zodiacIds.includes(c.id))
      .forEach(constellation => {
        const isCurrent = constellation.id === currentConst
        
        // Get center of constellation (approximate)
        const firstLine = constellation.geometry.coordinates[0]
        if (firstLine && firstLine.length > 0) {
          const [ra, dec] = firstLine[0]
          const projected = project(ra, dec, sunRA, width, height)
          
          if (projected.visible) {
            ctx.fillStyle = isCurrent ? 'rgba(251, 191, 36, 0.9)' : 'rgba(148, 163, 184, 0.5)'
            ctx.font = isCurrent ? 'bold 14px sans-serif' : '12px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(constellationNames[constellation.id], projected.x, projected.y - 20)
          }
        }
      })
  }

  // Draw EARTH (huge circle, only top edge visible as horizon)
  if (props.showEarth) {
    const centerX = width / 2
    const centerY = height / 2
    
    const altitude = getSolarAltitude(props.date, props.location.lat, props.location.lon)
    const azimuth = getSolarAzimuth(props.date, props.location.lat, props.location.lon)
    
    // Huge Earth radius (center is way below screen)
    const earthRadius = Math.min(width, height) * 3
    
    // Earth center position based on altitude and azimuth
    // Altitude: how far down the center is (higher sun = center further down)
    // Azimuth: horizontal position (where sun is in the sky)
    
    // Vertical offset (altitude) - FLIPPED
    // altitude = 90° → verticalOffset LOW (Earth below, invisible)
    // altitude = 0° → verticalOffset at center (horizon visible)
    // altitude = -90° → verticalOffset HIGH (Earth above, covering sun)
    const verticalOffset = earthRadius * (1 + altitude / 90)  // FLIPPED: was (1 - altitude/90)
    
    // Horizontal offset (azimuth)
    const azimuthRad = (azimuth - 180) * Math.PI / 180
    const horizontalOffset = Math.sin(azimuthRad) * earthRadius * 0.3
    
    const earthX = centerX + horizontalOffset
    const earthY = centerY + verticalOffset
    
    // Draw Earth
    ctx.fillStyle = 'rgba(251, 191, 36, 0.5)' // Yellow, 50% opacity
    ctx.beginPath()
    ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2)
    ctx.fill()
    
    // Earth outline (horizon line)
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)'
    ctx.lineWidth = 3
    ctx.stroke()
  }

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

  // Draw Moon (FIXED)
  const moonRA = getMoonRA(props.date)
  const dayOfYear = Math.floor((props.date - new Date(props.date.getFullYear(), 0, 0)) / 86400000)
  const eclipticTilt = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  const moonDec = eclipticTilt
  
  const moonPos = project(moonRA, moonDec, sunRA, width, height)
  
  // Check if moon should be visible (not below Earth when Earth is shown)
  let moonVisible = moonPos.visible && moonPos.x >= 0 && moonPos.x <= width && 
                    moonPos.y >= 0 && moonPos.y <= height
  
  // Hide moon if it's below Earth horizon
  if (props.showEarth && moonVisible) {
    const altitude = getSolarAltitude(props.date, props.location.lat, props.location.lon)
    const azimuth = getSolarAzimuth(props.date, props.location.lat, props.location.lon)
    const earthRadius = Math.min(width, height) * 3
    const verticalOffset = earthRadius * (1 + altitude / 90)
    const azimuthRad = (azimuth - 180) * Math.PI / 180
    const horizontalOffset = Math.sin(azimuthRad) * earthRadius * 0.3
    const earthX = centerX + horizontalOffset
    const earthY = centerY + verticalOffset
    
    // Check if moon is inside Earth circle
    const distToEarth = Math.sqrt(
      Math.pow(moonPos.x - earthX, 2) + Math.pow(moonPos.y - earthY, 2)
    )
    if (distToEarth < earthRadius) {
      moonVisible = false
    }
  }
  
  if (moonVisible) {
    const moonPhase = getMoonPhase(props.date)
    const moonSize = 8
    
    // Moon glow
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
    
    // Moon body
    ctx.fillStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.arc(moonPos.x, moonPos.y, moonSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Moon shadow (phase)
    if (moonPhase < 0.45 || moonPhase > 0.55) {
      const shadowOffset = (moonPhase - 0.5) * moonSize * 2
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.beginPath()
      if (moonPhase < 0.5) {
        ctx.ellipse(moonPos.x - shadowOffset, moonPos.y, Math.abs(shadowOffset), moonSize, 0, 0, Math.PI * 2)
      } else {
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
  
  setTimeout(() => draw(), 0)
}

// Reload data on error
const reloadData = () => {
  loadData()
}

// Touch/Drag interaction handlers
const handleDragStart = (event) => {
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartDate.value = new Date(props.date)
}

const handleTouchStart = (event) => {
  if (event.touches.length === 1) {
    isDragging.value = true
    dragStartX.value = event.touches[0].clientX
    dragStartDate.value = new Date(props.date)
  }
}

const handleDragMove = (event) => {
  if (!isDragging.value || !dragStartDate.value) return
  
  const deltaX = event.clientX - dragStartX.value
  // Each 50px = 1 day
  // Negative deltaX (drag right) = go to past (subtract days)
  const daysDelta = Math.floor(-deltaX / 50)
  
  if (daysDelta !== 0) {
    const newDate = new Date(dragStartDate.value)
    newDate.setDate(newDate.getDate() + daysDelta)
    emit('update:date', newDate)
  }
}

const handleTouchMove = (event) => {
  if (!isDragging.value || !dragStartDate.value || event.touches.length !== 1) return
  
  const deltaX = event.touches[0].clientX - dragStartX.value
  const daysDelta = Math.floor(-deltaX / 50)
  
  if (daysDelta !== 0) {
    const newDate = new Date(dragStartDate.value)
    newDate.setDate(newDate.getDate() + daysDelta)
    emit('update:date', newDate)
  }
}

const handleDragEnd = () => {
  isDragging.value = false
  dragStartX.value = 0
  dragStartDate.value = null
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
</script>