# Project Folder Structure

**Root**: `d:/Rohit/Actis Exp Center Hyrd/Boardroom/Ver`

```
Ver/
│
├── .gitignore
├── CAFE_MIGRATION.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── PROJECT_STRUCTURE.md
├── README.md
├── tailwind.config.js
├── theme-generator-final.html
├── vite.config.js
│
├── Docs/
│   ├── changes.md
│   ├── crestron-panel-safe-css.md
│   ├── ui-startup-fixes-generic.md
│   └── ui-startup-fixes-sibling.md
│
├── public/
│   ├── Actis_Favicon.png
│   ├── vite.svg
│   └── fonts/
│       ├── Inter-Bold.woff2
│       ├── Inter-Medium.woff2
│       ├── Inter-Regular.woff2
│       └── Inter-SemiBold.woff2
│
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    │
    ├── assets/
    │   ├── fonts/
    │   │   ├── .gitkeep
    │   │   ├── Inter-Bold.woff2
    │   │   ├── Inter-Medium.woff2
    │   │   ├── Inter-Regular.woff2
    │   │   └── Inter-SemiBold.woff2
    │   ├── images/
    │   │   ├── .gitkeep
    │   │   ├── Actis_logo_old.jpg
    │   │   ├── Actis_logo.jpg
    │   │   ├── Black_logo.png
    │   │   ├── layout_combined.webp
    │   │   ├── Townhall_Layout.webp
    │   │   ├── Townhall.webp
    │   │   ├── training_combined.webp
    │   │   └── White_logo.png
    │   └── sounds/
    │       ├── error.mp3
    │       ├── order-placed.mp3
    │       ├── ordernew.mp3
    │       └── success.mp3
    │
    ├── components/
    │   ├── ErrorBoundary.jsx
    │   ├── OrderListener.jsx
    │   ├── ShutdownScreen.jsx
    │   │
    │   ├── devices/
    │   │   ├── AirconControl.jsx
    │   │   ├── AudioChannel.jsx
    │   │   ├── DisplayPowerControl.jsx
    │   │   ├── DisplayPowerGrid copy 2.jsx
    │   │   ├── DisplayPowerGrid copy.jsx
    │   │   ├── DisplayPowerGrid.jsx
    │   │   ├── DrapesControlDevice.jsx
    │   │   ├── DrapesQuickControl.jsx
    │   │   ├── LightingControl.jsx
    │   │   ├── LightingPresetsCompact.jsx
    │   │   ├── MicChannel.jsx
    │   │   ├── MicrophoneControl.jsx
    │   │   ├── RoomLayoutDisplay.jsx
    │   │   ├── SourceSelection.jsx
    │   │   ├── SpeakerControl.jsx
    │   │   └── VideoWallDevice.jsx
    │   │
    │   ├── layout/
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   │
    │   ├── modals/
    │   │   ├── ColorPickerModal.jsx
    │   │   ├── EditMenuModal copy.jsx
    │   │   ├── EditMenuModal.jsx
    │   │   ├── OrderListModal.jsx
    │   │   ├── ShutdownModal.jsx
    │   │   └── SystemInfoModal.jsx
    │   │
    │   └── ui/
    │       ├── Button.jsx
    │       ├── Card.jsx
    │       ├── DisplayHeroControl.jsx
    │       ├── DPad.jsx
    │       ├── LayoutApplyBar.jsx
    │       ├── Modal.jsx
    │       ├── OnScreenKeyboard.jsx
    │       ├── Select.jsx
    │       ├── Slider.jsx
    │       ├── Toast.jsx
    │       ├── ToastContainer.jsx
    │       ├── Toggle.jsx
    │       └── VolumeSlider.jsx
    │
    ├── context/
    │   ├── AudioContext.jsx
    │   ├── ProcessorConnectionContext copy.jsx
    │   ├── ProcessorConnectionContext.jsx
    │   └── ThemeContext.jsx
    │
    ├── crestron/
    │   ├── joins.js
    │   └── webxpanel.js
    │
    ├── docs/
    │   └── backend-triggered-shutdown.md
    │
    ├── hooks/
    │   ├── useJoin copy.js
    │   └── useJoin.js
    │
    ├── pages/
    │   ├── AudioControlsPage.jsx
    │   ├── AVMatrixPage.jsx
    │   ├── AVMatrixPage copy.jsx
    │   ├── AVMatrixPage copy 2.jsx
    │   ├── AVMatrixPage copy 3.jsx
    │   ├── AVMatrixPage copy 4.jsx
    │   ├── AVMatrixPage copy 5.jsx
    │   ├── CafePage.jsx
    │   ├── CafePage copy.jsx
    │   ├── EngineeringPage.jsx
    │   ├── LandingPage.jsx
    │   ├── LandingPage copy.jsx
    │   ├── MainPage.jsx
    │   ├── RoomControlsPage.jsx
    │   ├── RoomControlsPage copy.jsx
    │   ├── SettingsPage.jsx
    │   ├── UnderDevelopment.jsx
    │   └── VCPage.jsx
    │
    ├── styles/
    │   └── global.css
    │
    └── utils/
        ├── colorUtils.js
        ├── crestronInitManager.js
        └── safeStorage.js
```

## Summary

| Directory | File Count |
|-----------|-----------|
| Root config files | 12 |
| Docs/ | 4 |
| public/ (assets + fonts) | 6 |
| src/ (top-level: App, index.css, main.jsx) | 3 |
| src/assets/fonts/ | 5 |
| src/assets/images/ | 9 |
| src/assets/sounds/ | 4 |
| src/components/ (top-level) | 3 |
| src/components/devices/ | 16 |
| src/components/layout/ | 2 |
| src/components/modals/ | 6 |
| src/components/ui/ | 13 |
| src/context/ | 4 |
| src/crestron/ | 2 |
| src/docs/ | 1 |
| src/hooks/ | 2 |
| src/pages/ | 18 |
| src/styles/ | 1 |
| src/utils/ | 3 |
| **Total** | **~114 files** |

## Notes

- Several files are **backup / work-in-progress copies** (kept in place, not wired into the build).
  They are identified by ` copy`, ` copy 2`, ` copy 3`, etc. suffixes, e.g.:
  - `src/pages/AVMatrixPage copy.jsx` … `copy 5.jsx`
  - `src/pages/CafePage copy.jsx`, `src/pages/LandingPage copy.jsx`, `src/pages/RoomControlsPage copy.jsx`
  - `src/components/devices/DisplayPowerGrid copy.jsx`, `DisplayPowerGrid copy 2.jsx`
  - `src/components/modals/EditMenuModal copy.jsx`
  - `src/context/ProcessorConnectionContext copy.jsx`
  - `src/hooks/useJoin copy.js`
- The **active** (non-copy) files are the canonical ones used by `src/App.jsx` and the build.
