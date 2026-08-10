import { useState, useEffect } from "react";
import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import ShutdownScreen from "./components/ShutdownScreen";
import ShutdownModal from "./components/modals/ShutdownModal";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer from "./components/ui/ToastContainer";
import { AudioProvider, useAudioContext } from "./context/AudioContext";
import { ProcessorConnectionProvider } from "./context/ProcessorConnectionContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { safeLocalStorage, safeSessionStorage } from "./utils/safeStorage";
import { useDigitalJoin } from "./hooks/useJoin";
import { DIGITAL_JOINS } from "./crestron/joins";

// Import pages
import LandingPage from "./pages/LandingPage";
import MainPage from "./pages/MainPage";
import AVMatrixPage from "./pages/AVMatrixPage";
import AudioControlsPage from "./pages/AudioControlsPage";
import CafePage from "./pages/CafePage";
import RoomControlsPage from "./pages/RoomControlsPage";
import SettingsPage from "./pages/SettingsPage";
import UnderDevelopment from "./pages/UnderDevelopment";
import EngineeringPage from "./pages/EngineeringPage";
import OrderListener from "./components/OrderListener";

// ============================================
// 🎛️ SIDEBAR TOGGLE - CONFIGURE HERE
// ============================================
const SIDEBAR_ENABLED = true;

// Helper Component to manage Navbar, Sidebar, and Page Content
const ContentWrapper = ({ children, onShutdown }) => {
  const location = useLocation();

  // Navbar visibility for main app routes (not landing page)
  const showNavbar = !["/"].includes(location.pathname);

  // Sidebar only for Main Page routes
  const mainPageRoutes = [
    "/main-page",
    "/av-matrix",
    "/audio-controls",
    "/cafe",
    "/room-controls",
    "/settings",
  ];
  const showSidebar = SIDEBAR_ENABLED && mainPageRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar onShutdown={onShutdown} />}
      {/* 2026-08-06: keying on pathname remounts the subtree on every route
          change, which replays animate-page-enter. Pages used to swap with no
          transition at all. */}
      <div key={`page-${location.pathname}`} className="flex-1 overflow-hidden animate-page-enter">
        {children}
      </div>
      {/* Keyed separately from the page div above — two siblings sharing a key
          makes React omit one of them (the sidebar) and accumulate the other. */}
      {showSidebar && (
        <Sidebar key={`sidebar-${location.pathname}`} className="animate-page-enter" />
      )}
    </>
  );
};

