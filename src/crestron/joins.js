/**
 * ============================================
 * CRESTRON JOIN DEFINITIONS
 * ============================================
 *
 * JOIN TYPE LEGEND:
 * [PULSE]    - Send momentary 100ms pulse (true→false)
 * [FEEDBACK] - Read-only, processor sends updates
 * [ANALOG]   - Numeric value (0-65535 or 0-100%)
 * [SERIAL]   - String/JSON data
 *
 * CrComLib Signal Types:
 * - Digital: 'b' (boolean)
 * - Analog:  'n' (numeric, 0-65535)
 * - Serial:  's' (string)
 *
 * NUMBERING CONVENTION:
 * - Digital Joins  : 1   – 199
 * - Analog Joins   : 200 – 299
 * - Serial Joins   : 300 – 399
 * - Joins are grouped by component/feature
 * - Each group starts at the next 10-boundary
 * - Spare slots are left for future expansion
 * - Digital, Analog, and Serial use globally unique numbers (no overlaps across types or rooms)
 */



// ============================================
// DIGITAL JOINS (1–199)
// ============================================
export const DIGITAL_JOINS = {
  // ── GROUP 1: System Control (D1-9) ──
  SYSTEM_STARTUP: 3,              // [PULSE] LandingPage.jsx - Send pulse on system startup
  SYSTEM_SHUTDOWN: 5,             // [PULSE] ShutdownModal.jsx - Send pulse on system shutdown
  BACKEND_SHUTDOWN: 7,            // [FEEDBACK] App.jsx - Backend-triggered shutdown
  // D1-2, D4, D6, D9: Reserved



  // ── GROUP 2: Speaker / Mic Controls (D10-19) ──
  // D10: Removed — Speaker ON/OFF now uses ANALOG_JOINS.SPEAKER_ON_OFF_ANALOG (A202)
  // D11: Removed — Master Mic manual press now uses ANALOG_JOINS.MIC_MASTER_MANUAL (A224)
  // D12: Removed — Speaker ON/OFF Boardroom now uses ANALOG_JOINS.SPEAKER_ON_OFF_BOARDROOM_ANALOG (A212)
  // D13-19: Reserved



  // D20-29: Reserved (Group 3, Room Layout — card removed from Room Controls)



  // ── GROUP 4: Display 1 — Training Room (D30-39) ──
  DISPLAY1_ON: 30,                // [PULSE] DisplayDevice.jsx - Display 1 power on
  DISPLAY1_OFF: 31,               // [PULSE] DisplayDevice.jsx - Display 1 power off
  // D32-39: Reserved



  // ── GROUP 5: Display 2 — Repeater (D40-49) ──
  DISPLAY2_ON: 40,                // [PULSE] DisplayDevice.jsx - Display 2 power on
  DISPLAY2_OFF: 41,               // [PULSE] DisplayDevice.jsx - Display 2 power off
  // D42-49: Reserved



  // ── GROUP 6: Display 3 (D50-59) ──
  DISPLAY3_ON: 50,                // [PULSE] DisplayPowerControl.jsx - Display 3 power on
  DISPLAY3_OFF: 51,               // [PULSE] DisplayPowerControl.jsx - Display 3 power off
  // D52-59: Reserved



  // ── GROUP 7: Device Status (D60-69) ──
  DEVICE_STATUS_REFRESH: 60,          // [PULSE] SettingsPage.jsx - Refresh device status
  // D61-69: Reserved



  // ── GROUP 8: Aircon Controls (D70-79) ──
  // D70: Removed — Aircon power now uses ANALOG_JOINS.AC_ON_OFF_ANALOG (A222)
  // D71: Removed — Boardroom aircon power now uses ANALOG_JOINS.AC_ON_OFF_BOARDROOM_ANALOG (A223)
  // D72-79: Reserved



  // ── GROUP 9: Lighting Controls (D80-89) ──
  LIGHTS_WELCOME: 80,             // [PULSE] LightingControl.jsx - Welcome preset
  LIGHTS_PRESENTATION: 81,        // [PULSE] LightingControl.jsx - Presentation preset
  LIGHTS_VIDEO_CONF: 82,          // [PULSE] LightingControl.jsx - Video Conference preset
  LIGHTS_MEETING: 83,             // [PULSE] LightingControl.jsx - Meeting preset
  LIGHTS_ALL_OFF: 84,             // [PULSE] LightingControl.jsx - All lights off
  // D85-89: Reserved



  // D90-109: Reserved — Drapes hardware removed from the room (was GROUP 10: Drapes Controls)



  // ── GROUP 11: Source Mode Selection (D110-119) ──
  SOURCE_MODE_PRESENTATION: 110,  // [PULSE] SourceSelection.jsx - Presentation mode (laptop on all displays)
  SOURCE_MODE_VC: 111,            // [PULSE] SourceSelection.jsx - VC Call mode (codec primary/secondary)
  // D112-119: Reserved



  // ── GROUP 12: Cafe Orders (D120-129) ──
  // ORDER_COMPLETE: 120,            // [PULSE] OrderListModal.jsx - Order complete
  // ORDER_CANCEL: 121,              // [PULSE] OrderListModal.jsx - Order cancel
  // D122-129: Reserved


  // ── GROUP 13: System Heartbeat (D130-139) ──
  SYSTEM_HEARTBEAT_SEND: 130,     // [PULSE] ProcessorConnectionContext.jsx - Frontend sends pulse every 10s
  SYSTEM_HEARTBEAT_RECEIVE: 131,  // [FEEDBACK] ProcessorConnectionContext.jsx - Backend response pulse
  CAFE_ORDER_COMPLETE: 132,       // [FEEDBACK] OrderListener.jsx - Processor pulses when order completed
  CAFE_ORDER_CANCEL: 133,         // [FEEDBACK] OrderListener.jsx - Processor pulses when order cancelled
  // D134-139: Reserved

  // ── GROUP 14: Engineering Page (D140-149) ──
  // ── GROUP 14: Ghost Images (D140-149) ──
  GHOST_IMAGE_TOWNHALL:    140,   // [PULSE] EngineeringPage.jsx - Ghost image: Townhall mode
  GHOST_IMAGE_COMBINED_TR: 141,   // [PULSE] EngineeringPage.jsx - Ghost image: Combined TR mode
  GHOST_IMAGE_COMBINED:    142,   // [PULSE] EngineeringPage.jsx - Ghost image: BR + TR mode
  GHOST_IMAGE_STOP:        143,   // [PULSE] EngineeringPage.jsx - Stop ghost image
  VOICE_LIFT_ENHANCED:     144,   // [PULSE] EngineeringPage.jsx - Voice Lift Enhanced
  VOICE_LIFT_NATURAL:      145,   // [PULSE] EngineeringPage.jsx - Voice Lift Natural
  CAMERA_REBOOT:           146,   // [PULSE] EngineeringPage.jsx - Voice Lift Natural
  // D147-149: Reserved

  // ── GROUP 15: AV Matrix — Presentation Layouts (D150-159) ──
  // D150, D152: Reserved (Discussion/Center layouts removed — unused)
  PRES_LAYOUT_FULL: 151,          // [PULSE] AVMatrixPage.jsx - Full Window layout select
  PRES_LAYOUT_DUAL: 153,          // [PULSE] AVMatrixPage.jsx - Dual Window layout select
  PRES_LAYOUT_3_RIGHT: 154,       // [PULSE] AVMatrixPage.jsx - 3 Window (asymmetric left grid) layout select
  PRES_LAYOUT_3_LEFT: 155,        // [PULSE] AVMatrixPage.jsx - 3 Window (asymmetric right grid) layout select
  // ⚠️ TODO: PRES_LAYOUT_QUAD is referenced by AVMatrixPage.jsx but has no real
  // join yet (it currently falls back to PRES_LAYOUT_3_LEFT — see the ⚠️ comment
  // there). Provisionally reserved at D156 pending confirmation with the
  // Crestron processor programmer — do not wire until confirmed.
  // D156: PRES_LAYOUT_QUAD (provisional, unconfirmed)
  // D157-159: Reserved



  // ── GROUP 16: Room Controls — Display Power, 6 Displays (D160-179) ──
  SIDE_DISPLAY_1_ON: 160,         // [PULSE] DisplayPowerGrid.jsx - Side Display 1 power on
  SIDE_DISPLAY_1_OFF: 161,        // [PULSE] DisplayPowerGrid.jsx - Side Display 1 power off
  SIDE_DISPLAY_2_ON: 162,         // [PULSE] DisplayPowerGrid.jsx - Side Display 2 power on
  SIDE_DISPLAY_2_OFF: 163,        // [PULSE] DisplayPowerGrid.jsx - Side Display 2 power off
  SIDE_DISPLAY_3_ON: 164,         // [PULSE] DisplayPowerGrid.jsx - Side Display 3 power on
  SIDE_DISPLAY_3_OFF: 165,        // [PULSE] DisplayPowerGrid.jsx - Side Display 3 power off
  SIDE_DISPLAY_4_ON: 166,         // [PULSE] DisplayPowerGrid.jsx - Side Display 4 power on
  SIDE_DISPLAY_4_OFF: 167,        // [PULSE] DisplayPowerGrid.jsx - Side Display 4 power off
  BACK_DISPLAY_ON: 168,           // [PULSE] DisplayPowerGrid.jsx - 75" Back Display power on
  BACK_DISPLAY_OFF: 169,          // [PULSE] DisplayPowerGrid.jsx - 75" Back Display power off
  VIDEOWALL_ON: 170,              // [PULSE] DisplayPowerGrid.jsx - Video Wall power on
  VIDEOWALL_OFF: 171,             // [PULSE] DisplayPowerGrid.jsx - Video Wall power off
  // D172-179: Reserved



  // ── GROUP 17: Display HDMI Input Select, 2 per display (D180-191) ──
  // Mutually exclusive in the UI only — the processor sends no feedback.
  SIDE_DISPLAY_1_HDMI1: 180,      // [PULSE] DisplayPowerGrid.jsx - Side Display 1 → HDMI 1
  SIDE_DISPLAY_1_HDMI2: 181,      // [PULSE] DisplayPowerGrid.jsx - Side Display 1 → HDMI 2
  SIDE_DISPLAY_2_HDMI1: 182,      // [PULSE] DisplayPowerGrid.jsx - Side Display 2 → HDMI 1
  SIDE_DISPLAY_2_HDMI2: 183,      // [PULSE] DisplayPowerGrid.jsx - Side Display 2 → HDMI 2
  SIDE_DISPLAY_3_HDMI1: 184,      // [PULSE] DisplayPowerGrid.jsx - Side Display 3 → HDMI 1
  SIDE_DISPLAY_3_HDMI2: 185,      // [PULSE] DisplayPowerGrid.jsx - Side Display 3 → HDMI 2
  SIDE_DISPLAY_4_HDMI1: 186,      // [PULSE] DisplayPowerGrid.jsx - Side Display 4 → HDMI 1
  SIDE_DISPLAY_4_HDMI2: 187,      // [PULSE] DisplayPowerGrid.jsx - Side Display 4 → HDMI 2
  BACK_DISPLAY_HDMI1: 188,        // [PULSE] DisplayPowerGrid.jsx - 75" Back Display → HDMI 1
  BACK_DISPLAY_HDMI2: 189,        // [PULSE] DisplayPowerGrid.jsx - 75" Back Display → HDMI 2
  VIDEOWALL_HDMI1: 190,           // [PULSE] DisplayPowerGrid.jsx - Video Wall → HDMI 1
  VIDEOWALL_HDMI2: 191,           // [PULSE] DisplayPowerGrid.jsx - Video Wall → HDMI 2
  // ── GROUP 18: AV Matrix — 75" Back Display Layouts (D192-195) ──
  // Same presets as the video wall, addressed on their own joins so the two
  // surfaces never collide.
  BACK_LAYOUT_FULL: 192,          // [PULSE] AVMatrixPage.jsx - 75" Full Window layout select
  BACK_LAYOUT_DUAL: 193,          // [PULSE] AVMatrixPage.jsx - 75" Dual Window layout select
  BACK_LAYOUT_QUAD: 194,          // [PULSE] AVMatrixPage.jsx - 75" Quad Window layout select
  BACK_LAYOUT_3_RIGHT: 195,       // [PULSE] AVMatrixPage.jsx - 75" 3 Window layout select
  // D196-199: Reserved


  // ── GROUP 20: Camera Presets (D200-209) ──
  CAM_PRESET_1: 200,              // [PULSE] CameraControl.jsx - Room_View
  CAM_PRESET_2: 201,              // [PULSE] CameraControl.jsx - Front_cameras
  CAM_PRESET_3: 202,              // [PULSE] CameraControl.jsx - Sightline
  CAM_PRESET_4: 203,              // [PULSE] CameraControl.jsx - Sightline_AI
  CAM_PRESET_5: 204,              // [PULSE] CameraControl.jsx - SightlineAI_PIP
  CAM_PRESET_6: 205,              // [PULSE] CameraControl.jsx - SightlineAI_Conv
  CAM_PRESET_7: 206,              // [PULSE] CameraControl.jsx - Training_room
  CAM_PRESET_8: 207,              // [PULSE] CameraControl.jsx - Training Room_Conv
  CAM_PRESET_9: 208,              // [PULSE] CameraControl.jsx - Preset 9
  // D209: Reserved


  // ── GROUP 21: Camera Wake/Sleep + Global Display Power (D210-219) ──
  CAM_WAKE: 210,                  // [PULSE] CameraControl.jsx - Camera wake (exclusive with sleep, UI-side)
  CAM_SLEEP: 211,                 // [PULSE] CameraControl.jsx - Camera sleep
  GLOBAL_DISPLAY_ON: 212,         // [PULSE] GlobalDisplayControl.jsx - All displays on (backend fans out)
  GLOBAL_DISPLAY_OFF: 213,        // [PULSE] GlobalDisplayControl.jsx - All displays off
  // D214-219: Reserved
};



