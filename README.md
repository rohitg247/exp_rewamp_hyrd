# Base-Touchpanel-Control-Interface

**A base/starter project** for building Crestron touch panel control interfaces with React + Tailwind CSS.

## Features

- **Scalable Multi-Page Architecture**: ContentWrapper pattern for consistent layout management
- **Session Storage**: State persistence across refreshes with automatic cleanup
- **Theme Switching**: CSS-variable-based theming with runtime switching (Alt+1/2/3)
- **Crestron Integration**: Full WebXPanel support with digital, analog, and serial joins
- **Touch-Optimized Design**: Responsive layout for 1920×1200 Crestron touch panels
- **Offline-First**: All assets stored locally, no external dependencies

## Prerequisites

- **Node.js** 16+
- **npm** 8+
- **Git**

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/Actis-Technologies/Base-Touchpanel-Control-Interface.git
cd Base-Touchpanel-Control-Interface
```

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Access at `http://localhost:5173` (or configured port)

### Build for Production

```bash
npm run build
```

### Create Crestron Archive

```bash
npm run build:archive  # Creates .ch5z package
```

## Technology Stack

- **React** 18.3.1 (JSX only, no TypeScript)
- **Vite** 5.4.2 (Build tool)
- **Tailwind CSS** 3.4.17 (with custom `touchPanel` breakpoint at 1920×1200)
- **React Router DOM** 7.9.1 (MemoryRouter for offline operation)
- **@crestron/ch5-webxpanel** 2.8.0 (Crestron integration)

## Project Structure

```
src/
├── components/
│   ├── devices/          # Device control components
│   ├── layout/           # Navbar, Sidebar
│   ├── modals/           # Modal dialogs
│   └── ui/               # Reusable UI components
├── pages/                # Page components
│   ├── LandingPage.jsx   # Entry point
│   ├── MainPage.jsx      # Dashboard / navigation hub
│   ├── AVMatrixPage.jsx  # Reference: Complex interactive page
│   └── UnderDevelopment.jsx # Reference: Simple static page
├── hooks/                # Custom hooks (useJoin.js for Crestron)
├── crestron/             # Crestron integration
│   ├── joins.js          # Centralized join number mappings
│   └── webxpanel.js      # WebXPanel initialization
├── styles/               # Theme system (global.css with CSS variables)
└── assets/               # Local fonts, images
```

## Crestron Integration

### Using Join Hooks

```jsx
import { useDigitalJoin, useAnalogJoin, useSerialJoin } from '../hooks/useJoin';
import { DIGITAL_JOINS, ANALOG_JOINS, SERIAL_JOINS } from '../crestron/joins';

// Digital Join (boolean: on/off, toggles)
const [isOn, toggle] = useDigitalJoin(DIGITAL_JOINS.DEVICE_POWER);

// Analog Join (numeric: sliders, levels 0-100)
const [volume, setVolume] = useAnalogJoin(ANALOG_JOINS.VOLUME, 50);

// Serial Join (text/JSON: commands, data)
const [, sendCommand] = useSerialJoin(SERIAL_JOINS.ROUTING);
```

All join numbers are centrally managed in `src/crestron/joins.js`.

## Adding New Pages

See [Developer Guide.md](Developer%20Guide.md) for complete step-by-step instructions.

**Quick reference:**
1. Create component in `src/pages/YourPage.jsx`
2. Import in `src/App.jsx`
3. Add route to `showNavbar` array
4. Add route to `showSidebar` array (if needed)
5. Create `<Route>` in routing section
6. (Optional) Add navbar button in `src/components/layout/Navbar.jsx`

## Theme System

Three themes available via keyboard shortcuts:
- **Alt+1**: Default (Dark blue primary)
- **Alt+2**: Blue-Yellow (Navy + yellow accents)
- **Alt+3**: Light (Light backgrounds)

All theming via CSS variables in `src/styles/global.css`. Use Tailwind classes for theme-aware styling:

```jsx
<div className="bg-primary text-white">  {/* Theme-aware */}
  Content
</div>
```

## Documentation

- **[Project Details & Architecture.md](Project%20Details%20%26%20Architecture.md)** - System architecture, design patterns, and technical decisions
- **[Developer Guide.md](Developer%20Guide.md)** - Step-by-step guides, best practices, and troubleshooting

## Reference Implementations

- **AVMatrixPage** (`src/pages/AVMatrixPage.jsx`) - Complex page with drag-drop, session storage, and Crestron integration
- **UnderDevelopment** (`src/pages/UnderDevelopment.jsx`) - Simple static page template

Use these as templates for your own pages.

## Deployment

```bash
# Development
npm run dev

# Production build
npm run build

# Create Crestron package
npm run build:archive

# Deploy to Crestron (requires network configuration)
npm run deploy
```

## Browser Support

- Modern browsers (Chrome 88+, Firefox 85+, Safari 14+)
- Crestron HTML5 touch panels
- Touch-enabled devices

## License

Proprietary - For use with Crestron control systems only.
