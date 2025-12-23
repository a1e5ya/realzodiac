import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// LibreTranslate public instance (free, no API key needed!)
const LIBRETRANSLATE_API = 'https://libretranslate.com/translate'

// Target languages
const TARGET_LANGUAGES = [
  'es', // Spanish
  'fr', // French
  'de', // German
  'pt', // Portuguese
  'it', // Italian
  'ja', // Japanese
  'ko', // Korean
  'zh', // Chinese
  'ar', // Arabic
  'hi', // Hindi
  'nl', // Dutch
  'pl', // Polish
  'tr', // Turkish
  'uk', // Ukrainian
  'cs', // Czech
  'da', // Danish
  'no', // Norwegian
]

// Delay between requests to avoid rate limiting
const DELAY_MS = 200

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function translateText(text, targetLang) {
  try {
    // Remove HTML tags for translation
    const cleanText = text.replace(/<[^>]*>/g, '')
    
    const response = await axios.post(LIBRETRANSLATE_API, {
      q: cleanText,
      source: 'en',
      target: targetLang,
      format: 'text'
    })
    
    // Restore HTML tags if present
    if (text.includes('<strong>')) {
      return response.data.translatedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    }
    
    return response.data.translatedText
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error.message)
    return text // Return original if translation fails
  }
}

async function translateObject(obj, targetLang, path = '') {
  const translated = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key
    
    if (typeof value === 'object' && value !== null) {
      translated[key] = await translateObject(value, targetLang, currentPath)
    } else if (typeof value === 'string') {
      console.log(`Translating ${currentPath} to ${targetLang}...`)
      translated[key] = await translateText(value, targetLang)
      await delay(DELAY_MS) // Rate limiting
    } else {
      translated[key] = value
    }
  }
  
  return translated
}

async function generateTranslations() {
  console.log('🌍 Starting translation generation with LibreTranslate (free!)\n')
  
  // Load base English translation
  const i18nPath = path.join(__dirname, '..', 'src', 'i18n.js')
  const i18nContent = fs.readFileSync(i18nPath, 'utf-8')
  
  // Extract English messages (simple regex, works for our structure)
  const enMatch = i18nContent.match(/en:\s*{([\s\S]*?)},\s*ru:/s)
  if (!enMatch) {
    console.error('Could not find English messages in i18n.js')
    return
  }
  
  // Parse English messages
  const enMessages = eval(`({${enMatch[1]}})`)
  
  console.log('📖 English messages loaded\n')
  
  // Translate to each language
  for (const lang of TARGET_LANGUAGES) {
    console.log(`\n🔄 Translating to ${lang.toUpperCase()}...`)
    
    try {
      const translated = await translateObject(enMessages, lang)
      
      // Save to file
      const outputPath = path.join(__dirname, '..', 'translations', `${lang}.json`)
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2))
      
      console.log(`✅ ${lang.toUpperCase()} translation saved!`)
    } catch (error) {
      console.error(`❌ Failed to translate ${lang}:`, error.message)
    }
  }
  
  console.log('\n\n🎉 Translation complete! Check ./translations/ folder')
  console.log('\n💡 Now copy the translations into src/i18n.js')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTranslations().catch(console.error)
}

export { translateText, translateObject }
