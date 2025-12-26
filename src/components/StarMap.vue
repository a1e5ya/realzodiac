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

// Element colors for zodiac signs
const elementColors = {
  // Fire signs
  'Ari': { start: '#ef4444', end: '#f97316' },
  'Leo': { start: '#f97316', end: '#fbbf24' },
  'Sgr': { start: '#fbbf24', end: '#ef4444' },
  // Earth signs
  'Tau': { start: '#84cc16', end: '#22c55e' },
  'Vir': { start: '#22c55e', end: '#10b981' },
  'Cap': { start: '#10b981', end: '#84cc16' },
  // Air signs
  'Gem': { start: '#06b6d4', end: '#0ea5e9' },
  'Lib': { start: '#0ea5e9', end: '#3b82f6' },
  'Aqr': { start: '#3b82f6', end: '#06b6d4' },
  // Water signs
  'Cnc': { start: '#8b5cf6', end: '#a78bfa' },
  'Sco': { start: '#a78bfa', end: '#c084fc' },
  'Psc': { start: '#c084fc', end: '#8b5cf6' },
  // Ophiuchus
  'Oph': { start: '#a855f7', end: '#d946ef' }
}

const zodiacCount = computed(() => {
  if (!constellations.value) return 0
  return constellations.value.features.filter(c => zodiacIds.includes(c.id)).length
})

const currentConstellation = computed(() => {
  const sunRA = getSunRA(props.date)
  const constellation = getCurrentConstellation(sunRA)
  
  // If Ophiuchus toggle is OFF and result is Ophiuchus, return Scorpio instead
  if (constellation === 'Oph' && !props.showOphiuchus) {
    return 'Sco'
  }
  
  return constellation
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
  const ra = ((dayOfYear - 80) * 0.9856) % 360
  return ra > 180 ? ra - 360 : ra
}

// Calculate solar altitude
const getSolarAltitude = (date, latitude, longitude) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  const hourAngle = (hours - 12) * 15
  
  const latRad = latitude * Math.PI / 180
  const decRad = declination * Math.PI / 180
  const haRad = hourAngle * Math.PI / 180
  
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + 
                 Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)
  
  return Math.asin(sinAlt) * 180 / Math.PI
}

// Calculate solar azimuth
const getSolarAzimuth = (date, latitude, longitude) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  const hourAngle = (hours - 12) * 15
  
  const latRad = latitude * Math.PI / 180
  const decRad = declination * Math.PI / 180
  const haRad = hourAngle * Math.PI / 180
  
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + 
                 Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)
  const altitude = Math.asin(sinAlt)
  
  const sinAz = Math.cos(decRad) * Math.sin(haRad) / Math.cos(altitude)
  const cosAz = (Math.sin(decRad) - Math.sin(latRad) * Math.sin(altitude)) / 
                (Math.cos(latRad) * Math.cos(altitude))
  
  let azimuth = Math.atan2(sinAz, cosAz) * 180 / Math.PI
  if (azimuth < 0) azimuth += 360
  
  return azimuth
}

// Moon position
const getMoonRA = (date) => {
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0).getTime()
  const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon) / 86400000
  const synodicMonth = 29.53058867
  const daysSinceNewMoon = daysSinceKnownNewMoon % synodicMonth
  const moonOffset = daysSinceNewMoon * 12.19
  
  const sunRA = getSunRA(date)
  let moonRA = sunRA + moonOffset
  
  moonRA = moonRA % 360
  if (moonRA > 180) moonRA -= 360
  if (moonRA < -180) moonRA += 360
  
  return moonRA
}

// Moon phase
const getMoonPhase = (date) => {
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0).getTime()
  const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon) / 86400000
  const daysSinceNewMoon = daysSinceKnownNewMoon % 29.53058867
  return daysSinceNewMoon / 29.53058867
}

// Detect which zodiac constellation the Sun is in
const getCurrentConstellation = (sunRA) => {
  let normalizedRA = sunRA
  if (normalizedRA < 0) normalizedRA += 360

  const zodiacRanges = {
    'Psc1': { start: 0, end: 30, id: 'Psc' },    // Pisces part 1 (beginning)
    'Ari': { start: 30, end: 50, id: 'Ari' },
    'Tau': { start: 50, end: 90, id: 'Tau' },
    'Gem': { start: 90, end: 120, id: 'Gem' },
    'Cnc': { start: 120, end: 140, id: 'Cnc' },
    'Leo': { start: 140, end: 177, id: 'Leo' },
    'Vir': { start: 177, end: 220, id: 'Vir' },
    'Lib': { start: 220, end: 243, id: 'Lib' },
    'Sco': { start: 243, end: 250, id: 'Sco' },
    'Oph': { start: 250, end: 268, id: 'Oph' },
    'Sgr': { start: 268, end: 300, id: 'Sgr' },
    'Cap': { start: 300, end: 328, id: 'Cap' },
    'Aqr': { start: 328, end: 350, id: 'Aqr' },  // Feb 16 - Mar 11
    'Psc2': { start: 350, end: 360, id: 'Psc' }   // Pisces part 2 (end)
  }

  for (const [key, range] of Object.entries(zodiacRanges)) {
    if (normalizedRA >= range.start && normalizedRA < range.end) {
      return range.id
    }
  }

  return null
}

