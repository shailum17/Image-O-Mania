# 🖼️ imageOmania — Creative Design Gallery

A visually stunning design gallery rebuilt with a modern TypeScript + Vite stack. Features a Pinterest-style masonry layout, smooth animations, image search, collaboration tools, and fully responsive pages.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript |
| Bundler | Vite 5 |
| Styling | CSS (design tokens, component styles, per-page sheets) |
| Animation | AOS (Animate On Scroll) |
| Runtime | Vanilla TS — no frameworks |

---

## 📁 Project Structure

```
imageOmania/
├── src/
│   ├── ts/                  # TypeScript modules (one per page)
│   │   ├── home.ts
│   │   ├── about.ts
│   │   ├── search.ts
│   │   ├── designs.ts
│   │   └── collaboration.ts
│   ├── styles/              # CSS — tokens, components, per-page
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── page-loader.css
│   │   └── pages/
│   └── components/          # Shared HTML partials (header, footer)
│
├── Assets/                  # Images, SVGs, icons
├── index.html               # Home page
├── about.html
├── search.html
├── designs.html
├── collaboration.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

The site is served at `http://localhost:5173` with hot-module replacement.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview the production build with:

```bash
npm run preview
```

---

## ✨ Features

- Pinterest-style masonry design gallery
- Scroll-triggered animations via AOS
- Free image search (Unsplash API integration)
- Collaboration / contribution submission flow
- Fully responsive layout (mobile → desktop)
- Page loader with smooth transitions
- CSS design tokens for consistent theming

---

## 📬 Contributions

To add your designs or contribute, reach out:
📩 **[shailendramourya17@gmail.com](mailto:shailendramourya17@gmail.com)**
