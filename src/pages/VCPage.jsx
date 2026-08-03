import { useEffect, useState } from 'react';
import { Mic, MicOff, ArrowLeft } from 'lucide-react';
import { useDigitalJoin, useAnalogJoin } from '../hooks/useJoin';
import { DIGITAL_JOINS, ANALOG_JOINS } from '../crestron/joins';
import { useCall } from '../context/CallContext';
import { safeSessionStorage } from '../utils/safeStorage';
import VCLeftSidebar from '../components/vc/VCLeftSidebar';
import VCLayoutModal from '../components/vc/VCLayoutModal';
import VCContentModal from '../components/vc/VCContentModal';
import VCCameraControlsModal from '../components/vc/VCCameraControlsModal';
import VCLightingControlsModal from '../components/vc/VCLightingControlsModal';
import VCAudioModal from '../components/vc/VCAudioModal';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DPad from '../components/ui/DPad';
import Dialer from '../components/ui/Dialer';

const pulse = (setFn) => {
  setFn(true);
  setTimeout(() => setFn(false), 100);
};

const VCPage = () => {
  const { outgoingCall, incomingVCCall, formatTime } = useCall();

  const [micMuted, setMicMutedState] = useState(
    () => safeSessionStorage.getItem('vcMicMuted') === '1'
  );
  const [privacyOn, setPrivacyOnState] = useState(
    () => safeSessionStorage.getItem('vcPrivacyOn') === '1'
  );
  const [selectedCodec, setSelectedCodec] = useState(
    () => safeSessionStorage.getItem('vcSelectedCodec') || null
  );
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isLightingModalOpen, setIsLightingModalOpen] = useState(false);
  const [isVCAudioModalOpen, setIsVCAudioModalOpen] = useState(false);

  const [vcLayout, setVcLayout] = useState(
    () => safeSessionStorage.getItem('vcSelectedLayout') || null
  );
  const [contentSelectedSource, setContentSelectedSource] = useState(
    () => safeSessionStorage.getItem('vcContentSelectedSource') || ''
  );

  useEffect(() => {
    if (vcLayout) safeSessionStorage.setItem('vcSelectedLayout', vcLayout);
    else safeSessionStorage.removeItem('vcSelectedLayout');
  }, [vcLayout]);

  useEffect(() => {
    safeSessionStorage.setItem('vcContentSelectedSource', contentSelectedSource);
  }, [contentSelectedSource]);

  const [, , setPageLoad] = useDigitalJoin(DIGITAL_JOINS.VC_PAGE_LOAD);
  const [, , setCodec1] = useDigitalJoin(DIGITAL_JOINS.VC_CODEC_1);
  const [, , setCodec2] = useDigitalJoin(DIGITAL_JOINS.VC_CODEC_2);
  const [, , setDpadUp] = useDigitalJoin(DIGITAL_JOINS.VC_DPAD_UP);
  const [, , setDpadDown] = useDigitalJoin(DIGITAL_JOINS.VC_DPAD_DOWN);
  const [, , setDpadLeft] = useDigitalJoin(DIGITAL_JOINS.VC_DPAD_LEFT);
  const [, , setDpadRight] = useDigitalJoin(DIGITAL_JOINS.VC_DPAD_RIGHT);
  const [, , setDpadSelect] = useDigitalJoin(DIGITAL_JOINS.VC_DPAD_SELECT);
  const [, , setLayoutCycle] = useDigitalJoin(DIGITAL_JOINS.VC_WEBEX_LAYOUT_CYCLE);
  const [, , setMenu] = useDigitalJoin(DIGITAL_JOINS.VC_MENU);
  const [, , setBack] = useDigitalJoin(DIGITAL_JOINS.VC_BACK);
  const [, , setWebexMute] = useDigitalJoin(DIGITAL_JOINS.VC_WEBEX_MUTE);

  const [, setMicMuteAnalog] = useAnalogJoin(ANALOG_JOINS.VC_MIC_MUTE_ONOFF, micMuted ? 1 : 0);
  const [, setPrivacyAnalog] = useAnalogJoin(ANALOG_JOINS.VC_PRIVACY_ONOFF, privacyOn ? 1 : 0);

  useEffect(() => {
    setPageLoad(true);
    setTimeout(() => setPageLoad(false), 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-sync processor on mount
  useEffect(() => {
    setMicMuteAnalog(micMuted ? 1 : 0);
    setPrivacyAnalog(privacyOn ? 1 : 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dpadJoins = {
    up: setDpadUp,
    down: setDpadDown,
    left: setDpadLeft,
    right: setDpadRight,
  };

  const handleMicMute = () => {
    const next = !micMuted;
    setMicMutedState(next);
    safeSessionStorage.setItem('vcMicMuted', next ? '1' : '0');
    setMicMuteAnalog(next ? 1 : 0);
  };

  const handleTogglePrivacy = () => {
    const next = !privacyOn;
    setPrivacyOnState(next);
    safeSessionStorage.setItem('vcPrivacyOn', next ? '1' : '0');
    setPrivacyAnalog(next ? 1 : 0);
  };

  return (
    <div className="flex h-full w-full">
      <VCLeftSidebar
        selectedLayout={vcLayout}
        selectedContentSource={contentSelectedSource}
        onOpenLayoutModal={() => setIsLayoutModalOpen(true)}
        onOpenContentModal={() => setIsContentModalOpen(true)}
        onOpenCameraModal={() => setIsCameraModalOpen(true)}
        onOpenLightingModal={() => setIsLightingModalOpen(true)}
        onOpenAudioModal={() => setIsVCAudioModalOpen(true)}
        onStopContent={() => setContentSelectedSource('')}
      />

      <div className="flex flex-1 min-w-0 h-full p-6 overflow-hidden">
        <div
          className="flex h-full w-full gap-4 overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <Card
            className="basis-[40%] max-w-[40%] min-w-0 flex flex-col overflow-hidden p-4"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <span className="text-sm font-bold text-heading flex-shrink-0 mb-3">
              Controls
            </span>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                <Button
                  variant={selectedCodec === 'codec1' ? 'gradient' : 'secondary'}
                  size="md"
                  onClick={() => {
                    if (selectedCodec !== 'codec1') {
                      setSelectedCodec('codec1');
                      safeSessionStorage.setItem('vcSelectedCodec', 'codec1');
                      pulse(setCodec1);
                    } else {
                      setSelectedCodec(null);
                      safeSessionStorage.removeItem('vcSelectedCodec');
                    }
                  }}
                  className="py-3 text-sm font-semibold"
                >
                  Codec 1
                </Button>

                <Button
                  variant={selectedCodec === 'codec2' ? 'gradient' : 'secondary'}
                  size="md"
                  onClick={() => {
                    if (selectedCodec !== 'codec2') {
                      setSelectedCodec('codec2');
                      safeSessionStorage.setItem('vcSelectedCodec', 'codec2');
                      pulse(setCodec2);
                    } else {
                      setSelectedCodec(null);
                      safeSessionStorage.removeItem('vcSelectedCodec');
                    }
                  }}
                  className="py-3 text-sm font-semibold"
                >
                  Codec 2
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 flex-shrink-0 mt-4">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => pulse(setBack)}
                  className="h-11 flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => pulse(setWebexMute)}
                  className="h-11 flex items-center justify-center text-xs font-semibold whitespace-nowrap"
                >
                  Webex Mute/Unmute
                </Button>
              </div>

              <div className="flex-1 flex items-center justify-center min-h-0">
                <DPad
                  onDirectionPress={(dir) => pulse(dpadJoins[dir])}
                  onCenterPress={() => pulse(setDpadSelect)}
                />
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button
                  variant={micMuted ? 'danger' : 'success'}
                  size="md"
                  onClick={handleMicMute}
                  className="h-11 flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  {micMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  <span>Mic</span>
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => pulse(setLayoutCycle)}
                  className="h-11 flex items-center justify-center text-sm font-semibold"
                >
                  Layout
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => pulse(setMenu)}
                  className="h-11 flex items-center justify-center text-sm font-semibold"
                >
                  Menu
                </Button>

                <Button
                  variant={privacyOn ? 'primary' : 'secondary'}
                  size="md"
                  onClick={handleTogglePrivacy}
                  className="h-11 flex items-center justify-center text-sm font-semibold"
                >
                  Privacy
                </Button>
              </div>

              {/* {(outgoingCall.isActive || incomingVCCall.isActive) && (
                <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-4">
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--color-text-light)' }}
                  >
                    {incomingVCCall.isActive
                      ? 'Incoming Call Active'
                      : 'Video Call Active'}
                  </span>

                  <span
                    className="text-2xl font-bold"
                    style={{ color: 'var(--color-success)' }}
                  >
                    {formatTime(
                      incomingVCCall.isActive
                        ? incomingVCCall.duration
                        : outgoingCall.duration
                    )}
                  </span>
                </div>
              )} */}
            </div>
          </Card>

          <Card
            className="basis-[60%] max-w-[60%] min-w-0 flex flex-col overflow-hidden p-4"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Dialer />
          </Card>
        </div>
      </div>

      <VCLayoutModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        selectedLayout={vcLayout}
        onSelectLayout={setVcLayout}
      />

      <VCContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        selectedSource={contentSelectedSource}
        onSelectedSourceChange={setContentSelectedSource}
      />

      <VCCameraControlsModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
      />

      <VCLightingControlsModal
        isOpen={isLightingModalOpen}
        onClose={() => setIsLightingModalOpen(false)}
      />

      <VCAudioModal
        isOpen={isVCAudioModalOpen}
        onClose={() => setIsVCAudioModalOpen(false)}
      />
    </div>
  );
};

export default VCPage;