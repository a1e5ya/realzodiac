<template>
  <div class="relative w-full h-full bg-black rounded-lg overflow-hidden">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-purple-300">Loading star data...</p>
      </div>
    </div>

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
import { useAstronomy } from '@/composables/useAstronomy'
import { useCanvasRendering } from '@/composables/useCanvasRendering'
import { allCelestialBodies, zodiacIds, elementColors, constellationNames, constellationImageTransforms, constellationImageFiles } from '@/data/celestialBodies'

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
  showConstellationLines: {
    type: Boolean,
    default: true
  },
  showConstellationImages: {
    type: Boolean,
    default: false
  },
  showPlanets: {
    type: Boolean,
    default: false
  },
  showHorizon: {
    type: Boolean,
    default: false
  },
  showOphiuchus: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:date'])

const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartDate = ref(null)

const { stars, constellations, loading, error, loadData } = useStarData()
const astronomy = useAstronomy()
const renderer = useCanvasRendering()

const canvas = ref(null)
const canvasSize = ref({ width: 800, height: 800 })
const shimmerOffset = ref(0)
const constellationImages = ref({}) // Cache loaded images
const earthImage = ref(null) // Earth texture
const imagesLoading = ref(true)

const zodiacCount = computed(() => {
  if (!constellations.value) return 0
  return constellations.value.features.filter(c => zodiacIds.includes(c.id)).length
})

const currentConstellation = computed(() => {
  const sunRA = astronomy.getSunRA(props.date)
  const constellation = astronomy.getCurrentConstellation(sunRA)
  
  if (constellation === 'Oph' && !props.showOphiuchus) {
    return 'Sco'
  }
  
  return constellation
})

const solarAltitude = computed(() => {
  return astronomy.getSolarAltitude(props.date, props.location.lat, props.location.lon)
})

const solarAzimuth = computed(() => {
  return astronomy.getSolarAzimuth(props.date, props.location.lat, props.location.lon)
})

defineExpose({
  currentConstellation,
  constellationName: computed(() => 
    currentConstellation.value ? constellationNames[currentConstellation.value] : null
  )
})

const getConstellationStars = (constellationId) => {
  if (!constellations.value || !stars.value) return new Set()
  
  const constellation = constellations.value.features.find(c => c.id === constellationId)
  if (!constellation) return new Set()
  
  const selectedStars = new Set()
  const endpoints = []
  
  constellation.geometry.coordinates.forEach(lineString => {
    lineString.forEach(([ra, dec]) => {
      endpoints.push({ ra, dec })
    })
  })
  
  endpoints.forEach(endpoint => {
    let closestStar = null
    let closestDistance = Infinity
    
    stars.value.features.forEach(star => {
      const [starRA, starDec] = star.geometry.coordinates
      const raDistance = Math.abs(starRA - endpoint.ra)
      const decDistance = Math.abs(starDec - endpoint.dec)
      const distance = Math.sqrt(raDistance * raDistance + decDistance * decDistance)
      
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

// Load constellation images
const loadConstellationImages = async () => {
  imagesLoading.value = true
  
  // Load constellations
  const constellationPromises = Object.entries(constellationImageFiles).map(([constId, filename]) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        constellationImages.value[constId] = img
        resolve()
      }
      img.onerror = () => {
        console.warn(`Failed to load ${filename}`)
        resolve()
      }
      img.src = `/assets/constellations/${filename}`
    })
  })
  
  // Load Earth
  const earthPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      earthImage.value = img
      resolve()
    }
    img.onerror = () => {
      console.warn('Failed to load earth.')
      resolve()
    }
    img.src = `/assets/earth.svg`
  })
  
  await Promise.all([...constellationPromises, earthPromise])
  imagesLoading.value = false
  console.log('✅ Images loaded:', {
    constellations: Object.keys(constellationImages.value),
    earth: !!earthImage.value
  })
}

