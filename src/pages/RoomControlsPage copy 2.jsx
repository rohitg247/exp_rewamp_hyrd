import { Lightbulb, Monitor } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardIcon } from '../components/ui/Card';
import LightingControl from '../components/devices/LightingControl';
import DisplayPowerGrid from '../components/devices/DisplayPowerGrid';
// import DrapesControlDevice from '../components/devices/DrapesControlDevice'; // Drapes removed from this page — see commented Column 2 block below
import RoomLayoutDisplay from '../components/devices/RoomLayoutDisplay';


const RoomControlsPage = ({ sidebarEnabled = false }) => {
  return (
    <div className="page-mesh h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex overflow-hidden">
      <div className={`flex-1 p-6 touchPanel:p-8 flex h-full items-stretch gap-6 touchPanel:gap-8 overflow-hidden ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>
        {/* 3-column grid layout */}
        <div className="grid grid-cols-3 auto-rows-fr gap-6 touchPanel:gap-8 flex-1 h-full min-h-0">


          {/* ========================================
              COLUMN 1: SPLIT INTO 2 ROWS (60/40)
              Top (60%): Lighting Control
              Bottom (40%): Room Layout Display
              ======================================== */}
          <div className="flex flex-col gap-6 touchPanel:gap-8 h-full min-h-0">
            {/* Row 1: Lighting Control (60% height = flex-[3]) */}
            <Card variant="glass" tone="lighting" className="flex-[2] flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <CardIcon tone="lighting"><Lightbulb className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" /></CardIcon>
                  <span className="text-base md:text-lg touchPanel:text-xl">Lighting Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-start justify-center px-4 py-4 touchPanel:px-6 touchPanel:py-6 overflow-y-auto min-h-0">
                <LightingControl />
              </CardContent>
            </Card>


            {/* Row 2: Room Layout Display (40% height = flex-[2]) */}
            <div className="flex-[3] min-h-0">
              <RoomLayoutDisplay />
            </div>
            {/* Row 2: Room Layout Display (40% height) */}
            {/* <Card variant="glass" className="flex-[3] flex flex-col min-h-0 overflow-hidden">
              <CardContent className="flex-1 flex items-center justify-center px-4 py-4 touchPanel:px-6 touchPanel:py-6 overflow-y-auto min-h-0">
                <RoomLayoutDisplay />
              </CardContent>
            </Card> */}
          </div>


          {/* ========================================
              COLUMN 2: DRAPES CONTROL — removed from this page (see Docs/changes.md).
              Kept here commented out, not deleted, so it's easy to restore.
              ========================================
          <Card variant="glass" tone="neutral" className="flex flex-col h-full overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center justify-center space-x-2">
                <CardIcon tone="neutral"><Blinds className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" /></CardIcon>
                <span className="text-base md:text-lg touchPanel:text-xl">Drapes Control</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-start justify-center px-4 py-4 touchPanel:px-6 touchPanel:py-6 overflow-y-auto min-h-0">
              <DrapesControlDevice />
            </CardContent>
          </Card>
          */}


          {/* ========================================
              COLUMNS 2+3 MERGED: DISPLAY POWER — 6 displays
              (4x Side Display, Back Display, Video Wall — matches AVMatrixPage's
              real display targets, replacing the old 3-display / Drapes layout)
              ======================================== */}
          <Card variant="glass" tone="video" className="col-span-2 flex flex-col h-full overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center justify-center space-x-2">
                <CardIcon tone="video"><Monitor className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" /></CardIcon>
                <span className="text-base md:text-lg touchPanel:text-xl">Display Power</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-stretch px-4 py-4 touchPanel:px-6 touchPanel:py-4 overflow-hidden min-h-0">
              <DisplayPowerGrid />
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
};


export default RoomControlsPage;