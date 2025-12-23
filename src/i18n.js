import { createI18n } from 'vue-i18n'

// Translations
const messages = {
  en: {
    title: 'RealZodiac',
    subtitle: 'Your Real Zodiac',
    hero: 'Discover where the Sun really was when you were born',
    
    info: {
      precession: 'Due to <strong>axial precession</strong>, Earth\'s rotational axis slowly wobbles over a 26,000-year cycle. This means the zodiac constellations have shifted by approximately 30 days since ancient times.',
      learnMore: 'Learn more about axial precession',
      constellation13: 'The 13th constellation'
    },
    
    picker: {
      selectDate: 'Select Date & Time',
      date: 'Date',
      time: 'Time (UTC)',
      precision: 'Precision matters for accurate constellation position',
      viewing: 'Viewing sky for:',
      at: 'at'
    },
    
    viewport: {
      sunPosition: '☉ Sun Position',
      starMap: 'Star map viewport',
      description: 'This area will display real constellation shapes and star positions rotated to show the Sun\'s position on your selected date',
      legend: 'Legend',
      stars: 'Stars',
      currentConstellation: 'Current constellation',
      ophiuchus: 'Ophiuchus',
      otherZodiac: 'Other zodiac',
      controls: 'Controls',
      dragRotate: '🖱️ Drag to rotate (coming soon)',
      scrollZoom: '🔍 Scroll to zoom (coming soon)'
    },
    
    comparison: {
      astrologyTitle: 'Astrology Says',
      astronomyTitle: 'Astronomy Says',
      astrologyDesc: 'Based on the zodiac as it was positioned approximately <strong>2,000 years ago</strong> when the tropical zodiac was defined.',
      astronomyDesc: 'Where the Sun <strong>actually is</strong> in the sky right now, based on current astronomical observations and measurements.'
    },
    
    ophiuchus: {
      title: 'The Forgotten 13th Constellation',
      description: '<strong>Ophiuchus</strong> (the Serpent Bearer) is a real constellation that the Sun passes through for 18 days each year (November 30 - December 17). Traditional astrology ignores it to maintain exactly 12 signs aligned with the 12-month calendar.',
      duration: 'Duration',
      durationValue: '18 days (Nov 30 - Dec 17)',
      position: 'Position',
      positionValue: 'Between Scorpio & Sagittarius'
    },
    
    constellations: {
      title: 'All Zodiac Constellations',
      aries: 'Aries',
      taurus: 'Taurus',
      gemini: 'Gemini',
      cancer: 'Cancer',
      leo: 'Leo',
      virgo: 'Virgo',
      libra: 'Libra',
      scorpio: 'Scorpio',
      ophiuchus: 'Ophiuchus',
      sagittarius: 'Sagittarius',
      capricorn: 'Capricorn',
      aquarius: 'Aquarius',
      pisces: 'Pisces'
    },
    
    footer: {
      howItWorks: 'How does this work?',
      explanation: 'This visualization uses real astronomical data to show the actual positions of constellations relative to the Sun on any given date. The ~30-day shift is caused by Earth\'s axial precession, a slow wobble in our planet\'s rotation that completes one cycle every 26,000 years.',
      dataSource: 'Star data: d3-celestial (github.com/ofrohn/d3-celestial)',
      mission: 'Built to reveal the truth about zodiac signs'
    },
    
    dateRanges: {
      astro: {
        aries: 'March 21 - April 19',
        taurus: 'April 20 - May 20',
        gemini: 'May 21 - June 20',
        cancer: 'June 21 - July 22',
        leo: 'July 23 - August 22',
        virgo: 'August 23 - September 22',
        libra: 'September 23 - October 22',
        scorpio: 'October 23 - November 21',
        sagittarius: 'November 22 - December 21',
        capricorn: 'December 22 - January 19',
        aquarius: 'January 20 - February 18',
        pisces: 'February 19 - March 20'
      },
      real: {
        aries: 'April 19 - May 13',
        taurus: 'May 14 - June 19',
        gemini: 'June 20 - July 20',
        cancer: 'July 21 - August 9',
        leo: 'August 10 - September 15',
        virgo: 'September 16 - October 30',
        libra: 'October 31 - November 22',
        scorpio: 'November 23 - November 29',
        ophiuchus: 'November 30 - December 17',
        sagittarius: 'December 18 - January 18',
        capricorn: 'January 19 - February 15',
        aquarius: 'February 16 - March 11',
        pisces: 'March 12 - April 18'
      }
    }
  },
  
  ru: {
    title: 'RealZodiac',
    subtitle: 'Твой Настоящий Знак Зодиака',
    hero: 'Узнай, где на самом деле было Солнце, когда ты родился',
    
    info: {
      precession: 'Из-за <strong>прецессии оси</strong> вращения Земли происходит медленное колебание с циклом в 26 000 лет. Это означает, что зодиакальные созвездия сместились примерно на 30 дней с древних времён.',
      learnMore: 'Узнать больше о прецессии оси',
      constellation13: '13-е созвездие'
    },
    
    picker: {
      selectDate: 'Выберите дату и время',
      date: 'Дата',
      time: 'Время (UTC)',
      precision: 'Точность важна для правильного положения созвездия',
      viewing: 'Просмотр неба на:',
      at: 'в'
    },
    
    viewport: {
      sunPosition: '☉ Положение Солнца',
      starMap: 'Карта звёздного неба',
      description: 'Здесь будут отображаться настоящие формы созвездий и позиции звёзд, повёрнутые для показа положения Солнца на выбранную дату',
      legend: 'Легенда',
      stars: 'Звёзды',
      currentConstellation: 'Текущее созвездие',
      ophiuchus: 'Змееносец',
      otherZodiac: 'Другие зодиакальные',
      controls: 'Управление',
      dragRotate: '🖱️ Тащи для вращения (скоро)',
      scrollZoom: '🔍 Скролл для зума (скоро)'
    },
    
    comparison: {
      astrologyTitle: 'Астрология говорит',
      astronomyTitle: 'Астрономия говорит',
      astrologyDesc: 'Основано на положении зодиака примерно <strong>2000 лет назад</strong>, когда был определён тропический зодиак.',
      astronomyDesc: 'Где Солнце <strong>на самом деле находится</strong> в небе сейчас, на основе современных астрономических наблюдений и измерений.'
    },
    
    ophiuchus: {
      title: 'Забытое 13-е Созвездие',
      description: '<strong>Змееносец</strong> — это реальное созвездие, через которое Солнце проходит 18 дней каждый год (30 ноября - 17 декабря). Традиционная астрология игнорирует его, чтобы сохранить ровно 12 знаков в соответствии с 12-месячным календарём.',
      duration: 'Длительность',
      durationValue: '18 дней (30 ноя - 17 дек)',
      position: 'Положение',
      positionValue: 'Между Скорпионом и Стрельцом'
    },
    
    constellations: {
      title: 'Все Зодиакальные Созвездия',
      aries: 'Овен',
      taurus: 'Телец',
      gemini: 'Близнецы',
      cancer: 'Рак',
      leo: 'Лев',
      virgo: 'Дева',
      libra: 'Весы',
      scorpio: 'Скорпион',
      ophiuchus: 'Змееносец',
      sagittarius: 'Стрелец',
      capricorn: 'Козерог',
      aquarius: 'Водолей',
      pisces: 'Рыбы'
    },
    
    footer: {
      howItWorks: 'Как это работает?',
      explanation: 'Эта визуализация использует реальные астрономические данные, чтобы показать фактические положения созвездий относительно Солнца на любую дату. Сдвиг ~30 дней вызван прецессией земной оси — медленным колебанием вращения нашей планеты, которое завершает один цикл каждые 26 000 лет.',
      dataSource: 'Данные о звёздах: d3-celestial (github.com/ofrohn/d3-celestial)',
      mission: 'Создано, чтобы раскрыть правду о знаках зодиака'
    },
    
    dateRanges: {
      astro: {
        aries: '21 марта - 19 апреля',
        taurus: '20 апреля - 20 мая',
        gemini: '21 мая - 20 июня',
        cancer: '21 июня - 22 июля',
        leo: '23 июля - 22 августа',
        virgo: '23 августа - 22 сентября',
        libra: '23 сентября - 22 октября',
        scorpio: '23 октября - 21 ноября',
        sagittarius: '22 ноября - 21 декабря',
        capricorn: '22 декабря - 19 января',
        aquarius: '20 января - 18 февраля',
        pisces: '19 февраля - 20 марта'
      },
      real: {
        aries: '19 апреля - 13 мая',
        taurus: '14 мая - 19 июня',
        gemini: '20 июня - 20 июля',
        cancer: '21 июля - 9 августа',
        leo: '10 августа - 15 сентября',
        virgo: '16 сентября - 30 октября',
        libra: '31 октября - 22 ноября',
        scorpio: '23 ноября - 29 ноября',
        ophiuchus: '30 ноября - 17 декабря',
        sagittarius: '18 декабря - 18 января',
        capricorn: '19 января - 15 февраля',
        aquarius: '16 февраля - 11 марта',
        pisces: '12 марта - 18 апреля'
      }
    }
  },
  
  fi: {
    title: 'RealZodiac',
    subtitle: 'Todellinen Horoskooppimerkkisi',
    hero: 'Selvitä missä Aurinko todella oli kun synnyit',
    
    info: {
      precession: '<strong>Akselin precessio</strong> aiheuttaa Maan pyörimisakselissa hitaan heilahtelun 26 000 vuoden syklillä. Tämä tarkoittaa, että horoskooppimerkit ovat siirtyneet noin 30 päivää muinaisista ajoista.',
      learnMore: 'Lue lisää akselin prescessiosta',
      constellation13: '13. tähdistö'
    },
    
    picker: {
      selectDate: 'Valitse päivä ja aika',
      date: 'Päivämäärä',
      time: 'Aika (UTC)',
      precision: 'Tarkkuus on tärkeää tähdistön tarkan sijainnin määrittämiseksi',
      viewing: 'Tarkastellaan taivasta:',
      at: 'klo'
    },
    
    viewport: {
      sunPosition: '☉ Auringon sijainti',
      starMap: 'Tähtikartasto',
      description: 'Tässä näytetään todellisia tähdistöjen muotoja ja tähtien sijainteja käännettynä näyttämään Auringon sijainti valitulla päivämäärällä',
      legend: 'Selite',
      stars: 'Tähdet',
      currentConstellation: 'Nykyinen tähdistö',
      ophiuchus: 'Käärmeenkantaja',
      otherZodiac: 'Muut horoskooppimerkit',
      controls: 'Hallinta',
      dragRotate: '🖱️ Vedä pyörittääksesi (tulossa)',
      scrollZoom: '🔍 Vieritä zoomataksesi (tulossa)'
    },
    
    comparison: {
      astrologyTitle: 'Astrologia sanoo',
      astronomyTitle: 'Astronomia sanoo',
      astrologyDesc: 'Perustuu horoskooppimerkkeihin sellaisina kuin ne olivat noin <strong>2000 vuotta sitten</strong>, kun trooppinen horoskooppi määriteltiin.',
      astronomyDesc: 'Missä Aurinko <strong>todella on</strong> taivaalla juuri nyt, nykyisten tähtitieteellisten havaintojen ja mittausten perusteella.'
    },
    
    ophiuchus: {
      title: 'Unohdettu 13. tähdistö',
      description: '<strong>Käärmeenkantaja</strong> on todellinen tähdistö, jonka läpi Aurinko kulkee 18 päivää joka vuosi (30. marraskuuta - 17. joulukuuta). Perinteinen astrologia jättää sen huomiotta säilyttääkseen täsmälleen 12 merkkiä 12-kuukautisen kalenterin mukaisesti.',
      duration: 'Kesto',
      durationValue: '18 päivää (30.11 - 17.12)',
      position: 'Sijainti',
      positionValue: 'Skorpionin ja Jousimiehen välissä'
    },
    
    constellations: {
      title: 'Kaikki horoskooppitähdistöt',
      aries: 'Oinas',
      taurus: 'Härkä',
      gemini: 'Kaksoset',
      cancer: 'Rapu',
      leo: 'Leijona',
      virgo: 'Neitsyt',
      libra: 'Vaaka',
      scorpio: 'Skorpioni',
      ophiuchus: 'Käärmeenkantaja',
      sagittarius: 'Jousimies',
      capricorn: 'Kauris',
      aquarius: 'Vesimies',
      pisces: 'Kalat'
    },
    
    footer: {
      howItWorks: 'Miten tämä toimii?',
      explanation: 'Tämä visualisointi käyttää todellista tähtitieteellistä dataa näyttääkseen tähdistöjen todelliset sijainnit suhteessa Aurinkoon minä tahansa päivänä. Noin 30 päivän siirtymä johtuu Maan akselin prescessiosta, hitaasta heilahtelusta planeetamme pyörimisessä, joka täydentää yhden syklin joka 26 000 vuosi.',
      dataSource: 'Tähtitiedot: d3-celestial (github.com/ofrohn/d3-celestial)',
      mission: 'Rakennettu paljastamaan totuus horoskooppimerkeistä'
    },
    
    dateRanges: {
      astro: {
        aries: '21.3 - 19.4',
        taurus: '20.4 - 20.5',
        gemini: '21.5 - 20.6',
        cancer: '21.6 - 22.7',
        leo: '23.7 - 22.8',
        virgo: '23.8 - 22.9',
        libra: '23.9 - 22.10',
        scorpio: '23.10 - 21.11',
        sagittarius: '22.11 - 21.12',
        capricorn: '22.12 - 19.1',
        aquarius: '20.1 - 18.2',
        pisces: '19.2 - 20.3'
      },
      real: {
        aries: '19.4 - 13.5',
        taurus: '14.5 - 19.6',
        gemini: '20.6 - 20.7',
        cancer: '21.7 - 9.8',
        leo: '10.8 - 15.9',
        virgo: '16.9 - 30.10',
        libra: '31.10 - 22.11',
        scorpio: '23.11 - 29.11',
        ophiuchus: '30.11 - 17.12',
        sagittarius: '18.12 - 18.1',
        capricorn: '19.1 - 15.2',
        aquarius: '16.2 - 11.3',
        pisces: '12.3 - 18.4'
      }
    }
  },
  
  sv: {
    title: 'RealZodiac',
    subtitle: 'Ditt Riktiga Stjärntecken',
    hero: 'Upptäck var solen verkligen var när du föddes',
    
    info: {
      precession: 'På grund av <strong>axelprecession</strong> gungar jordens rotationsaxel långsamt över en 26 000-årscykel. Detta innebär att stjärntecknen har förskjutits cirka 30 dagar sedan antiken.',
      learnMore: 'Läs mer om axelprecession',
      constellation13: 'Den 13:e stjärnbilden'
    },
    
    picker: {
      selectDate: 'Välj datum och tid',
      date: 'Datum',
      time: 'Tid (UTC)',
      precision: 'Precision är viktigt för korrekt stjärnbildsposition',
      viewing: 'Visar himlen för:',
      at: 'kl'
    },
    
    viewport: {
      sunPosition: '☉ Solens position',
      starMap: 'Stjärnkarta',
      description: 'Detta område kommer att visa riktiga stjärnbildsformer och stjärnpositioner roterade för att visa solens position på ditt valda datum',
      legend: 'Förklaring',
      stars: 'Stjärnor',
      currentConstellation: 'Aktuell stjärnbild',
      ophiuchus: 'Ormbäraren',
      otherZodiac: 'Andra stjärntecken',
      controls: 'Kontroller',
      dragRotate: '🖱️ Dra för att rotera (kommer snart)',
      scrollZoom: '🔍 Scrolla för att zooma (kommer snart)'
    },
    
    comparison: {
      astrologyTitle: 'Astrologi säger',
      astronomyTitle: 'Astronomi säger',
      astrologyDesc: 'Baserat på zodiaken som den var positionerad för cirka <strong>2000 år sedan</strong> när den tropiska zodiaken definierades.',
      astronomyDesc: 'Var solen <strong>faktiskt är</strong> på himlen just nu, baserat på aktuella astronomiska observationer och mätningar.'
    },
    
    ophiuchus: {
      title: 'Den Glömda 13:e Stjärnbilden',
      description: '<strong>Ormbäraren</strong> är en verklig stjärnbild som solen passerar genom i 18 dagar varje år (30 november - 17 december). Traditionell astrologi ignorerar den för att behålla exakt 12 tecken i linje med 12-månaderskalendern.',
      duration: 'Varaktighet',
      durationValue: '18 dagar (30 nov - 17 dec)',
      position: 'Position',
      positionValue: 'Mellan Skorpionen och Skytten'
    },
    
    constellations: {
      title: 'Alla Stjärntecken',
      aries: 'Väduren',
      taurus: 'Oxen',
      gemini: 'Tvillingarna',
      cancer: 'Kräftan',
      leo: 'Lejonet',
      virgo: 'Jungfrun',
      libra: 'Vågen',
      scorpio: 'Skorpionen',
      ophiuchus: 'Ormbäraren',
      sagittarius: 'Skytten',
      capricorn: 'Stenbocken',
      aquarius: 'Vattumannen',
      pisces: 'Fiskarna'
    },
    
    footer: {
      howItWorks: 'Hur fungerar det?',
      explanation: 'Denna visualisering använder verklig astronomisk data för att visa stjärnbildernas faktiska positioner i förhållande till solen på vilket datum som helst. Förskjutningen på ~30 dagar orsakas av jordens axelprecession, en långsam gungnin i vår planets rotation som fullbordar en cykel var 26 000:e år.',
      dataSource: 'Stjärndata: d3-celestial (github.com/ofrohn/d3-celestial)',
      mission: 'Byggd för att avslöja sanningen om stjärntecken'
    },
    
    dateRanges: {
      astro: {
        aries: '21 mars - 19 april',
        taurus: '20 april - 20 maj',
        gemini: '21 maj - 20 juni',
        cancer: '21 juni - 22 juli',
        leo: '23 juli - 22 augusti',
        virgo: '23 augusti - 22 september',
        libra: '23 september - 22 oktober',
        scorpio: '23 oktober - 21 november',
        sagittarius: '22 november - 21 december',
        capricorn: '22 december - 19 januari',
        aquarius: '20 januari - 18 februari',
        pisces: '19 februari - 20 mars'
      },
      real: {
        aries: '19 april - 13 maj',
        taurus: '14 maj - 19 juni',
        gemini: '20 juni - 20 juli',
        cancer: '21 juli - 9 augusti',
        leo: '10 augusti - 15 september',
        virgo: '16 september - 30 oktober',
        libra: '31 oktober - 22 november',
        scorpio: '23 november - 29 november',
        ophiuchus: '30 november - 17 december',
        sagittarius: '18 december - 18 januari',
        capricorn: '19 januari - 15 februari',
        aquarius: '16 februari - 11 mars',
        pisces: '12 mars - 18 april'
      }
    }
  }
}

// Detect browser language
const getBrowserLanguage = () => {
  const lang = navigator.language || navigator.userLanguage
  const shortLang = lang.split('-')[0]
  
  // Support these languages
  const supported = ['en', 'ru', 'fi', 'sv']
  return supported.includes(shortLang) ? shortLang : 'en'
}

export default createI18n({
  legacy: false,
  locale: getBrowserLanguage(),
  fallbackLocale: 'en',
  messages
})