// Get constellation center point
const getConstellationCenter = (constellationId, sunRA, width, height) => {
  const constellation = constellations.value?.features.find(c => c.id === constellationId)
  if (!constellation) return null
  
  let totalRA = 0
  let totalDec = 0
  let count = 0
  
  constellation.geometry.coordinates.forEach(lineString => {
    lineString.forEach(([ra, dec]) => {
      totalRA += ra
      totalDec += dec
      count++
    })
  })
  
  if (count === 0) return null
  
  const centerRA = totalRA / count
  const centerDec = totalDec / count
  
  return astronomy.project(centerRA, centerDec, sunRA, width, height)
}

const draw = () => {
  if (!canvas.value || !stars.value || !constellations.value) return

  const ctx = canvas.value.getContext('2d')
  const { width, height } = canvasSize.value
  const sunRA = astronomy.getSunRA(props.date)
  const currentConst = currentConstellation.value
  const altitude = solarAltitude.value

  const constellationStarsCache = currentConst ? getConstellationStars(currentConst) : new Set()

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  // Draw stars
  stars.value.features.forEach(star => {
    const [ra, dec] = star.geometry.coordinates
    const projected = astronomy.project(ra, dec, sunRA, width, height)

    if (!projected.visible) return
    if (projected.x < -50 || projected.x > width + 50) return
    if (projected.y < -50 || projected.y > height + 50) return

    const mag = star.properties.mag
    const isInCurrentConstellation = constellationStarsCache.has(star)
    
    let size = Math.max(0.6, 1.9 - mag / 3)
    if (isInCurrentConstellation && props.showConstellationLines) {
      size *= 8
    }
    
    const opacity = Math.min(1, Math.max(0.1, (6 - mag) / 6))
    
    const starSeed = ra * 73 + dec * 137
    const glowFreq = 0.15 + (starSeed % 10) * 0.025
    const glowPhase = shimmerOffset.value * glowFreq + starSeed
    const glowPulse = Math.sin(glowPhase) * 0.5 + 0.5
    
    const sizeVariation = 0.7 + glowPulse * 0.3
    const brightnessVariation = 0.4 + glowPulse * 0.6

    if (isInCurrentConstellation && props.showConstellationLines) {
      const colors = elementColors[currentConst]
      const colorMatch = colors.glow.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
      const [_, r, g, b, a] = colorMatch
      const adjustedGlow = `rgba(${r}, ${g}, ${b}, ${parseFloat(a) * brightnessVariation})`
      const adjustedColor = `rgba(${r}, ${g}, ${b}, ${parseFloat(a) * 0.7 * brightnessVariation})`
      
      const use8Ray = mag < 2.5
      
      ctx.shadowBlur = 25 * brightnessVariation
      ctx.shadowColor = adjustedGlow
      ctx.fillStyle = adjustedColor
      
      if (use8Ray) {
        renderer.drawStarShape8(ctx, projected.x, projected.y, size * 1.3 * sizeVariation, 0)
      } else {
        renderer.drawStarShape4(ctx, projected.x, projected.y, size * 1.3 * sizeVariation, 0)
      }
      
      ctx.shadowBlur = 0
    } else {
      const shimmer = 1 + Math.sin(shimmerOffset.value * 0.3 + ra) * 0.05
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * shimmer})`
      ctx.beginPath()
      ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  // Draw constellation lines (only if enabled)
  if (props.showConstellationLines) {
    constellations.value.features
      .filter(c => zodiacIds.includes(c.id))
      .forEach(constellation => {
        const isOphiuchus = constellation.id === 'Oph'
        const isCurrent = constellation.id === currentConst
        
        constellation.geometry.coordinates.forEach(lineString => {
          if (isOphiuchus && !props.showOphiuchus) {
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'
            ctx.lineWidth = 1.2
            ctx.shadowBlur = 0
          } else if (isCurrent) {
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
            const projected = astronomy.project(ra, dec, sunRA, width, height)
            
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
  }
  
  // Draw constellation images (only if enabled and loaded)
  if (props.showConstellationImages && !imagesLoading.value) {
    zodiacIds.forEach(constId => {
      const img = constellationImages.value[constId]
      if (!img) return
      
      const isOphiuchus = constId === 'Oph'
      
      // Skip ophiuchus if not shown
      if (isOphiuchus && !props.showOphiuchus) return
      
      const center = getConstellationCenter(constId, sunRA, width, height)
      if (!center || !center.visible) return
      
      const transform = constellationImageTransforms[constId]
      const baseSize = 200 // Base image size
      const finalSize = baseSize * transform.scale
      
      ctx.save()
      ctx.translate(center.x + transform.offsetX, center.y + transform.offsetY)
      ctx.rotate((transform.rotation * Math.PI) / 180)
      
      // Same opacity for all, no glow
      ctx.globalAlpha = 0.6
      
      ctx.drawImage(
        img,
        -finalSize / 2,
        -finalSize / 2,
        finalSize,
        finalSize
      )
      
      ctx.restore()
    })
  }
  
  const centerX = width / 2
  const centerY = height / 2
  let earthData = null

  // Draw Earth (only if horizon enabled)
  if (props.showHorizon) {
    earthData = renderer.drawEarth(ctx, centerX, centerY, width, height, altitude, solarAzimuth.value, earthImage.value)
  }

  // Draw planets (only if enabled)
  if (props.showPlanets) {
    allCelestialBodies.forEach(body => {
      let ra, dec
      
      if (body.id === 'lilith') {
        ra = astronomy.getLilithRA(props.date)
        dec = astronomy.getLilithDec(props.date)
      } else if (body.id === 'node') {
        ra = astronomy.getPlanetRA(props.date, 'node')
        dec = astronomy.getPlanetDec(props.date, 'node')
      } else {
        ra = astronomy.getPlanetRA(props.date, body.id)
        dec = astronomy.getPlanetDec(props.date, body.id)
      }
      
      const pos = astronomy.project(ra, dec, sunRA, width, height)
      
      if (!pos.visible) return
      if (pos.x < -50 || pos.x > width + 50) return
      if (pos.y < -50 || pos.y > height + 50) return
      
      if (earthData) {
        const distToEarth = Math.sqrt(
          Math.pow(pos.x - earthData.x, 2) + Math.pow(pos.y - earthData.y, 2)
        )
        if (distToEarth < earthData.radius) return
      }
      
      if (body.isNode || body.id === 'lilith' || body.id === 'chiron') {
        renderer.drawSpecialPoint(ctx, pos.x, pos.y, body)
      } else {
        renderer.drawPlanet(ctx, pos.x, pos.y, body)
      }
    })
  }

  // Draw Moon
  const moonRA = astronomy.getMoonRA(props.date)
  const moonDec = astronomy.getMoonDec(props.date)
  const moonPos = astronomy.project(moonRA, moonDec, sunRA, width, height)
  
  let moonVisible = moonPos.visible && moonPos.x >= 0 && moonPos.x <= width && 
                    moonPos.y >= 0 && moonPos.y <= height
  
  if (earthData && moonVisible) {
    const distToEarth = Math.sqrt(
      Math.pow(moonPos.x - earthData.x, 2) + Math.pow(moonPos.y - earthData.y, 2)
    )
    if (distToEarth < earthData.radius) {
      moonVisible = false
    }
  }
  
  if (moonVisible) {
    const moonPhase = astronomy.getMoonPhase(props.date)
    renderer.drawMoon(ctx, moonPos.x, moonPos.y, moonPhase)
  }

  // Draw Sun (always visible)
  renderer.drawSun(ctx, centerX, centerY)
}

let animationFrame = null
const animate = () => {
  shimmerOffset.value += 0.02
  draw()
  animationFrame = requestAnimationFrame(animate)
}

watch(() => props.date, () => draw(), { immediate: false })
watch(() => props.location, () => draw(), { deep: true })
watch(() => props.showConstellationLines, () => draw())
watch(() => props.showConstellationImages, () => draw())
watch(() => props.showPlanets, () => draw())
watch(() => props.showHorizon, () => draw())
watch(() => props.showOphiuchus, () => draw())

watch([stars, constellations], () => {
  if (stars.value && constellations.value) {
    animate()
  }
})

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
  loadConstellationImages()
  handleResize()
  window.addEventListener('resize', handleResize)
})
</script>