// src/composables/useAstronomy.js
// REAL astronomical calculations using astronomy-engine
// Install: npm install astronomy-engine

import * as Astronomy from 'astronomy-engine'

export function useAstronomy() {
  
  // Precession correction helper (still needed for display)
  const getPrecessionOffset = (date) => {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
    const yearsSinceJ2000 = (date.getFullYear() - 2000) + (dayOfYear / 365.25)
    return yearsSinceJ2000 * 0.01397
  }
  
  // Convert ecliptic longitude to RA for display
  const eclipticToRA = (eclipticLon) => {
    // Normalize to -180 to 180 range for display
    let ra = eclipticLon
    if (ra > 180) ra -= 360
    if (ra < -180) ra += 360
    return ra
  }
  
  // Sun position - Use ecliptic for proper zodiac alignment
  const getSunRA = (date) => {
    // Use astronomy-engine for accurate Sun ecliptic position
    const pos = Astronomy.SunPosition(date)
    // Apply precession correction for historical dates
    const precessionOffset = getPrecessionOffset(date)
    let ra = eclipticToRA(pos.elon) - precessionOffset
    
    if (ra > 180) ra -= 360
    if (ra < -180) ra += 360
    
    return ra
  }

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

  // Moon - SIMPLE (works)
  const getMoonRA = (date) => {
    const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0).getTime()
    const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon) / 86400000
    const synodicMonth = 29.53058867
    const daysSinceNewMoon = daysSinceKnownNewMoon % synodicMonth
    const moonOffset = daysSinceNewMoon * 12.19
    
    const sunRA = getSunRA(date)
    let moonRA = (sunRA + moonOffset) % 360
    
    if (moonRA > 180) moonRA -= 360
    if (moonRA < -180) moonRA += 360
    
    return moonRA
  }

  const getMoonPhase = (date) => {
    const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0).getTime()
    const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon) / 86400000
    const synodicMonth = 29.53058867
    // Handle negative values (dates before 2000) properly
    let phase = (daysSinceKnownNewMoon % synodicMonth) / synodicMonth
    if (phase < 0) phase += 1 // Fix negative modulo
    return phase
  }

  const getMoonDec = (date) => {
    const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0).getTime()
    const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon) / 86400000
    const draconicMonth = 27.21222
    const angle = (daysSinceKnownNewMoon / draconicMonth) * 2 * Math.PI
    return 5.145 * Math.sin(angle)
  }

  // Planets - REAL (astronomy-engine for accuracy)
  const getPlanetRA = (date, planet) => {
    const bodyMap = {
      mercury: 'Mercury',
      venus: 'Venus',
      mars: 'Mars',
      jupiter: 'Jupiter',
      saturn: 'Saturn',
      uranus: 'Uranus',
      neptune: 'Neptune',
      pluto: 'Pluto'
    }
    
    if (planet === 'chiron') {
      const J2000 = new Date('2000-01-01T12:00:00Z').getTime()
      const daysSinceJ2000 = (date.getTime() - J2000) / 86400000
      const L0 = 120.5
      const n = 0.01945
      const meanLongitude = (L0 + n * daysSinceJ2000) % 360
      return eclipticToRA(meanLongitude)
    }
    
    if (planet === 'node') {
      const J2000 = new Date('2000-01-01T12:00:00Z').getTime()
      const daysSinceJ2000 = (date.getTime() - J2000) / 86400000
      const L0 = 125.04
      const n = -0.05295
      const longitude = (L0 + n * daysSinceJ2000 / 365.25) % 360
      return eclipticToRA(longitude)
    }
    
    const bodyName = bodyMap[planet]
    if (!bodyName) return 0
    
    // Use ecliptic coordinates (same system as Sun/zodiac)
    const pos = Astronomy.GeoVector(bodyName, date, false)
    const ecliptic = Astronomy.Ecliptic(pos)
    return eclipticToRA(ecliptic.elon)
  }

  const getPlanetDec = (date, planet) => {
    const bodyMap = {
      mercury: 'Mercury',
      venus: 'Venus',
      mars: 'Mars',
      jupiter: 'Jupiter',
      saturn: 'Saturn',
      uranus: 'Uranus',
      neptune: 'Neptune',
      pluto: 'Pluto'
    }
    
    if (planet === 'chiron') {
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
      return Math.sin((dayOfYear / 365) * Math.PI * 2) * 6.9
    }
    
    if (planet === 'node') {
      return 0
    }
    
    const bodyName = bodyMap[planet]
    if (!bodyName) return 0
    
    // Use ecliptic latitude (small for planets on ecliptic plane)
    const pos = Astronomy.GeoVector(bodyName, date, false)
    const ecliptic = Astronomy.Ecliptic(pos)
    return ecliptic.elat
  }

  // Lilith (Black Moon) - approximation (not in astronomy-engine)
  const getLilithRA = (date) => {
    const J2000 = new Date('2000-01-01T12:00:00Z').getTime()
    const daysSinceJ2000 = (date.getTime() - J2000) / 86400000
    
    const period = 3232.6
    const L0 = 45.0
    const meanAnomaly = (360 / period) * daysSinceJ2000
    const meanLongitude = (L0 + meanAnomaly) % 360
    
    return eclipticToRA(meanLongitude)
  }

  const getLilithDec = (date) => {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
    return Math.sin((dayOfYear / 365) * Math.PI * 2) * 5
  }

  // Zodiac constellation detection
  const getCurrentConstellation = (sunRA) => {
    let normalizedRA = sunRA
    if (normalizedRA < 0) normalizedRA += 360

    const zodiacRanges = {
      'Psc1': { start: 0, end: 30, id: 'Psc' },
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
      'Aqr': { start: 328, end: 350, id: 'Aqr' },
      'Psc2': { start: 350, end: 360, id: 'Psc' }
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

  return {
    getSunRA,
    getSolarAltitude,
    getSolarAzimuth,
    getMoonRA,
    getMoonPhase,
    getMoonDec,
    getPlanetRA,
    getPlanetDec,
    getLilithRA,
    getLilithDec,
    getCurrentConstellation,
    project
  }
}