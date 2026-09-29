import { Camera } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardIcon } from '../components/ui/Card';
import DisplayPowerGrid from '../components/devices/DisplayPowerGrid';
import CameraControl from '../components/devices/CameraControl';

const ICON_CLS = 'w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7';
const LABEL_CLS = 'text-base md:text-lg touchPanel:text-xl';

const RoomControlsPage = ({ sidebarEnabled = false }) => {
  return (
    <div className="page-mesh h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex overflow-hidden">
      <div className={`flex-1 p-6 touchPanel:p-8 flex h-full items-stretch gap-6 touchPanel:gap-8 overflow-hidden ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>
        {/* ========================================
            CAMERA — 9 presets + Wake / Sleep
            ======================================== */}
        <Card variant="gradient" tone="video" className="flex-[1] flex flex-col h-full overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center justify-center space-x-2">
              <CardIcon tone="video"><Camera className={ICON_CLS} /></CardIcon>
              <span className={LABEL_CLS}>Camera Presets</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-stretch px-4 py-4 touchPanel:px-6 touchPanel:py-4 overflow-hidden min-h-0">
            <CameraControl />
          </CardContent>
        </Card>

        {/* ========================================
            DISPLAYS — one card per display, 3 x 2 (no outer wrapper card)
            ======================================== */}
        <div className="flex-[2] min-w-0 h-full">
          <DisplayPowerGrid />
        </div>
      </div>
    </div>
  );
};


export default RoomControlsPage;
