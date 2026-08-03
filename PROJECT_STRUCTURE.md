# Project Folder Structure

**Root**: `d:/Rohit/Actis Exp Center Hyrd/Boardroom/Ver`

```
Ver/
│
├── .gitignore
├── AircomControlsReffencewithcss.md
├── CAFE_MIGRATION.md
├── eslint.config.js
├── index.html
├── Landing_Page.md
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── TECHINICAL_BRIEF_PROCESSOR_AND_AC.md
├── theme-generator-final.html
├── TODO.md
├── UI_AND_STARTUP_FIXES.md
├── vite.config.js
│
├── Docs/
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
    │   │   ├── Actis_logo.jpg
    │   │   ├── Actis_logo_old.jpg
    │   │   ├── Black_logo.png
    │   │   ├── layout_combined.webp
    │   │   ├── Townhall.webp
    │   │   ├── Townhall_Layout.webp
    │   │   ├── training_combined.webp
    │   │   └── White_logo.png
    │   └── sounds/
    │       ├── error.mp3
    │       ├── order-placed.mp3
    │       ├── ordernew.mp3
    │       └── success.mp3
    │
    ├── components/
    │   ├── AcStatusListener 1+1.jsx
    │   ├── AcStatusListener.jsx
    │   ├── AcStatusListener_old.jsx
    │   ├── ErrorBoundary.jsx
    │   ├── OrderListener.jsx
    │   ├── PageTransition.jsx
    │   ├── RoomModeListener.jsx
    │   ├── ShutdownScreen ref.jsx
    │   ├── ShutdownScreen.jsx
    │   │
    │   ├── devices/
    │   │   ├── AirconControl.jsx
    │   │   ├── AirconControlBoardroom.jsx
    │   │   ├── AirconControlTrainingRoom.jsx
    │   │   ├── AudioChannel.jsx
    │   │   ├── BoardroomDisplayControl.jsx
    │   │   ├── BoardroomSourceSelection.jsx
    │   │   ├── DisplayPowerControl.jsx
    │   │   ├── DrapesControlDevice.jsx
    │   │   ├── DrapesQuickControl.jsx
    │   │   ├── LightingBoardroom.jsx
    │   │   ├── LightingControl.jsx
    │   │   ├── LightingPresetsCompact.jsx
    │   │   ├── MicChannel.jsx
    │   │   ├── MicrophoneControl.jsx
    │   │   ├── MicrophoneControl.CHANGES.md
    │   │   ├── MicrophoneControl.SNAPSHOT.md
    │   │   ├── RoomLayoutDisplay.jsx
    │   │   ├── RoomLayoutDisplay_1st.jsx
    │   │   ├── RoomLayoutDisplayOld.jsx
    │   │   ├── SourceSelection.jsx
    │   │   ├── SpeakerControl.jsx
    │   │   ├── SpeakerControlBoardroom.jsx
    │   │   └── VideoWallDevice.jsx
    │   │
    │   ├── layout/
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   │
    │   ├── modals/
    │   │   ├── ACControlModal.jsx
    │   │   ├── ColorPickerModal.jsx
    │   │   ├── EditMenuModal.jsx
    │   │   ├── OrderListModal.jsx
    │   │   ├── ShutdownModal.jsx
    │   │   └── SystemInfoModal.jsx
    │   │
    │   ├── ui/
    │   │   ├── Button.jsx
    │   │   ├── Card.jsx
    │   │   ├── DPad.jsx
    │   │   ├── LayoutApplyBar.jsx
    │   │   ├── Modal.jsx
    │   │   ├── OnScreenKeyboard.jsx
    │   │   ├── Select.jsx
    │   │   ├── Slider.jsx
    │   │   ├── Toast.jsx
    │   │   ├── ToastContainer.jsx
    │   │   ├── Toggle.jsx
    │   │   └── VolumeSlider.jsx
    │   │
    │   └── vc/
    │       ├── VCAudioModal.jsx
    │       ├── VCCameraControlsModal.jsx
    │       ├── VCContentModal.jsx
    │       ├── VCLayoutModal.jsx
    │       ├── VCLeftSidebar.jsx
    │       ├── VCLightingControlsModal.jsx
    │       ├── VCScheduleMeetingModal.jsx
    │       └── vcLayouts.jsx
    │
    ├── context/
    │   ├── AudioContext.jsx
    │   ├── ProcessorConnectionContext.jsx
    │   ├── RoomModeContext.jsx
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
    │   └── useJoin.js
    │
    ├── pages/
    │   ├── AudioControlsPage.jsx
    │   ├── AVMatrixPage.jsx
    │   ├── BoardRoom.jsx
    │   ├── CafePage.jsx
    │   ├── CombinedRoom.jsx
    │   ├── EngineeringPage.jsx
    │   ├── LandingPage.jsx
    │   ├── RoomControlsPage.jsx
    │   ├── SettingsPage.jsx
    │   ├── SettingsPageBoardroom.jsx
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
| Root config files | 16 |
| Docs/ | 3 |
| public/ (assets + fonts) | 6 |
| src/assets/fonts/ | 5 |
| src/assets/images/ | 9 |
| src/assets/sounds/ | 4 |
| src/components/ (top-level) | 9 |
| src/components/devices/ | 22 |
| src/components/layout/ | 2 |
| src/components/modals/ | 6 |
| src/components/ui/ | 12 |
| src/components/vc/ | 8 |
| src/context/ | 4 |
| src/crestron/ | 2 |
| src/docs/ | 1 |
| src/hooks/ | 1 |
| src/pages/ | 12 |
| src/styles/ | 1 |
| src/utils/ | 3 |
| **Total** | **~135 files** |

