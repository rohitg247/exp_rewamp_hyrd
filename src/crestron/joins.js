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



  // ── GROUP 3: Room Layout (D20-29) ──
  ROOM_LAYOUT_TOWNHALL: 20,       // [PULSE] RoomLayoutDisplay.jsx - Townhall layout
  ROOM_LAYOUT_TRAINING: 21,       // [PULSE] RoomLayoutDisplay.jsx - Training layout
  ROOM_LAYOUT_COMBINED: 22,       // [PULSE] RoomLayoutDisplay.jsx - Combined layout
  // D23-29: Reserved



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
  SOURCE_MODE_PRESENTATION: 110,  // [PULSE] SourceSelection.jsx - Presentation mode selected
  SOURCE_MODE_BYOD: 111,          // [PULSE] SourceSelection.jsx - BYOD mode selected
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



  // D180-199: Reserved (Group 17, Main Source Selection Deselect/Blank — unused)
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



  // ── GROUP 2: Mic Channels — Audio Controls Page (A210-219) ──
  MIC1_VOLUME: 210,               // [ANALOG 0-100%] MicChannel.jsx - Ceiling Mic 1 volume
  MIC1_ON_OFF_ANALOG: 211,        // [ANALOG 0/1] MicChannel.jsx - Ceiling Mic 1 (1=on, 0=muted)
  MIC2_VOLUME: 212,               // [ANALOG 0-100%] MicChannel.jsx - Ceiling Mic 2 volume
  MIC2_ON_OFF_ANALOG: 213,        // [ANALOG 0/1] MicChannel.jsx - Ceiling Mic 2 (1=on, 0=muted)
  PROGRAM_AUDIO_VOLUME: 214,      // [ANALOG 0-100%] MicChannel.jsx - Program Audio volume
  PROGRAM_AUDIO_ON_OFF_ANALOG: 215, // [ANALOG 0/1] MicChannel.jsx - Program Audio (1=on, 0=muted)
  VC_AUDIO_VOLUME: 216,           // [ANALOG 0-100%] MicChannel.jsx - VC Audio volume
  VC_AUDIO_ON_OFF_ANALOG: 217,    // [ANALOG 0/1] MicChannel.jsx - VC Audio (1=on, 0=muted)
  // A218-219: Reserved



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
  AVMATRIX_LAYOUT_ROUTING: 301,   // [SERIAL] AVMatrixPage.jsx - Combine-layout zone routing. Format: "input:layout:zone" e.g. "1:2:3", clear: "0:2:3"
  // S302-309: Reserved



  // ── GROUP 2: Device Status (S310-319) ──
  DEVICE_STATUS_LIST: 310,            // [SERIAL] SettingsPage.jsx - Receive JSON device list
  // S311-319: Reserved



  // ── GROUP 3: Cafe Order (S320-329) ──
  CAFE_ORDER_LIST: 320,           // [SERIAL] CafePage.jsx - Format: "Tea,2|Coffee,3|Sandwich,1"
  CAFE_ORDER_STATUS: 321,         // [SERIAL] OrderListModal.jsx - Format: "orderId:status" e.g. "1:1"=complete, "1:0"=cancel
  CAFE_ORDER_ACK: 322,            // [SERIAL] OrderListener.jsx - ACK from backend: "1"=completed, "0"=cancelled
  // S323-329: Reserved



  // ── GROUP 4: Mic Channel Data (S330-339) ──
  MIC_CHANNEL_DATA: 330,          // [SERIAL JSON] MicrophoneControl.jsx, AudioControls.jsx - Format: {"id":1,"value":45,"muted":0}
  // S331-399: Reserved (Group 5, AC Status Feedback — single-room UI, unused)
};
