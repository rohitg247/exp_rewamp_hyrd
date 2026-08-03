// src/components/layout/Navbar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Power, Info, Network, Volume2, Coffee, Settings,
  Sun, Moon, Palette, ArrowLeftRight, Radio, Thermometer,
} from "lucide-react";
import Button from "../ui/Button";
import Logo from "../../assets/images/Actis_logo.jpg";
import WhiteLogo from "../../assets/images/White_logo.png";
import SystemInfoModal from "../modals/SystemInfoModal";
import ColorPickerModal from "../modals/ColorPickerModal";
// import ACControlModal from "../modals/ACControlModal";
import { useAnalogJoin } from "../../hooks/useJoin";
import { ANALOG_JOINS } from "../../crestron/joins";
import { safeSessionStorage } from "../../utils/safeStorage";
import { useTheme } from "../../context/ThemeContext";


const Navbar = ({ onShutdown }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isACModalOpen, setIsACModalOpen] = useState(false);

  const scrollContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const logoHoldTimerRef = useRef(null);
  const logoLongPressTriggeredRef = useRef(false);

  const { isDarkMode, toggleDarkMode } = useTheme();

  const savedVoiceLift = parseInt(safeSessionStorage.getItem('navbarVoiceLift') || '0', 10);
  const [voiceLiftValue, setVoiceLift] = useAnalogJoin(ANALOG_JOINS.VOICE_LIFT, savedVoiceLift);
  const voiceLiftOn = voiceLiftValue === 1;

  const isAVMatrixPage      = location.pathname === "/av-matrix";
  const isAudioControlsPage = location.pathname === "/audio-controls";
  const isCafePage          = location.pathname === "/cafe";
  const isRoomControlsPage  = location.pathname === "/room-controls";
  const isSettingsPage      = location.pathname === "/settings";

  const clearLogoHoldTimer = () => {
    if (logoHoldTimerRef.current) {
      clearTimeout(logoHoldTimerRef.current);
      logoHoldTimerRef.current = null;
    }
  };

  const handleLogoPressStart = () => {
    logoLongPressTriggeredRef.current = false;
    clearLogoHoldTimer();
    logoHoldTimerRef.current = setTimeout(() => {
      logoLongPressTriggeredRef.current = true;
      navigate("/engineering");
    }, 2000);
  };

  const handleLogoPressEnd = () => clearLogoHoldTimer();

  const handleLogoClick = () => {
    if (logoLongPressTriggeredRef.current) {
      logoLongPressTriggeredRef.current = false;
      return;
    }
    navigate("/main-page");
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1000);
    };
    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const checkOverflow = () => setHasOverflow(container.scrollWidth > container.clientWidth);
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    const timeoutId = setTimeout(checkOverflow, 100);
    return () => {
      window.removeEventListener("resize", checkOverflow);
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  useEffect(() => () => clearLogoHoldTimer(), []);

  const handleWheel = (event) => {
    if (event.deltaY !== 0 && scrollContainerRef.current) {
      event.preventDefault();
      scrollContainerRef.current.scrollLeft += event.deltaY;
    }
  };

  const handleVoiceLiftToggle = () => {
    const newVal = voiceLiftOn ? 0 : 1;
    setVoiceLift(newVal);
    safeSessionStorage.setItem('navbarVoiceLift', String(newVal));
    console.log(`📢 Voice Lift ${newVal === 1 ? "ENABLED (1)" : "DISABLED (0)"} (Analog Join: ${ANALOG_JOINS.VOICE_LIFT})`);
  };

  const renderNavButtons = () => {
    return (
      <>
        <Button
          variant={isAVMatrixPage ? "primary" : "secondary"}
          size="touchPanel"
          onClick={() => navigate("/av-matrix")}
          className="flex items-center space-x-2 touchPanel:space-x-2 touchPanel:px-5 touchPanel:py-4 whitespace-nowrap flex-shrink-0"
        >
          <Network className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6 flex-shrink-0" />
          <span className="touchPanel:text-xl">AV Matrix</span>
        </Button>

        <Button
          variant={isAudioControlsPage ? "primary" : "secondary"}
          size="touchPanel"
          onClick={() => navigate("/audio-controls")}
          className="flex items-center space-x-2 touchPanel:space-x-2 touchPanel:px-5 touchPanel:py-4 whitespace-nowrap flex-shrink-0"
        >
          <Volume2 className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6 flex-shrink-0" />
          <span className="touchPanel:text-xl">Audio</span>
        </Button>

        <Button
          variant={isCafePage ? "primary" : "secondary"}
          size="touchPanel"
          onClick={() => navigate("/cafe")}
          className="flex items-center space-x-2 touchPanel:space-x-2 touchPanel:px-5 touchPanel:py-4 whitespace-nowrap flex-shrink-0"
        >
          <Coffee className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6 flex-shrink-0" />
          <span className="touchPanel:text-xl">Cafe</span>
        </Button>

        <Button
          variant={isRoomControlsPage ? "primary" : "secondary"}
          size="touchPanel"
          onClick={() => navigate("/room-controls")}
          className="flex items-center space-x-2 touchPanel:space-x-2 touchPanel:px-5 touchPanel:py-4 whitespace-nowrap flex-shrink-0"
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6 flex-shrink-0" />
          <span className="touchPanel:text-xl">Room Controls</span>
        </Button>

        <Button
          variant={voiceLiftOn ? "success" : "secondary"}
          size="touchPanel"
          onClick={handleVoiceLiftToggle}
          className="flex items-center space-x-2 touchPanel:space-x-2 touchPanel:px-5 touchPanel:py-4 whitespace-nowrap flex-shrink-0"
        >
          <Radio className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6 flex-shrink-0" />
          <span className="touchPanel:text-xl">Voice Lift</span>
        </Button>
      </>
    );
  };

  return (
    <>
      <nav
        className="relative z-20 px-6 touchPanel:px-8 py-3 touchPanel:py-4
                      grid grid-cols-[auto_1fr_auto] items-center gap-4 touchPanel:gap-6
                      min-h-[72px] touchPanel:min-h-[110px] [&_*]:!transition-none
                      [&_button]:!shadow-nav-button"
        style={{
          // 2026-08-03 revamp: overlay glass. This is one of the few surfaces
          // that gets a REAL backdrop-filter (there is only ever one navbar),
          // so the gradient mesh behind it blurs through instead of the bar
          // sitting on the page as a flat slab.
          // Colour is inline, not `bg-[var(--...)]` — bracket colours are
          // unreliable on the TSW-1070 (Docs/crestron-panel-safe-css.md).
          backgroundColor: "var(--overlay-glass)",
          backdropFilter: "blur(var(--overlay-blur)) saturate(140%)",
          WebkitBackdropFilter: "blur(var(--overlay-blur)) saturate(140%)",
          // Soft drop shadow only — same elevated separation on laptop and panel,
          // no border line. Raise the 0.45 alpha for a stronger shadow, lower it for softer.
          // The inset line is the specular top edge that sells the glass.
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 14px -2px rgba(0,0,0,0.45)",
        }}
      >

        {/* LEFT: Logo */}
        <div className="flex justify-start flex-shrink-0">
          <img
            src={isDarkMode ? WhiteLogo : Logo}
            alt="Logo"
            className="h-12 touchPanel:h-18 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
            onMouseDown={handleLogoPressStart}
            onMouseUp={handleLogoPressEnd}
            onMouseLeave={handleLogoPressEnd}
            onTouchStart={handleLogoPressStart}
            onTouchEnd={handleLogoPressEnd}
            onTouchCancel={handleLogoPressEnd}
          />
        </div>

        {/* CENTER: Main Page nav */}
        <div className="flex justify-center items-center overflow-hidden min-w-0">
          <div className="relative w-full">
            <div
              ref={scrollContainerRef}
              onWheel={handleWheel}
              className={`flex space-x-3 touchPanel:space-x-6 w-full
                          overflow-x-scroll overflow-y-hidden px-2 no-scrollbar
                          ${hasOverflow ? "justify-start" : "justify-center"}
                          transition-all duration-300`}
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {renderNavButtons()}
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 transition-opacity duration-300 hidden md:block touchPanel:hidden ${
              isScrolling ? "opacity-100" : "opacity-0"
            }`} />
          </div>
        </div>

        {/* RIGHT: Controls */}
        <div className="flex items-center justify-end space-x-2 touchPanel:space-x-2 flex-shrink-0">

          {/* Main Page — Settings button */}
          <Button
            variant={isSettingsPage ? "primary" : "secondary"}
            size="touchPanel"
            onClick={() => navigate("/settings")}
            className="flex items-center space-x-2 touchPanel:space-x-2 touchPanel:px-5 touchPanel:py-4"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6" />
          </Button>

          {/* Theme Controls — Settings page only */}
          {isSettingsPage && (
            <>
              <Button
                variant="secondary"
                size="touchPanel"
                onClick={toggleDarkMode}
                className="flex items-center space-x-2 touchPanel:space-x-2 touchPanel:px-5 touchPanel:py-4"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode
                  ? <Sun className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6" />
                  : <Moon className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6" />
                }
              </Button>

              <Button
                variant="secondary"
                size="touchPanel"
                onClick={() => setIsColorPickerOpen(true)}
                className="flex items-center space-x-2 touchPanel:space-x-2 touchPanel:px-5 touchPanel:py-4"
                title="Custom Theme Color"
                aria-label="Custom Theme Color"
              >
                <Palette className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6" />
              </Button>
            </>
          )}

          {/* Info */}
          <Button
            variant="secondary"
            size="touchPanel"
            onClick={() => setIsInfoModalOpen(true)}
            className="flex items-center space-x-2 touchPanel:space-x-2 touchPanel:px-5 touchPanel:py-4"
            title="System Information"
            aria-label="System Information"
          >
            <Info className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6" />
          </Button>

          {/* Shutdown */}
          <Button
            variant="danger"
            size="touchPanel"
            onClick={onShutdown}
            className="flex items-center space-x-2 touchPanel:space-x-2 touchPanel:px-5 touchPanel:py-4"
          >
            <Power className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6" />
            <span className="touchPanel:text-xl">Shutdown</span>
          </Button>
        </div>
      </nav>

      <SystemInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
      <ColorPickerModal isOpen={isColorPickerOpen} onClose={() => setIsColorPickerOpen(false)} />
      {/* <ACControlModal isOpen={isACModalOpen} onClose={() => setIsACModalOpen(false)} /> */}
    </>
  );
};

export default Navbar;