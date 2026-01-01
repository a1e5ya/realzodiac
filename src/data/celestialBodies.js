// src/data/celestialBodies.js
// All planet/body configurations

export const planets = [
  // Personal planets (fast-moving)
  { 
    id: 'mercury', 
    name: 'Mercury', 
    symbol: '☿', 
    color: '#9ca3af', 
    size: 4, 
    category: 'personal',
    rulership: ['Gemini', 'Virgo']
  },
  { 
    id: 'venus', 
    name: 'Venus', 
    symbol: '♀', 
    color: '#fbbf24', 
    size: 7, 
    category: 'personal',
    rulership: ['Taurus', 'Libra']
  },
  { 
    id: 'mars', 
    name: 'Mars', 
    symbol: '♂', 
    color: '#ef4444', 
    size: 5, 
    category: 'personal',
    rulership: ['Aries', 'Scorpio']
  },
  
  // Social planets (medium-speed)
  { 
    id: 'jupiter', 
    name: 'Jupiter', 
    symbol: '♃', 
    color: '#f59e0b', 
    size: 11, 
    category: 'social',
    rulership: ['Sagittarius', 'Pisces']
  },
  { 
    id: 'saturn', 
    name: 'Saturn', 
    symbol: '♄', 
    color: '#eab308', 
    size: 9, 
    category: 'social',
    rulership: ['Capricorn', 'Aquarius'],
    hasRings: true
  },
  
  // Outer planets (slow-moving, generational)
  { 
    id: 'uranus', 
    name: 'Uranus', 
    symbol: '♅', 
    color: '#06b6d4', 
    size: 7, 
    category: 'outer',
    rulership: ['Aquarius']
  },
  { 
    id: 'neptune', 
    name: 'Neptune', 
    symbol: '♆', 
    color: '#3b82f6', 
    size: 7, 
    category: 'outer',
    rulership: ['Pisces']
  },
  { 
    id: 'pluto', 
    name: 'Pluto', 
    symbol: '♇', 
    color: '#8b5cf6', 
    size: 4, 
    category: 'outer',
    rulership: ['Scorpio']
  }
]

export const specialPoints = [
  // Chiron - "wounded healer"
  { 
    id: 'chiron', 
    name: 'Chiron', 
    symbol: '⚷', 
    color: '#ec4899', 
    size: 5, 
    category: 'special',
    description: 'Wounded Healer'
  },
  
  // North Node (Rahu in Vedic)
  { 
    id: 'node', 
    name: 'North Node', 
    symbol: '☊', 
    color: '#10b981', 
    size: 6, 
    category: 'nodes',
    description: 'Dragon\'s Head',
    isNode: true
  },
  
  // Lilith (Black Moon)
  { 
    id: 'lilith', 
    name: 'Lilith', 
    symbol: '⚸', 
    color: '#7c3aed', 
    size: 5, 
    category: 'special',
    description: 'Black Moon'
  }
]

// Combine all for easy iteration
export const allCelestialBodies = [...planets, ...specialPoints]

// Constellation names mapping
export const constellationNames = {
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

// Zodiac IDs
export const zodiacIds = ['Ari', 'Tau', 'Gem', 'Cnc', 'Leo', 'Vir', 'Lib', 'Sco', 'Oph', 'Sgr', 'Cap', 'Aqr', 'Psc']

// Element colors for constellations
export const elementColors = {
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