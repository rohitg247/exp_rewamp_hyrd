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
  // ── GROUP 1: Room Mode & System Control (D1-9) ──
  ROOM_MODE_COMBINED: 1,          // [PULSE] RoomModeListener.jsx - Backend pulse → Navigate to Combined Room
  ROOM_MODE_BOARDROOM: 2,         // [PULSE] RoomModeListener.jsx - Backend pulse → Navigate to Boardroom
  SYSTEM_STARTUP_COMBINED: 3,     // [PULSE] LandingPage.jsx - Send pulse on Combined Room startup
  SYSTEM_STARTUP_BOARDROOM: 4,    // [PULSE] LandingPage.jsx - Send pulse on Boardroom startup
  SYSTEM_SHUTDOWN_COMBINED: 5,    // [PULSE] ShutdownModal.jsx - Send pulse on Combined Room shutdown
  SYSTEM_SHUTDOWN_BOARDROOM: 6,   // [PULSE] ShutdownModal.jsx - Send pulse on Boardroom shutdown
  BACKEND_SHUTDOWN_COMBINED: 7,   // [FEEDBACK] App.jsx - Backend-triggered combined room shutdown
  BACKEND_SHUTDOWN_BOARDROOM: 8,  // [FEEDBACK] App.jsx - Backend-triggered boardroom shutdown
  // D9: Reserved



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



  // ── GROUP 6: Display 3 — Boardroom Display (D50-59) ──
  DISPLAY3_ON: 50,                // [PULSE] DisplayPowerControl.jsx - Display 3 power on
  DISPLAY3_OFF: 51,               // [PULSE] DisplayPowerControl.jsx - Display 3 power off
  // D52-59: Reserved



  // ── GROUP 7: Device Status (D60-69) ──
  DEVICE_STATUS_REFRESH: 60,          // [PULSE] DeviceStatusPage.jsx - Refresh device status (Combined)
  DEVICE_STATUS_REFRESH_BOARDROOM: 61, // [PULSE] SettingsPage.jsx (Boardroom) - Refresh boardroom device status
  // D62-69: Reserved



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



  // ── GROUP 10: Drapes Controls (D90-109) ──
  DRAPES_UP: 90,                  // [PULSE] DrapesControlDevice.jsx - All drapes up
  DRAPES_STOP: 91,                // [PULSE] DrapesControlDevice.jsx - All drapes stop
  DRAPES_DOWN: 92,                // [PULSE] DrapesControlDevice.jsx - All drapes down

  DRAPES_LEFT_UP: 93,             // [PULSE] DrapesControlDevice.jsx - Left drapes up
  DRAPES_LEFT_STOP: 94,           // [PULSE] DrapesControlDevice.jsx - Left drapes stop
  DRAPES_LEFT_DOWN: 95,           // [PULSE] DrapesControlDevice.jsx - Left drapes down

  DRAPES_CENTER_UP: 96,           // [PULSE] DrapesControlDevice.jsx - Center drapes up
  DRAPES_CENTER_STOP: 97,         // [PULSE] DrapesControlDevice.jsx - Center drapes stop
  DRAPES_CENTER_DOWN: 98,         // [PULSE] DrapesControlDevice.jsx - Center drapes down

  DRAPES_RIGHT_UP: 99,            // [PULSE] DrapesControlDevice.jsx - Right drapes up
  DRAPES_RIGHT_STOP: 100,         // [PULSE] DrapesControlDevice.jsx - Right drapes stop
  DRAPES_RIGHT_DOWN: 101,         // [PULSE] DrapesControlDevice.jsx - Right drapes down
  // D102-109: Reserved



  // ── GROUP 11: Boardroom Source Selection (D110-119) ──
  BOARDROOM_SOURCE_LOCAL: 110,    // [PULSE] BoardroomSourceSelection.jsx - Wireless source
  BOARDROOM_SOURCE_VC: 111,       // [PULSE] BoardroomSourceSelection.jsx - Zoom source
  VC_START_SHARE: 112,            // [PULSE] BoardroomSourceSelection.jsx - Start video call content share
  VC_STOP_SHARE: 113,             // [PULSE] BoardroomSourceSelection.jsx - Stop video call content share
  // D114-119: Reserved



  // ── GROUP 12: Cafe Orders (D120-129) ──
  // ORDER_COMPLETE: 120,            // [PULSE] OrderListModal.jsx - Order complete
  // ORDER_CANCEL: 121,              // [PULSE] OrderListModal.jsx - Order cancel
  // D122-129: Reserved



  // ── GROUP 13: System Heartbeat (D130-139) ──
  SYSTEM_HEARTBEAT_SEND: 130,     // [PULSE] ProcessorConnectionContext.jsx - Frontend sends pulse every 10s
  SYSTEM_HEARTBEAT_RECEIVE: 131,  // [FEEDBACK] ProcessorConnectionContext.jsx - Backend response pulse
  CAFE_ORDER_COMPLETE: 132,       // [FEEDBACK] OrderListener.jsx - Processor pulses when order completed
  CAFE_ORDER_CANCEL: 133,         // [FEEDBACK] OrderListener.jsx - Processor pulses when order cancelled
  DISABLE_VIDEO_CALL: 134,  // [FEEDBACK] BoardroomSourceSelection.jsx - Processor disables VC button
  ENABLE_VIDEO_CALL: 135,   // [FEEDBACK] BoardroomSourceSelection.jsx - Processor re-enables VC button
  // D136-139: Reserved

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
  PRES_LAYOUT_DISCUSSION: 150,    // [PULSE] AVMatrixPage.jsx - Discussion Mode layout select
  PRES_LAYOUT_FULL: 151,          // [PULSE] AVMatrixPage.jsx - Full Window layout select
  PRES_LAYOUT_CENTER: 152,        // [PULSE] AVMatrixPage.jsx - Center Window layout select
  PRES_LAYOUT_DUAL: 153,          // [PULSE] AVMatrixPage.jsx - Dual Window layout select
  PRES_LAYOUT_3_RIGHT: 154,       // [PULSE] AVMatrixPage.jsx - 3 Window (asymmetric left grid) layout select
  PRES_LAYOUT_3_LEFT: 155,        // [PULSE] AVMatrixPage.jsx - 3 Window (asymmetric right grid) layout select
  // D156-199: Reserved
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



  // ── GROUP 2: Speaker / Mic — Boardroom (A210-219) ──
  SPEAKER_VOLUME_BOARDROOM: 210,  // [ANALOG 0-100%] SpeakerControlBoardroom.jsx - Boardroom volume level
  MIC_BOARDROOM: 211,             // [ANALOG 0/1] SpeakerControlBoardroom.jsx - Boardroom mic (1=on, 0=off)
  SPEAKER_ON_OFF_BOARDROOM_ANALOG: 212, // [ANALOG 0/1] SpeakerControlBoardroom.jsx - Speaker power (1=on, 0=off)
  // A213-219: Reserved



  // ── GROUP 3: Aircon Temperature & Power (A220-229) ──
  AIRCON_TEMP: 220,               // [ANALOG 16-30] AirconControl.jsx - Combined Room temperature (16-30°C)
  AIRCON_TEMP_BOARDROOM: 221,     // [ANALOG 16-30] AirconControlBoardroom.jsx - Boardroom temperature (16-30°C)
  AC_ON_OFF_ANALOG: 222,          // [ANALOG 0/1] AirconControl.jsx - AC power (1=on, 0=off)
  AC_ON_OFF_BOARDROOM_ANALOG: 223,// [ANALOG 0/1] AirconControlBoardroom.jsx - Boardroom AC power (1=on, 0=off)
  MIC_MASTER_MANUAL: 224,         // [ANALOG 0/1] SpeakerControl.jsx - Master mic manual button press (1=on, 0=off)
  AC_ON_OFF_TRAINING_ANALOG: 510, // [ANALOG 0/1] AirconControlTrainingRoom.jsx - Training Room AC power (1=on, 0=off)
  AIRCON_TEMP_TRAINING: 511,      // [ANALOG 16-30] AirconControlTrainingRoom.jsx - Training Room temperature (16-30°C)
  // A227-229: Reserved



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
  DEVICE_STATUS_LIST: 310,            // [SERIAL] SettingsPage.jsx - Receive JSON device list (Combined)
  DEVICE_STATUS_LIST_BOARDROOM: 311,  // [SERIAL] SettingsPage.jsx (Boardroom) - Receive JSON device list (Boardroom)
  // S312-319: Reserved



  // ── GROUP 3: Cafe Order (S320-329) ──
  CAFE_ORDER_LIST: 320,           // [SERIAL] CafePage.jsx - Format: "Tea,2|Coffee,3|Sandwich,1"
  CAFE_ORDER_STATUS: 321,         // [SERIAL] OrderListModal.jsx - Format: "orderId:status" e.g. "1:1"=complete, "1:0"=cancel
  CAFE_ORDER_ACK: 322,            // [SERIAL] OrderListener.jsx - ACK from backend: "1"=completed, "0"=cancelled
  // S323-329: Reserved



  // ── GROUP 4: Mic Channel Data (S330-339) ──
  MIC_CHANNEL_DATA: 330,          // [SERIAL JSON] MicChannel.jsx - Format: {"id":1,"value":45,"muted":0}
  // S331-399: Reserved

  // ── GROUP 5: AC Status (S340-349) ──
  AC_STATUS_FEEDBACK: 340,        // [SERIAL] AcStatusListener.jsx - Format: "1,0" (index0=boardroom, index1=training room) 1=on 0=off
};
