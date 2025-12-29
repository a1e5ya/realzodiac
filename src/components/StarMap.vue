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

// Animation frame
const shimmerOffset = ref(0)

// Zodiac constellations (the 13)
const zodiacIds = ['Ari', 'Tau', 'Gem', 'Cnc', 'Leo', 'Vir', 'Lib', 'Sco', 'Oph', 'Sgr', 'Cap', 'Aqr', 'Psc']

// Element colors for zodiac signs (very pale with strong glow)
const elementColors = {
  // Fire signs
  'Ari': { color: 'rgba(248, 113, 113, 0.3)', glow: 'rgba(248, 113, 113, 0.8)' },
  'Leo': { color: 'rgba(251, 146, 60, 0.3)', glow: 'rgba(251, 146, 60, 0.8)' },
  'Sgr': { color: 'rgba(251, 191, 36, 0.3)', glow: 'rgba(251, 191, 36, 0.8)' },
  // Earth signs
  'Tau': { color: 'rgba(163, 230, 53, 0.3)', glow: 'rgba(163, 230, 53, 0.8)' },
  'Vir': { color: 'rgba(74, 222, 128, 0.3)', glow: 'rgba(74, 222, 128, 0.8)' },
  'Cap': { color: 'rgba(52, 211, 153, 0.3)', glow: 'rgba(52, 211, 153, 0.8)' },
  // Air signs
  'Gem': { color: 'rgba(34, 211, 238, 0.3)', glow: 'rgba(34, 211, 238, 0.8)' },
  'Lib': { color: 'rgba(56, 189, 248, 0.3)', glow: 'rgba(56, 189, 248, 0.8)' },
  'Aqr': { color: 'rgba(96, 165, 250, 0.3)', glow: 'rgba(96, 165, 250, 0.8)' },
  // Water signs
  'Cnc': { color: 'rgba(167, 139, 250, 0.3)', glow: 'rgba(167, 139, 250, 0.8)' },
  'Sco': { color: 'rgba(192, 132, 252, 0.3)', glow: 'rgba(192, 132, 252, 0.8)' },
  'Psc': { color: 'rgba(216, 180, 254, 0.3)', glow: 'rgba(216, 180, 254, 0.8)' },
  // Ophiuchus
  'Oph': { color: 'rgba(192, 132, 252, 0.3)', glow: 'rgba(192, 132, 252, 0.8)' }
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

// Smooth diamond-like 4-pointed star (thin rays)
const drawStarShape4 = (ctx, x, y, size, rotation = 0) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  ctx.beginPath();
  
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const nextAngle = ((i + 1) * Math.PI) / 2;
    
    const tipX = Math.cos(angle) * size;
    const tipY = Math.sin(angle) * size;
    const nextTipX = Math.cos(nextAngle) * size;
    const nextTipY = Math.sin(nextAngle) * size;
    
    if (i === 0) {
      ctx.moveTo(tipX, tipY);
    }
    
    const midAngle = angle + Math.PI / 4;
    const curveDepth = size * 0.10;
    const cpX = Math.cos(midAngle) * curveDepth;
    const cpY = Math.sin(midAngle) * curveDepth;
    
    ctx.quadraticCurveTo(cpX, cpY, nextTipX, nextTipY);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.fill(); // Double fill to hide lines
  
  ctx.restore();
}

// Smooth 8-pointed star (thin rays)
const drawStarShape8 = (ctx, x, y, size, rotation = 0) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  ctx.beginPath();
  
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const nextAngle = ((i + 1) * Math.PI) / 4;
    
    const rayLength = (i % 2 === 0) ? size : size * 0.6;
    const nextRayLength = ((i + 1) % 2 === 0) ? size : size * 0.6;
    
    const tipX = Math.cos(angle) * rayLength;
    const tipY = Math.sin(angle) * rayLength;
    const nextTipX = Math.cos(nextAngle) * nextRayLength;
    const nextTipY = Math.sin(nextAngle) * nextRayLength;
    
    if (i === 0) {
      ctx.moveTo(tipX, tipY);
    }
    
    const midAngle = angle + Math.PI / 8;
    const curveDepth = size * 0.12;
    const cpX = Math.cos(midAngle) * curveDepth;
    const cpY = Math.sin(midAngle) * curveDepth;
    
    ctx.quadraticCurveTo(cpX, cpY, nextTipX, nextTipY);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.fill(); // Double fill to hide lines
  
  ctx.restore();
}