const AppContent = () => {
  const navigate = useNavigate();
  const [showShutdown, setShowShutdown] = useState(false);
  const [showShutdownModal, setShowShutdownModal] = useState(false);

  // Backend-triggered shutdown hooks
  const { setCeiling1Muted, setCeiling2Muted, setHeadworn1Muted,
          setHeadworn2Muted, setHandheldMuted, setLapelMuted } = useAudioContext();
  const [, , sendShutdownCombined] = useDigitalJoin(DIGITAL_JOINS.SYSTEM_SHUTDOWN);

  // ============================================
  // ⌨️ THEME SWITCHING SHORTCUTS (Alt+1-4, Alt+D, Alt+Shift+T)
  // ============================================
  const { setThemeName, toggleDarkMode, themeName, isDarkMode, customColor } = useTheme();

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === '1') setThemeName('default');
      if (e.altKey && e.key === '2') setThemeName('blue-dark');
      if (e.altKey && e.key === '3') setThemeName('purple');
      if (e.altKey && e.key === '4') setThemeName('dark-blue');
      if (e.altKey && e.key === 'd') toggleDarkMode();

      // Debug mode: Alt+Shift+T
      if (e.altKey && e.shiftKey && e.key === 'T') {
        const computed = getComputedStyle(document.documentElement);
        console.log('🎨 THEME DEBUG INFO 🎨');
        console.table({
          themeName,
          isDarkMode,
          customColor,
          currentPrimary: computed.getPropertyValue('--color-primary').trim(),
          currentBg: computed.getPropertyValue('--color-bg').trim(),
          currentText: computed.getPropertyValue('--color-text').trim(),
          'data-theme': document.documentElement.getAttribute('data-theme'),
          'data-dark-mode': document.documentElement.getAttribute('data-dark-mode'),
          storedTheme: safeLocalStorage.getItem('crestron_theme_name'),
          storedDark: safeLocalStorage.getItem('crestron_dark_mode'),
          storedCustom: safeLocalStorage.getItem('crestron_custom_color'),
        });
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [setThemeName, toggleDarkMode, themeName, isDarkMode, customColor]);

  // ============================================
  // 🔴 SHUTDOWN HANDLERS
  // ============================================
  const handleShutdownClick = () => {
    setShowShutdownModal(true);
  };

  const handleShutdownConfirm = () => {
    setShowShutdownModal(false);
    setShowShutdown(true);
  };

  const handleShutdownCancel = () => {
    setShowShutdownModal(false);
  };

  const handleShutdownComplete = () => {
    setShowShutdown(false);
    navigate("/", { replace: true });
    console.log("🔄 Navigated to landing page after shutdown");
  };

  // Mirrors ShutdownModal.handleConfirm — used when backend pulses shutdown join
  const triggerBackendShutdown = () => {
    setShowShutdownModal(false);
    safeSessionStorage.clear();
    window.dispatchEvent(new Event('system-shutdown'));
    console.log(`📥 Backend shutdown triggered for: combined`);

    sendShutdownCombined(true);
    setTimeout(() => sendShutdownCombined(false), 100);

    setTimeout(() => {
      setCeiling1Muted(0); setCeiling2Muted(0); setHeadworn1Muted(0);
      setHeadworn2Muted(0); setHandheldMuted(0); setLapelMuted(0);
    }, 2000);

    setTimeout(() => setShowShutdown(true), 500);
  };

  // Direct CrComLib subscription for backend-triggered shutdown (Combined only)
  useEffect(() => {
    const cr = window.CrComLib?.CrComLib || window.CrComLib;
    if (!cr) return;

    const subCombined = cr.subscribeState('b', String(DIGITAL_JOINS.BACKEND_SHUTDOWN), (value) => {
      if (value === true) {
        console.log(`📥 BACKEND_SHUTDOWN (D${DIGITAL_JOINS.BACKEND_SHUTDOWN}) — triggering shutdown`);
        triggerBackendShutdown();
      }
    });

    return () => {
      cr.unsubscribeState('b', String(DIGITAL_JOINS.BACKEND_SHUTDOWN), subCombined);
    };
  }, []);

  return (
    <>
      {/* 🎯 GLOBAL LISTENERS */}
      <OrderListener />      

      {/* 🔔 TOAST NOTIFICATIONS */}
      <ToastContainer position="top-right" />

      <div className="h-screen w-screen overflow-hidden bg-theme-bg flex flex-col">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Main Page Routes */}
          <Route
            path="/main-page"
            element={
              <ContentWrapper onShutdown={handleShutdownClick}>
                <MainPage sidebarEnabled={SIDEBAR_ENABLED} />
              </ContentWrapper>
            }
          />
          <Route
            path="/av-matrix"
            element={
              <ContentWrapper onShutdown={handleShutdownClick}>
                <AVMatrixPage sidebarEnabled={SIDEBAR_ENABLED} />
              </ContentWrapper>
            }
          />
          <Route
            path="/audio-controls"
            element={
              <ContentWrapper onShutdown={handleShutdownClick}>
                <AudioControlsPage sidebarEnabled={SIDEBAR_ENABLED} />
              </ContentWrapper>
            }
          />
          <Route
            path="/cafe"
            element={
              <ContentWrapper onShutdown={handleShutdownClick}>
                <CafePage sidebarEnabled={SIDEBAR_ENABLED} />
              </ContentWrapper>
            }
          />

          <Route
            path="/room-controls"
            element={
              <ContentWrapper onShutdown={handleShutdownClick}>
                <RoomControlsPage sidebarEnabled={SIDEBAR_ENABLED} />
              </ContentWrapper>
            }
          />

          {/* Settings Route (Main Page only) */}
          <Route
            path="/settings"
            element={
              <ContentWrapper onShutdown={handleShutdownClick}>
                <SettingsPage sidebarEnabled={SIDEBAR_ENABLED} />
              </ContentWrapper>
            }
          />

          {/* Under Development */}
          <Route path="/under-development" element={<UnderDevelopment />} />

          {/* Engineering Page */}
          <Route path="/engineering" element={<EngineeringPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ShutdownModal
          isOpen={showShutdownModal}
          onConfirm={handleShutdownConfirm}
          onCancel={handleShutdownCancel}
        />

        <ShutdownScreen
          isVisible={showShutdown}
          onComplete={handleShutdownComplete}
        />
      </div>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ProcessorConnectionProvider>
        <ThemeProvider>
          <AudioProvider>
            <MemoryRouter initialEntries={["/"]}>
              <AppContent />
            </MemoryRouter>
          </AudioProvider>
        </ThemeProvider>
      </ProcessorConnectionProvider>
    </ErrorBoundary>
  );
}

export default App;