// src/composables/useAstronomy.js
// All astronomical calculations in one place

import { computed } from 'vue'

export function useAstronomy() {
  
  // Precession correction helper
  const getPrecessionOffset = (date) => {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
    const yearsSinceJ2000 = (date.getFullYear() - 2000) + (dayOfYear / 365.25)
    // Precession rate: 50.3 arcseconds per year = 0.01397 degrees/year
    return yearsSinceJ2000 * 0.01397
  }
  
  // Sun position with precession
  const getSunRA = (date) => {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
    const baseRA = ((dayOfYear - 80) * 0.9856) % 360
    const precessionOffset = getPrecessionOffset(date)
    let ra = (baseRA - precessionOffset) % 360
    
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

  // Moon position with precession
  const getMoonRA = (date) => {
    const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0).getTime()
    const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon) / 86400000
    const synodicMonth = 29.53058867
    const daysSinceNewMoon = daysSinceKnownNewMoon % synodicMonth
    const moonOffset = daysSinceNewMoon * 12.19
    
    // Use PRECESSED Sun position (to maintain Moon-Sun separation for phases)
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
    
    // Handle negative days (ancient dates) properly
    let daysSinceNewMoon = daysSinceKnownNewMoon % synodicMonth
    if (daysSinceNewMoon < 0) daysSinceNewMoon += synodicMonth
    
    return daysSinceNewMoon / synodicMonth
  }

  const getMoonDec = (date) => {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
    return 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  }

  // Planet positions with precession
  const getPlanetRA = (date, planet) => {
    const J2000 = new Date('2000-01-01T12:00:00Z').getTime()
    const daysSinceJ2000 = (date.getTime() - J2000) / 86400000
    
    const periods = {
      mercury: 87.97,
      venus: 224.70,
      mars: 686.98,
      jupiter: 4332.59,
      saturn: 10759.22,
      uranus: 30688.5,
      neptune: 60182,
      pluto: 90560,
      chiron: 18513,
      node: -6798
    }
    
    const L0 = {
      mercury: 252.25,
      venus: 181.98,
      mars: 355.45,
      jupiter: 34.35,
      saturn: 50.08,
      uranus: 314.05,
      neptune: 304.35,
      pluto: 238.93,
      chiron: 120.5,
      node: 180.0
    }
    
    const period = periods[planet]
    const meanAnomaly = (360 / period) * daysSinceJ2000
    const meanLongitude = (L0[planet] + meanAnomaly) % 360
    
    // Apply precession
    const precessionOffset = getPrecessionOffset(date)
    let ra = (meanLongitude - 180 - precessionOffset) % 360
    
    if (ra > 180) ra -= 360
    if (ra < -180) ra += 360
    
    return ra
  }

  const getPlanetDec = (date, planet) => {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
    
    const inclinations = {
      mercury: 7,
      venus: 3.4,
      mars: 1.9,
      jupiter: 1.3,
      saturn: 2.5,
      uranus: 0.8,
      neptune: 1.8,
      pluto: 17,
      chiron: 6.9,
      node: 5.1
    }
    
    const incl = inclinations[planet] || 2
    const variation = Math.sin((dayOfYear / 365) * Math.PI * 2) * incl
    return variation
  }

  // Lilith (Black Moon) with precession
  const getLilithRA = (date) => {
    const J2000 = new Date('2000-01-01T12:00:00Z').getTime()
    const daysSinceJ2000 = (date.getTime() - J2000) / 86400000
    
    const period = 3232.6
    const L0 = 45.0
    const meanAnomaly = (360 / period) * daysSinceJ2000
    const meanLongitude = (L0 + meanAnomaly) % 360
    
    // Apply precession
    const precessionOffset = getPrecessionOffset(date)
    let ra = (meanLongitude - 180 - precessionOffset) % 360
    
    if (ra > 180) ra -= 360
    if (ra < -180) ra += 360
    
    return ra
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