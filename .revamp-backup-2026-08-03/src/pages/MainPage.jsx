// src/pages/MainPage.jsx
import { Mic, Volume2, Laptop, Lightbulb, Thermometer, Blinds } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import MicrophoneControl from '../components/devices/MicrophoneControl';
import SourceSelection from '../components/devices/SourceSelection';
import LightingPresetsCompact from '../components/devices/LightingPresetsCompact';
import AirconControl from '../components/devices/AirconControl';
import DrapesQuickControl from '../components/devices/DrapesQuickControl';


const MainPage = ({ sidebarEnabled = false }) => {
  return (
    <div className="h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex overflow-hidden">
      <div className={`flex-1 p-6 touchPanel:p-8 flex h-full items-stretch gap-6 touchPanel:gap-8 overflow-hidden ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>
        {/* ✅ FIXED: Added h-full to grid */}
        <div className="grid grid-cols-3 auto-rows-fr gap-6 touchPanel:gap-8 flex-1 h-full min-h-0">


          {/* COLUMN 1: Mics (Top) + Speakers (Bottom) */}
          <div className="flex flex-col gap-6 touchPanel:gap-8 h-full min-h-0">
            {/* Row 1: Mics (50% height) */}
            <Card variant="glass" className="flex-[1] flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Mic className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" />
                  <span className="text-base md:text-lg touchPanel:text-xl">Mics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center px-4 py-4 touchPanel:px-6 touchPanel:py-6 overflow-y-auto min-h-0">
                <MicrophoneControl variant="mics" />
              </CardContent>
            </Card>

            {/* Row 2: Speakers (50% height) */}
            <Card variant="glass" className="flex-[1] flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" />
                  <span className="text-base md:text-lg touchPanel:text-xl">Speakers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center px-4 py-4 touchPanel:px-6 touchPanel:py-6 overflow-y-auto min-h-0">
                <MicrophoneControl variant="speakers" />
              </CardContent>
            </Card>
          </div>


          {/* COLUMN 2: Source Selection (Top) + Lighting Presets (Bottom) */}
          {/* ✅ FIXED: Added h-full and overflow-hidden */}
          <div className="flex flex-col gap-6 touchPanel:gap-8 h-full min-h-0">
            {/* Row 1: Source Selection (50% height) */}
            <Card variant="glass" className="flex-[1] flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Laptop className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" />
                  <span className="text-base md:text-lg touchPanel:text-xl">Source Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center px-4 py-4 touchPanel:px-6 touchPanel:py-6 overflow-y-auto touchPanel:overflow-hidden min-h-0">
                <SourceSelection />
              </CardContent>
            </Card>


            {/* Row 2: Lighting Presets (50% height) */}
            <Card variant="glass" className="flex-[1] flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Lightbulb className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" />
                  <span className="text-base md:text-lg touchPanel:text-xl">Lighting</span>
                </CardTitle>
              </CardHeader>
              {/* Row 2: Lighting Presets */}
              <CardContent className="flex-1 flex items-stretch px-4 py-4 touchPanel:px-6 touchPanel:py-4 overflow-hidden min-h-0">
                <LightingPresetsCompact />
              </CardContent>
            </Card>
          </div>


          {/* COLUMN 3: Aircon (Top) + Drapes Quick Control (Bottom) */}
          {/* ✅ FIXED: Added h-full and overflow-hidden */}
          <div className="flex flex-col gap-6 touchPanel:gap-8 h-full min-h-0">
            {/* Row 1: Aircon Control (50% height) */}
            <Card variant="glass" className="flex-[1] flex flex-col min-h-0 overflow-visible">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Thermometer className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" />
                  <span className="text-base md:text-lg touchPanel:text-xl">Climate Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center px-4 py-4 touchPanel:px-6 touchPanel:py-6 min-h-0 overflow-visible">
                  <AirconControl />
                </CardContent>
            </Card>


            {/* Row 2: Drapes Quick Control (50% height) */}
            <Card variant="glass" className="flex-[1] flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Blinds className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" />
                  <span className="text-base md:text-lg touchPanel:text-xl">Drapes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center px-4 py-4 touchPanel:px-6 touchPanel:py-6 overflow-y-auto min-h-0">
                <DrapesQuickControl />
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </div>
  );
};


export default MainPage;