// ============================================
// ANALOG JOINS (200–299)
// ============================================
export const ANALOG_JOINS = {
  // ── GROUP 1: Speaker / Mic — Combined Room (A200-209) ──
  MIC_MASTER: 200,                // [ANALOG 0/1] SpeakerControl.jsx - Master mic (1=all on, 0=all off)
  SPEAKER_VOLUME: 201,            // [ANALOG 0-100%] SpeakerControl.jsx - Master volume level
  SPEAKER_ON_OFF_ANALOG: 202,     // [ANALOG 0/1] SpeakerControl.jsx - Speaker power (1=on, 0=off)
  // A203-209: Reserved



  // ── GROUP 2: Audio Channels — Audio Controls Page, 5 channels (A210-219) ──
  CEILING_BR_VOLUME: 210,         // [ANALOG 0-100%] MicChannel.jsx - Ceiling BR volume
  CEILING_BR_ON_OFF_ANALOG: 211,  // [ANALOG 0/1] MicChannel.jsx - Ceiling BR (1=on, 0=muted)
  CEILING_TR_VOLUME: 212,         // [ANALOG 0-100%] MicChannel.jsx - Ceiling TR volume
  CEILING_TR_ON_OFF_ANALOG: 213,  // [ANALOG 0/1] MicChannel.jsx - Ceiling TR (1=on, 0=muted)
  PROGRAM_AUDIO_VOLUME: 214,      // [ANALOG 0-100%] MicChannel.jsx - Program Audio volume
  PROGRAM_AUDIO_ON_OFF_ANALOG: 215, // [ANALOG 0/1] MicChannel.jsx - Program Audio (1=on, 0=muted)
  VC_IN_VOLUME: 216,              // [ANALOG 0-100%] MicChannel.jsx - VC In volume
  VC_IN_ON_OFF_ANALOG: 217,       // [ANALOG 0/1] MicChannel.jsx - VC In (1=on, 0=muted)
  VC_OUT_VOLUME: 218,             // [ANALOG 0-100%] MicChannel.jsx - VC Out volume
  VC_OUT_ON_OFF_ANALOG: 219,      // [ANALOG 0/1] MicChannel.jsx - VC Out (1=on, 0=muted)



  // ── GROUP 3: Aircon Temperature & Power (A220-229) ──
  AIRCON_TEMP: 220,               // [ANALOG 16-30] AirconControl.jsx - Room temperature (16-30°C)
  AC_ON_OFF_ANALOG: 222,          // [ANALOG 0/1] AirconControl.jsx - AC power (1=on, 0=off)
  MIC_MASTER_MANUAL: 224,         // [ANALOG 0/1] SpeakerControl.jsx - Master mic manual button press (1=on, 0=off)
  // A221, A223, A225-229: Reserved (Boardroom/Training Room AC — single-room UI, unused)



  // ── GROUP 4: Lighting Brightness (A230-239) ──
  LIGHTS_BRIGHTNESS: 230,         // [ANALOG 0-100%] LightingControl.jsx - Light brightness level
  // A231-239: Reserved



  // ── GROUP 5: Voice Lift (A240-249) ──
  VOICE_LIFT: 240,                // [ANALOG 0/1] Navbar.jsx - Voice Lift (1=on, 0=off)
  // A241-299: Reserved
};



