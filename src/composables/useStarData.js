import { ref, onMounted } from 'vue'

export function useStarData() {
  const stars = ref(null)
  const constellations = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const loadData = async () => {
    try {
      loading.value = true
      error.value = null

      // Load from d3-celestial GitHub
      const [starsRes, constelRes] = await Promise.all([
        fetch('https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/stars.6.json'),
        fetch('https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json')
      ])

      if (!starsRes.ok || !constelRes.ok) {
        throw new Error('Failed to load star data')
      }

      const starsData = await starsRes.json()
      const constelData = await constelRes.json()

      stars.value = starsData
      constellations.value = constelData
      loading.value = false

      console.log('✅ Star data loaded:', {
        stars: starsData.features.length,
        constellations: constelData.features.length
      })

      return { stars: starsData, constellations: constelData }
    } catch (err) {
      console.error('❌ Error loading star data:', err)
      error.value = err.message
      loading.value = false
      return null
    }
  }

  onMounted(() => {
    loadData()
  })

  return {
    stars,
    constellations,
    loading,
    error,
    loadData
  }
}