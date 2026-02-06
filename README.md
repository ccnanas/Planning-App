# Project Plan Template

An interactive, shareable project plan built with React + Vite. Features task tracking, comments, visual timelines, and a built-in editor — all powered by a single JSON file.

## Features

- **Visual Dashboard** — Overview with auto-generated timeline, progress tracking, and stats
- **Phase & Task Tracking** — Checkboxes with persistent progress (saved in localStorage)
- **Component Sections** — Define specs, layouts, or any structured data with fields
- **Tech Stack & Risks** — Document your tools, costs, and risk mitigation
- **Comments** — Collaborate by adding comments to any section
- **Built-in Editor** — Add, edit, and remove everything through a visual UI
- **Import/Export JSON** — Download your plan as JSON or import an existing one
- **Customizable Branding** — Change colors, title, and company name from the editor
- **Zero Backend** — Everything runs client-side with localStorage persistence

## Quick Start

```bash
# Clone or use as template
git clone <your-repo-url>
cd project-plan-template

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` and click the **Editor** tab to start customizing.

## How to Customize

### Option 1: Use the built-in Editor (easiest)

1. Run `npm run dev`
2. Click the **Editor** tab
3. Edit your project title, phases, tasks, sections, tech stack, and risks
4. Click **Export JSON** to save your plan
5. Your changes auto-save to localStorage

### Option 2: Edit the JSON file directly

Edit `src/data/defaultPlan.json` to change the default plan data:

```json
{
  "config": {
    "title": "Your Project Name",
    "subtitle": "Your subtitle here",
    "brandName": "Your Company",
    "colors": {
      "primary": "#0055A4",
      "dark": "#0D1B2A",
      "light": "#E8F0FE",
      "accent": "#00C2FF"
    }
  },
  "phases": [...],
  "sections": [...],
  "techStack": {...},
  "risks": [...]
}
```

### Adding a Phase

Add a new object to the `phases` array:

```json
{
  "id": 7,
  "title": "Your New Phase",
  "weeks": "13-14",
  "icon": "⚡",
  "summary": "Description of this phase",
  "tasks": [
    { "id": "7-1", "task": "Task name", "detail": "Task details" }
  ]
}
```

### Adding a Section

Add a new object to the `sections` array:

```json
{
  "name": "Contact Form",
  "layout": "contact_form",
  "color": "#7B1FA2",
  "fields": [
    { "name": "heading", "type": "Text" },
    { "name": "form_fields", "type": "Repeater", "sub": ["label (Text)", "type (Select)", "required (Boolean)"] }
  ]
}
```

## Deploying

### Vercel (recommended)

```bash
npm run build
# Deploy the `dist` folder, or connect your GitHub repo to Vercel for auto-deploy
```

### Any Static Host

Run `npm run build` and deploy the `dist/` folder to any static hosting (Netlify, GitHub Pages, S3, etc).

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── MigrationPlan.jsx   # Main app container
│   │   ├── Editor.jsx          # Built-in plan editor
│   │   ├── PhaseCard.jsx       # Phase display with tasks
│   │   ├── SectionCard.jsx     # Section/component specs
│   │   ├── TaskCheckbox.jsx    # Individual task checkbox
│   │   ├── CommentSection.jsx  # Comment thread per section
│   │   └── Badge.jsx           # UI badge component
│   ├── hooks/
│   │   └── useLocalStorage.js  # Persistent state hook
│   ├── data/
│   │   └── defaultPlan.json    # Default plan data
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Tech Stack

- **React 19** — UI framework
- **Vite** — Build tool with hot reload
- **Zero dependencies** beyond React — no CSS libraries, no state management libraries

## License

MIT
# Planning-App
