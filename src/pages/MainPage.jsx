// src/pages/MainPage.jsx
import { Mic, Laptop, Lightbulb, Thermometer, Monitor } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardIcon } from '../components/ui/Card';
import MicrophoneControl from '../components/devices/MicrophoneControl';
import SourceSelection from '../components/devices/SourceSelection';
import GlobalDisplayControl from '../components/devices/GlobalDisplayControl';
import LightingPresetsCompact from '../components/devices/LightingPresetsCompact';
import AirconControl from '../components/devices/AirconControl';

const ICON_CLS = 'w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7';
const LABEL_CLS = 'text-base md:text-lg touchPanel:text-xl';

const MainPage = ({ sidebarEnabled = false }) => {
  return (
    <div className="page-mesh h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex overflow-hidden">
      <div className={`flex-1 p-6 touchPanel:p-8 flex h-full items-stretch gap-6 touchPanel:gap-8 overflow-hidden ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>
        <div className="grid grid-cols-3 auto-rows-fr gap-6 touchPanel:gap-8 flex-1 h-full min-h-0">

          {/* ══════════════════════════════════════════════════════
              COLUMN 1: Mics (Top) + Global Display (Bottom)
              ══════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-6 touchPanel:gap-8 h-full min-h-0">
            {/* Mics */}
            <Card variant="gradient" tone="audio" className="flex-[1] flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <CardIcon tone="audio"><Mic className={ICON_CLS} /></CardIcon>
                  <span className={LABEL_CLS}>Mics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center px-4 py-4 touchPanel:px-6 touchPanel:py-6 overflow-y-auto min-h-0">
                <MicrophoneControl variant="mics" />
              </CardContent>
            </Card>

            {/* Global Display power — all displays on / off */}
            <Card variant="gradient" tone="video" className="flex-[1] flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <CardIcon tone="video"><Monitor className={ICON_CLS} /></CardIcon>
                  <span className={LABEL_CLS}>Global Display</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-stretch px-4 py-4 touchPanel:px-6 touchPanel:py-6 overflow-hidden min-h-0">
                <GlobalDisplayControl />
              </CardContent>
            </Card>
          </div>


          {/* ══════════════════════════════════════════════════════
              COLUMN 2: Source Selection (Top) + Lighting (Bottom)
              ══════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-6 touchPanel:gap-8 h-full min-h-0">
            {/* Row 1: Source Selection (50% height) */}
            <Card variant="gradient" tone="video" className="flex-[1] flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <CardIcon tone="video"><Laptop className={ICON_CLS} /></CardIcon>
                  <span className={LABEL_CLS}>Mode Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-stretch px-4 py-4 touchPanel:px-6 touchPanel:py-6 overflow-y-auto touchPanel:overflow-hidden min-h-0">
                <SourceSelection />
              </CardContent>
            </Card>

            {/* Row 2: Lighting Presets (50% height) */}
            <Card variant="gradient" tone="lighting" className="flex-[1] flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <CardIcon tone="lighting"><Lightbulb className={ICON_CLS} /></CardIcon>
                  <span className={LABEL_CLS}>Lighting</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-stretch px-4 py-4 touchPanel:px-6 touchPanel:py-4 overflow-hidden min-h-0">
                <LightingPresetsCompact />
              </CardContent>
            </Card>
          </div>


          {/* ══════════════════════════════════════════════════════
              COLUMN 3: Climate Control — FULL HEIGHT
              Drapes removed. AC now spans both rows for breathing room.
              ══════════════════════════════════════════════════════ */}
          <Card variant="gradient" tone="climate" className="flex flex-col min-h-0 overflow-visible h-full">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center justify-center space-x-2">
                <CardIcon tone="climate"><Thermometer className={ICON_CLS} /></CardIcon>
                <span className={LABEL_CLS}>Climate Control</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center px-4 py-4 touchPanel:px-6 touchPanel:py-6 min-h-0 overflow-visible">
              <AirconControl />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default MainPage;