// Projection
const project = (ra, dec, sunRA, width, height) => {
  let adjustedRA = ra - sunRA
  
  if (adjustedRA > 180) adjustedRA -= 360
  if (adjustedRA < -180) adjustedRA += 360
  
  const scale = Math.min(width, height) / 120
  const x = width / 2 - adjustedRA * scale
  const y = height / 2 - dec * scale
  
  return { x, y, visible: Math.abs(adjustedRA) < 100 }
}

// Draw the star map
const draw = () => {
  if (!canvas.value || !stars.value || !constellations.value) return

  const ctx = canvas.value.getContext('2d')
  const { width, height } = canvasSize.value
  const sunRA = getSunRA(props.date)
  const currentConst = currentConstellation.value
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
    
    if (props.viewMode === 'full' && mag < 2.0 && star.properties.name) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '10px sans-serif'
      ctx.fillText(star.properties.name, projected.x + 8, projected.y - 8)
    }
  })

  // Draw constellation lines
  constellations.value.features
    .filter(c => zodiacIds.includes(c.id))
    .forEach(constellation => {
      const isOphiuchus = constellation.id === 'Oph'
      const isCurrent = constellation.id === currentConst
      
      constellation.geometry.coordinates.forEach(lineString => {
        // Ophiuchus when toggle is OFF
        if (isOphiuchus && !props.showOphiuchus) {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'
          ctx.lineWidth = 1.2
          ctx.shadowBlur = 0
        } else if (isCurrent) {
          // Highlighted - use solid start color (no gradient to avoid issues)
          const colors = elementColors[constellation.id]
          ctx.strokeStyle = colors.start
          ctx.lineWidth = 2.5
          ctx.shadowColor = colors.start
          ctx.shadowBlur = 8
        } else if (isOphiuchus) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'
          ctx.lineWidth = 1.2
          ctx.shadowBlur = 0
        } else {
          // Bolder non-highlighted lines
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
          ctx.lineWidth = 1.2
          ctx.shadowBlur = 0
        }

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
        ctx.shadowBlur = 0
      })
    })
  
  // Draw constellation names
  if (props.viewMode === 'full') {
    constellations.value.features
      .filter(c => zodiacIds.includes(c.id))
      .forEach(constellation => {
        const isCurrent = constellation.id === currentConst
        
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

  // Draw EARTH
  if (props.showEarth) {
    const centerX = width / 2
    const centerY = height / 2
    
    const earthRadius = Math.min(width, height) * 3
    const verticalOffset = earthRadius * (1 + altitude / 90)
    const azimuth = getSolarAzimuth(props.date, props.location.lat, props.location.lon)
    const azimuthRad = (azimuth - 180) * Math.PI / 180
    const horizontalOffset = Math.sin(azimuthRad) * earthRadius * 0.3
    
    const earthX = centerX + horizontalOffset
    const earthY = centerY + verticalOffset
    
    ctx.fillStyle = 'rgba(251, 191, 36, 0.5)'
    ctx.beginPath()
    ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)'
    ctx.lineWidth = 3
    ctx.stroke()
  }

  // Draw Sun
  const centerX = width / 2
  const centerY = height / 2

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30)
  gradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)')
  gradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.4)')
  gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
  ctx.fill()

  // Draw Moon
  const moonRA = getMoonRA(props.date)
  const dayOfYear = Math.floor((props.date - new Date(props.date.getFullYear(), 0, 0)) / 86400000)
  const eclipticTilt = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  const moonDec = eclipticTilt
  
  const moonPos = project(moonRA, moonDec, sunRA, width, height)
  
  let moonVisible = moonPos.visible && moonPos.x >= 0 && moonPos.x <= width && 
                    moonPos.y >= 0 && moonPos.y <= height
  
  if (props.showEarth && moonVisible) {
    const earthRadius = Math.min(width, height) * 3
    const verticalOffset = earthRadius * (1 + altitude / 90)
    const azimuth = getSolarAzimuth(props.date, props.location.lat, props.location.lon)
    const azimuthRad = (azimuth - 180) * Math.PI / 180
    const horizontalOffset = Math.sin(azimuthRad) * earthRadius * 0.3
    const earthX = centerX + horizontalOffset
    const earthY = centerY + verticalOffset
    
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
    
    ctx.fillStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.arc(moonPos.x, moonPos.y, moonSize, 0, Math.PI * 2)
    ctx.fill()
    
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

// Redraw on changes
watch(() => props.date, () => draw(), { immediate: false })
watch(() => props.location, () => draw(), { deep: true })
watch(() => props.showEarth, () => draw())
watch(() => props.showOphiuchus, () => draw())
watch([stars, constellations], () => {
  if (stars.value && constellations.value) draw()
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

const reloadData = () => {
  loadData()
}

// Touch/Drag handlers
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
  const daysDelta = Math.floor(deltaX / 50)
  
  if (daysDelta !== 0) {
    const newDate = new Date(dragStartDate.value)
    newDate.setDate(newDate.getDate() + daysDelta)
    emit('update:date', newDate)
  }
}

const handleTouchMove = (event) => {
  if (!isDragging.value || !dragStartDate.value || event.touches.length !== 1) return
  
  const deltaX = event.touches[0].clientX - dragStartX.value
  const daysDelta = Math.floor(deltaX / 50)
  
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