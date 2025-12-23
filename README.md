# 🌟 RealZodiac - Your Real Zodiac

Discover where the Sun really was when you were born. Due to Earth's axial precession, zodiac signs have shifted by approximately 30 days since ancient times.

![RealZodiac Preview](./og-image.png)

## ✨ Features

- 📅 Interactive date and time picker
- 🌌 Real constellation visualizations with astronomical data
- 🔭 Comparison: Astrology vs Astronomy
- ⚕️ The forgotten 13th constellation (Ophiuchus)
- 📚 Educational content about axial precession
- 🎨 Beautiful cosmic UI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Project Structure

```
RealZodiac/
├── public/              # Static assets
├── src/
│   ├── components/      # Vue components (future)
│   ├── composables/     # Composition API logic (future)
│   ├── data/           # Constellation data (future)
│   ├── utils/          # Helper functions (future)
│   ├── App.vue         # Main app component
│   ├── main.js         # Entry point
│   └── style.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🌐 Deployment to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/RealZodiac.git
git push -u origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

3. **Add Custom Domain:**
   - Go to Project Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Build Settings (Auto-detected by Vercel)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🎨 Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue Next
- **Hosting**: Vercel

## 📊 Roadmap

### Phase 1 (Current) - MVP
- [x] Responsive wireframe
- [x] Date/time picker
- [x] Educational content
- [ ] Real star data integration
- [ ] Accurate Sun position calculation

### Phase 2 - Enhanced Visualization
- [ ] Interactive star map
- [ ] Real constellation shapes
- [ ] Smooth animations
- [ ] Star magnitude rendering

### Phase 3 - Interactivity
- [ ] Drag to rotate
- [ ] Zoom controls
- [ ] Constellation details
- [ ] Social sharing

### Phase 4 - Polish
- [ ] Multi-language support
- [ ] Performance optimization
- [ ] Analytics
- [ ] SEO optimization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

- Star catalog data: [d3-celestial](https://github.com/ofrohn/d3-celestial)
- Astronomical calculations: Public domain formulas
- Constellation boundaries: IAU definitions

## 📧 Contact

Created by Alexa

---

**Remember**: The stars don't lie, but calendars do! ✨
