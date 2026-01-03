// src/composables/useCanvasRendering.js
// All canvas drawing functions

export function useCanvasRendering() {

  // Draw smooth 4-pointed star (thin rays)
  const drawStarShape4 = (ctx, x, y, size, rotation = 0) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    
    ctx.beginPath()
    
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2
      const nextAngle = ((i + 1) * Math.PI) / 2
      
      const tipX = Math.cos(angle) * size
      const tipY = Math.sin(angle) * size
      const nextTipX = Math.cos(nextAngle) * size
      const nextTipY = Math.sin(nextAngle) * size
      
      if (i === 0) {
        ctx.moveTo(tipX, tipY)
      }
      
      const midAngle = angle + Math.PI / 4
      const curveDepth = size * 0.10
      const cpX = Math.cos(midAngle) * curveDepth
      const cpY = Math.sin(midAngle) * curveDepth
      
      ctx.quadraticCurveTo(cpX, cpY, nextTipX, nextTipY)
    }
    
    ctx.closePath()
    ctx.fill()
    ctx.fill()
    
    ctx.restore()
  }

  // Draw smooth 8-pointed star (thin rays)
  const drawStarShape8 = (ctx, x, y, size, rotation = 0) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    
    ctx.beginPath()
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      const nextAngle = ((i + 1) * Math.PI) / 4
      
      const rayLength = (i % 2 === 0) ? size : size * 0.6
      const nextRayLength = ((i + 1) % 2 === 0) ? size : size * 0.6
      
      const tipX = Math.cos(angle) * rayLength
      const tipY = Math.sin(angle) * rayLength
      const nextTipX = Math.cos(nextAngle) * nextRayLength
      const nextTipY = Math.sin(nextAngle) * nextRayLength
      
      if (i === 0) {
        ctx.moveTo(tipX, tipY)
      }
      
      const midAngle = angle + Math.PI / 8
      const curveDepth = size * 0.12
      const cpX = Math.cos(midAngle) * curveDepth
      const cpY = Math.sin(midAngle) * curveDepth
      
      ctx.quadraticCurveTo(cpX, cpY, nextTipX, nextTipY)
    }
    
    ctx.closePath()
    ctx.fill()
    ctx.fill()
    
    ctx.restore()
  }

  // Draw Moon with accurate phase
  const drawMoon = (ctx, x, y, phase, size = 10) => {
  // Glow
  const moonGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5)
  moonGlow.addColorStop(0, 'rgba(226, 232, 240, 0.5)')
  moonGlow.addColorStop(1, 'rgba(226, 232, 240, 0)')
  ctx.fillStyle = moonGlow
  ctx.beginPath()
  ctx.arc(x, y, size * 2.5, 0, Math.PI * 2)
  ctx.fill()
  
  // Draw black circle base
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.fill()
  
  // Invert phase to match real moon
  const invertedPhase = 1 - phase
  
  // Draw white light on top
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.clip()
  
  ctx.fillStyle = '#f1f5f9'
  ctx.beginPath()
  
  if (invertedPhase < 0.5) {
    // Waxing (0 → 0.5) - light on RIGHT
    const terminator = (invertedPhase) * 2  // 0 → 1
    
    // Right edge
    ctx.arc(x, y, size, -Math.PI/2, Math.PI/2, true)
    
    // Light curve
    ctx.ellipse(
      x, y,
      (1 - terminator) * size,
      size,
      0,
      Math.PI/2,
      -Math.PI/2,
      false
    )
  } else {
    // Waning (0.5 → 1) - light on LEFT
    const terminator = (invertedPhase - 0.5) * 2  // 0 → 1
    
    // Left edge
    ctx.arc(x, y, size, Math.PI/2, -Math.PI/2, true)
    
    // Light curve
    ctx.ellipse(
      x, y,
      terminator * size,  // Changed from (1 - terminator)
      size,
      0,
      -Math.PI/2,
      Math.PI/2,
      false
    )
  }
  
  ctx.closePath()
  ctx.fill()
  ctx.restore()
  
  // Edge highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.stroke()
}

  // Draw Sun
  const drawSun = (ctx, x, y, size = 12) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5)
    gradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)')
    gradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.4)')
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, size * 2.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Draw Earth (horizon) with optional texture image
  const drawEarth = (ctx, centerX, centerY, width, height, altitude, azimuth, earthImage = null) => {
    const earthRadius = Math.min(width, height) * 3
    const verticalOffset = earthRadius * (1 + altitude / 90)
    const azimuthRad = (azimuth - 180) * Math.PI / 180
    const horizontalOffset = Math.sin(azimuthRad) * earthRadius * 0.3
    
    const earthX = centerX + horizontalOffset
    const earthY = centerY + verticalOffset
    
    // Calculate opacity based on sun altitude
    // altitude > 0: sun above horizon, Earth invisible (opacity 0)
    // altitude = 0: sun at horizon, Earth semi-visible (opacity 0.5)
    // altitude < 0: sun below horizon, Earth visible (opacity 1)
    let earthOpacity = 1
    if (altitude > 0) {
      earthOpacity = 0 // Sun above - no Earth
    } else if (altitude > -10) {
      // Transition zone: -10° to 0°
      earthOpacity = Math.abs(altitude) / 10 // 0 to 1
    }
    
    if (earthOpacity === 0) return null // Don't draw if invisible
    
    ctx.save()
    ctx.globalAlpha = earthOpacity
    
    // Clip to circle
    ctx.beginPath()
    ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2)
    ctx.clip()
    
    if (earthImage) {
      // Draw earth texture image
      const imgSize = earthRadius * 2
      ctx.drawImage(
        earthImage,
        earthX - earthRadius,
        earthY - earthRadius,
        imgSize,
        imgSize
      )
    } else {
      // Fallback: gradient
      ctx.fillStyle = 'rgba(251, 191, 36, 0.5)'
      ctx.beginPath()
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.restore()

    return { x: earthX, y: earthY, radius: earthRadius }
  }

  // Draw planet
  const drawPlanet = (ctx, x, y, planet) => {
    // Glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, planet.size * 2.5)
    glow.addColorStop(0, planet.color + '99')
    glow.addColorStop(1, planet.color + '00')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, planet.size * 2.5, 0, Math.PI * 2)
    ctx.fill()
    
    // Body
    ctx.fillStyle = planet.color
    ctx.beginPath()
    ctx.arc(x, y, planet.size, 0, Math.PI * 2)
    ctx.fill()
    
    // Saturn rings
    if (planet.hasRings) {
      ctx.strokeStyle = planet.color + '80'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(x, y, planet.size * 1.8, planet.size * 0.5, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    
    // Label
    ctx.fillStyle = planet.color
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'left'
    ctx.shadowColor = 'black'
    ctx.shadowBlur = 4
    ctx.fillText(
      `${planet.symbol} ${planet.name}`,
      x + planet.size + 6,
      y + 4
    )
    ctx.shadowBlur = 0
  }

  // Draw special point (nodes, lilith, chiron)
  const drawSpecialPoint = (ctx, x, y, point) => {
    // Different rendering for nodes
    if (point.isNode) {
      // Dragon head symbol - diamond shape
      ctx.fillStyle = point.color
      ctx.beginPath()
      ctx.moveTo(x, y - point.size)
      ctx.lineTo(x + point.size * 0.7, y)
      ctx.lineTo(x, y + point.size)
      ctx.lineTo(x - point.size * 0.7, y)
      ctx.closePath()
      ctx.fill()
    } else {
      // Regular circle for other points
      const glow = ctx.createRadialGradient(x, y, 0, x, y, point.size * 2)
      glow.addColorStop(0, point.color + '99')
      glow.addColorStop(1, point.color + '00')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(x, y, point.size * 2, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = point.color
      ctx.beginPath()
      ctx.arc(x, y, point.size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Label
    ctx.fillStyle = point.color
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'left'
    ctx.shadowColor = 'black'
    ctx.shadowBlur = 4
    ctx.fillText(
      `${point.symbol} ${point.name}`,
      x + point.size + 6,
      y + 4
    )
    ctx.shadowBlur = 0
  }

  return {
    drawStarShape4,
    drawStarShape8,
    drawMoon,
    drawSun,
    drawEarth,
    drawPlanet,
    drawSpecialPoint
  }
}