// Check if a star is near constellation lines
// Get the stars that should be shown for constellation
const getConstellationStars = (constellationId) => {
  if (!constellations.value || !stars.value) return new Set()
  
  const constellation = constellations.value.features.find(c => c.id === constellationId)
  if (!constellation) return new Set()
  
  const selectedStars = new Set()
  
  // Get all unique line endpoints
  const endpoints = []
  constellation.geometry.coordinates.forEach(lineString => {
    lineString.forEach(([ra, dec]) => {
      endpoints.push({ ra, dec })
    })
  })
  
  // For each endpoint, find the closest star
  endpoints.forEach(endpoint => {
    let closestStar = null
    let closestDistance = Infinity
    
    stars.value.features.forEach(star => {
      const [starRA, starDec] = star.geometry.coordinates
      const raDistance = Math.abs(starRA - endpoint.ra)
      const decDistance = Math.abs(starDec - endpoint.dec)
      const distance = Math.sqrt(raDistance * raDistance + decDistance * decDistance)
      
      // Only consider stars within 2 degrees
      if (distance < 2 && distance < closestDistance) {
        closestDistance = distance
        closestStar = star
      }
    })
    
    if (closestStar) {
      selectedStars.add(closestStar)
    }
  })
  
  return selectedStars
}

const isStarInConstellation = (star, constellationId, constellationStarsCache) => {
  return constellationStarsCache.has(star)
}

// Draw the star map
const draw = () => {
  if (!canvas.value || !stars.value || !constellations.value) return

  const ctx = canvas.value.getContext('2d')
  const { width, height } = canvasSize.value
  const sunRA = getSunRA(props.date)
  const currentConst = currentConstellation.value
  const altitude = getSolarAltitude(props.date, props.location.lat, props.location.lon)

  // Get constellation stars (max ~10 brightest)
  const constellationStarsCache = currentConst ? getConstellationStars(currentConst) : new Set()

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
    
    // Check if this star is in current highlighted constellation
    const isInCurrentConstellation = isStarInConstellation(star, currentConst, constellationStarsCache)
    
    // Size based on magnitude
    let size = Math.max(0.6, 1.9 - mag / 3) // Smaller base size for background stars
    if (isInCurrentConstellation) {
      size *= 8 // MUCH BIGGER stars in constellation lines!
    }
    
    const opacity = Math.min(1, Math.max(0.1, (6 - mag) / 6))
    
    // Dynamic slow sparkle - each star has unique frequency
    const starSeed = ra * 73 + dec * 137 // Unique per star
    const glowFreq = 0.15 + (starSeed % 10) * 0.025 // Slower: 0.15 to 0.4
    const glowPhase = shimmerOffset.value * glowFreq + starSeed
    const glowPulse = Math.sin(glowPhase) * 0.5 + 0.5 // 0 to 1
    
    // Size variation (70% to 100%) - visible sparkle
    const sizeVariation = 0.7 + glowPulse * 0.3
    // Brightness variation (40% to 100%) - visible sparkle
    const brightnessVariation = 0.4 + glowPulse * 0.6

    // Draw star
    if (isInCurrentConstellation) {
      // Star shape for constellation stars with dynamic sparkle
      const colors = elementColors[currentConst]
      
      // Parse and adjust glow brightness
      const colorMatch = colors.glow.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
      const [_, r, g, b, a] = colorMatch
      const adjustedGlow = `rgba(${r}, ${g}, ${b}, ${parseFloat(a) * brightnessVariation})`
      const adjustedColor = `rgba(${r}, ${g}, ${b}, ${parseFloat(a) * 0.7 * brightnessVariation})`
      
      // Brighter stars get 8 rays, dimmer get 4 rays
      const use8Ray = mag < 2.5
      
      // Draw star shape with dynamic glow
      ctx.shadowBlur = 25 * brightnessVariation
      ctx.shadowColor = adjustedGlow
      ctx.fillStyle = adjustedColor
      
      if (use8Ray) {
        drawStarShape8(ctx, projected.x, projected.y, size * 1.3 * sizeVariation, 0)
      } else {
        drawStarShape4(ctx, projected.x, projected.y, size * 1.3 * sizeVariation, 0)
      }
      
      ctx.shadowBlur = 0
    } else {
      // Regular circles for other stars with subtle shimmer
      const shimmer = 1 + Math.sin(shimmerOffset.value * 0.3 + ra) * 0.05
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * shimmer})`
      ctx.beginPath()
      ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
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
          // Highlighted - pale with soft glow
          const colors = elementColors[constellation.id]
          ctx.strokeStyle = colors.color
          ctx.lineWidth = 3
          ctx.shadowColor = colors.glow
          ctx.shadowBlur = 8
        } else if (isOphiuchus) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'
          ctx.lineWidth = 1.2
          ctx.shadowBlur = 0
        } else {
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

// Animation loop for shimmer
let animationFrame = null
const animate = () => {
  shimmerOffset.value += 0.02
  draw()
  animationFrame = requestAnimationFrame(animate)
}

// Redraw on changes
watch(() => props.date, () => draw(), { immediate: false })
watch(() => props.location, () => draw(), { deep: true })
watch(() => props.showEarth, () => draw())
watch(() => props.showOphiuchus, () => draw())
watch([stars, constellations], () => {
  if (stars.value && constellations.value) {
    animate()
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