// ============================================
// LIGHTING PRESET BRIGHTNESS VALUES
// Single source of truth — used by LightingPresetsCompact, LightingControl, LightingBoardroom
// ============================================
export const PRESET_BRIGHTNESS = {
  welcome: 75,
  presentation: 50,
  videoConf: 100,
  meeting: 60,
  allOff: 0,
};



// ============================================
// SERIAL JOINS (300–399)
// ============================================
export const SERIAL_JOINS = {
  // ── GROUP 1: AV Matrix (S300-309) ──
  AVMATRIX_ROUTING: 300,          // [SERIAL] AVMatrixPage.jsx, SourceSelection.jsx - Direct display routing. Format: "input:output" e.g. "1:2", clear: "0:2"
  AVMATRIX_LAYOUT_ROUTING: 301,   // [SERIAL] AVMatrixPage.jsx - Video Wall zone routing. Format: "input:layout:zone" e.g. "1:2:3", clear: "0:2:3"
  AVMATRIX_BACK_LAYOUT_ROUTING: 302, // [SERIAL] AVMatrixPage.jsx - 75" Back Display zone routing. Same format as S301
  // S303-309: Reserved



  // ── GROUP 2: Device Status (S310-319) ──
  DEVICE_STATUS_LIST: 310,            // [SERIAL] SettingsPage.jsx - Receive JSON device list
  // S311-319: Reserved



  // ── GROUP 3: Cafe Order (S320-329) ──
  CAFE_ORDER_LIST: 320,           // [SERIAL] CafePage.jsx - Format: "Tea,2|Coffee,3|Sandwich,1"
  CAFE_ORDER_STATUS: 321,         // [SERIAL] OrderListModal.jsx - Format: "orderId:status" e.g. "1:1"=complete, "1:0"=cancel
  CAFE_ORDER_ACK: 322,            // [SERIAL] OrderListener.jsx - ACK from backend: "1"=completed, "0"=cancelled
  // S323-329: Reserved



  // S330-399: Reserved (mic channels now use analog joins A210-219)
};
