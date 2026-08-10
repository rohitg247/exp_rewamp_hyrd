import { useState, useEffect, useRef } from 'react';
import { Monitor, CheckCircle, XCircle, RefreshCw, Bug, Info, Wifi } from 'lucide-react';
import { useSerialJoinCallback, useDigitalJoin } from '../hooks/useJoin';
import { SERIAL_JOINS, DIGITAL_JOINS } from '../crestron/joins';
import { useProcessorConnection } from '../context/ProcessorConnectionContext';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';

// Mock device data shown when processor is not connected

// ─────────────────────────────────────────────────────────────
// Global ACK/TCP log buffer — written by OrderListener.jsx,
// read here. Avoids prop drilling / context changes.
// Usage in OrderListener.jsx:
//   window.__ackLogs = window.__ackLogs || [];
//   window.__ackLogs.push({ time, message, type });
// ─────────────────────────────────────────────────────────────
const getAckLogs = () => window.__ackLogs || [];
const clearAckLogs = () => { window.__ackLogs = []; };

const SettingsPage = ({ sidebarEnabled = false }) => {
  const [, , sendRefreshPulse] = useDigitalJoin(DIGITAL_JOINS.DEVICE_STATUS_REFRESH);
  const [devices, setDevices] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isConnected, heartbeatLogs, clearHeartbeatLogs } = useProcessorConnection();

  const isMockData = !isConnected && devices.length === 0;
  const displayDevices = isMockData ? [] : devices;

  // 🐛 Debug state
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugTab, setDebugTab] = useState('device');
  const debugEndRef = useRef(null);

  // ── ACK tab — poll the global buffer every second when debug panel is open ──
  const [ackLogs, setAckLogs] = useState([]);
  useEffect(() => {
    if (!showDebug || debugTab !== 'ack') return;
    const poll = setInterval(() => {
      setAckLogs([...getAckLogs()]);
    }, 500);
    return () => clearInterval(poll);
  }, [showDebug, debugTab]);

  // Snapshot when tab becomes active
  useEffect(() => {
    if (debugTab === 'ack') {
      setAckLogs([...getAckLogs()]);
    }
  }, [debugTab]);

  // ── Viewport Debug Info ──
  const [, setViewportInfo] = useState({});
  useEffect(() => {
    const update = () => setViewportInfo({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      screenWidth: screen.width,
      screenHeight: screen.height,
      dpr: window.devicePixelRatio,
      bp1910: window.matchMedia('(min-width: 1910px) and (min-height: 1190px)').matches,
      bp1920: window.matchMedia('(min-width: 1920px) and (min-height: 1200px)').matches,
    });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Chunk buffering refs
  const jsonBufferRef = useRef('');
  const lastChunkRef = useRef('');
  const parseTimerRef = useRef(null);

  // Mock program info
  const [programInfo] = useState({
    loadedPath: '/SIMPL/Program1/Actis_ExperienceCenter.cpz',
    lastProgramEditor: { name: 'Keshav Gupta', email: 'Test@actis.co.in' },
    lastUIEditor: { name: 'Rohit Gupta', email: 'Test@actis.co.in' },
    uploadDate: 'March 09, 2026',
    version: 'v2.1.0'
  });

  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-50), { time: timestamp, message, type }]);
  };

  useEffect(() => {
    if (showDebug && debugEndRef.current) {
      debugEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [debugLogs, heartbeatLogs, ackLogs, showDebug]);

  useSerialJoinCallback(SERIAL_JOINS.DEVICE_STATUS_LIST, (chunk) => {
    const trimmed = chunk.trim();
    if (!trimmed || trimmed === lastChunkRef.current) return;
    lastChunkRef.current = trimmed;

    addDebugLog(`📥 Chunk: "${trimmed.substring(0, 50)}${trimmed.length > 50 ? '...' : ''}"`, 'info');
    jsonBufferRef.current += trimmed;
    addDebugLog(`📦 Buffer: ${jsonBufferRef.current.length} chars`, 'info');

    if (parseTimerRef.current) clearTimeout(parseTimerRef.current);

    parseTimerRef.current = setTimeout(() => {
      const sanitized = jsonBufferRef.current
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const jsonToParse = sanitized.startsWith('[') ? sanitized : '[' + sanitized;

      try {
        if (!sanitized.trimEnd().endsWith('}]')) throw new Error('incomplete');
        const parsed = JSON.parse(jsonToParse);
        if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('invalid or empty');
        if (parsed.length < 2) {
          addDebugLog(`⚠️ Only ${parsed.length} device parsed — waiting for full list`, 'warning');
          return;
        }
        const sorted = [...parsed].sort((a, b) => a.id - b.id);
        setDevices(sorted);
        addDebugLog(`✅ Parsed ${sorted.length} devices (IDs: ${sorted.map(d => d.id).join(', ')})`, 'success');
        jsonBufferRef.current = '';
        lastChunkRef.current = '';
      } catch {
        addDebugLog(`⏳ Incomplete (${jsonBufferRef.current.length} chars), waiting...`, 'warning');
      }
    }, 150);
  });

  const sendPulse = (setFunction, joinNumber, name) => {
    addDebugLog(`📤 Sending pulse to ${name} (Join: ${joinNumber})`, 'info');
    setFunction(true);
    setTimeout(() => {
      setFunction(false);
      addDebugLog(`✅ Pulse completed for ${name}`, 'success');
    }, 100);
  };

  const handleRefresh = () => {
    addDebugLog('🔄 Refresh requested - clearing buffer', 'info');
    jsonBufferRef.current = '';
    lastChunkRef.current = '';
    setIsRefreshing(true);
    sendPulse(sendRefreshPulse, DIGITAL_JOINS.DEVICE_STATUS_REFRESH, 'Device Status Refresh');
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    addDebugLog('🚀 Page mounted, initializing...', 'info');
    const timer = setTimeout(() => {
      addDebugLog('⏱️ Auto-refresh triggered', 'info');
      handleRefresh();
    }, 500);
    return () => {
      clearTimeout(timer);
      if (parseTimerRef.current) clearTimeout(parseTimerRef.current);
    };
  }, []);

  const onlineDevices = displayDevices.filter(d => d.status === 'online').length;
  const offlineDevices = displayDevices.filter(d => d.status === 'offline').length;

  const splitIndex = Math.ceil(displayDevices.length / 2);
  const leftDevices = displayDevices.slice(0, splitIndex);
  const rightDevices = displayDevices.slice(splitIndex);

  const renderDeviceColumn = (deviceList, startIndex = 0) => (
    <div className="flex-1 min-w-0 space-y-2 touchPanel:space-y-4">
      {deviceList.map((device, idx) => {
        const globalIndex = startIndex + idx;
        const status = device.status || 'online';
        const ipAddress = device.ip || device.ipAddress || 'N/A';
        return (
          <div
            key={device.id}
            style={{
              animation: `deviceFadeIn 300ms ease-out ${globalIndex * 60}ms both`,
              // Literal rgba: slash-opacity borders don't paint on the panel.
              borderColor: status === 'online'
                ? 'rgba(74, 222, 128, 0.45)'
                : 'rgba(220, 38, 38, 0.45)',
            }}
            className="p-4 touchPanel:p-5 rounded-xl border-2 bg-secondary transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 touchPanel:space-x-4 flex-1 min-w-0">
                {status === 'online' ? (
                  <CheckCircle size={20} className="text-success flex-shrink-0 touchPanel:w-7 touchPanel:h-7" />
                ) : (
                  <XCircle size={20} className="text-accent flex-shrink-0 touchPanel:w-7 touchPanel:h-7" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm touchPanel:text-lg text-foreground truncate">
                    {device.name}
                  </div>
                  <div className="text-xs touchPanel:text-base text-muted-foreground">
                    IP: {ipAddress}
                  </div>
                </div>
              </div>
              <div
                className="text-xs touchPanel:text-sm font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2"
                style={status === 'online'
                  ? { backgroundColor: 'var(--color-success-surface)', color: 'var(--color-success-on-surface)' }
                  : { backgroundColor: 'var(--color-danger-surface)', color: 'var(--color-danger-on-surface)' }}
              >
                {status === 'online' ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Active log list for current tab ──
  const activeLogList =
    debugTab === 'device'    ? debugLogs :
    debugTab === 'heartbeat' ? heartbeatLogs :
    ackLogs;

  const handleClearLogs = () => {
    if (debugTab === 'device')         setDebugLogs([]);
    else if (debugTab === 'heartbeat') clearHeartbeatLogs();
    else { clearAckLogs(); setAckLogs([]); }
  };

  return (
    <>
    <style>{`
      @keyframes deviceFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    <div className="page-mesh h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex">
      <div className={`flex-1 p-6 touchPanel:p-8 flex h-full gap-6 touchPanel:gap-8 ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>

        <div className="flex-1 grid grid-cols-[5fr_3fr] gap-6 touchPanel:gap-8">

          {/* LEFT: Device Status */}
          <Card variant="gradient" tone="video" className="flex flex-col overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3 touchPanel:space-x-4 text-heading">
                  <Monitor size={28} className="text-heading touchPanel:w-10 touchPanel:h-10" />
                  <span className="text-xl touchPanel:text-3xl font-bold">Device Status</span>
                </CardTitle>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="p-3 touchPanel:p-4 hover:bg-gray-100 rounded-full transition-colors"
                    title="Toggle Debug Panel"
                  >
                    <Bug size={24} className="text-orange-500 touchPanel:w-8 touchPanel:h-8" />
                  </button>
                  <button
                    onClick={handleRefresh}
                    className={`p-3 touchPanel:p-4 hover:bg-gray-100 rounded-full transition-colors ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                    disabled={isRefreshing}
                    aria-label="Refresh device status"
                  >
                    <RefreshCw size={24} className="text-heading touchPanel:w-8 touchPanel:h-8" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col px-6 py-4 touchPanel:px-10 touchPanel:py-6 min-h-0">
              {/* Summary */}
              <div className="flex items-center justify-between p-4 touchPanel:p-6 bg-gray-50 rounded-xl mb-4 touchPanel:mb-6">
                <div className="flex items-center space-x-6 touchPanel:space-x-8">
                  <div className="flex items-center space-x-2 touchPanel:space-x-3">
                    <CheckCircle size={24} className="text-success touchPanel:w-8 touchPanel:h-8" />
                    <span className="text-base touchPanel:text-2xl font-medium text-muted-foreground">
                      Online: <span className="text-success font-bold">{onlineDevices}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 touchPanel:space-x-3">
                    <XCircle size={24} className="text-accent touchPanel:w-8 touchPanel:h-8" />
                    <span className="text-base touchPanel:text-2xl font-medium text-muted-foreground">
                      Offline: <span className="text-accent font-bold">{offlineDevices}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Device List or Empty State */}
              {displayDevices.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Monitor size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl touchPanel:text-3xl font-bold text-gray-400 mb-2">
                      No devices data yet
                    </h3>
                    <p className="text-sm touchPanel:text-xl text-gray-400">
                      Check debug panel for backend connection status
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto mb-3">
                  <div className="flex gap-6 touchPanel:gap-8 pr-2 min-w-0">
                    {renderDeviceColumn(leftDevices, 0)}
                    {renderDeviceColumn(rightDevices, splitIndex)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: System Information */}
          <Card variant="gradient" tone="neutral" className="flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center space-x-3 touchPanel:space-x-4 text-heading">
                <Info size={28} className="text-heading touchPanel:w-10 touchPanel:h-10" />
                <span className="text-xl touchPanel:text-3xl font-bold">System Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-6 py-4 touchPanel:px-10 touchPanel:py-6 min-h-0">
              <div className="space-y-4 touchPanel:space-y-6">
                <div
                  className="flex items-center gap-3 p-4 touchPanel:p-6 rounded-lg border-2 bg-secondary"
                  style={{
                    borderColor: isConnected
                      ? 'rgba(34, 197, 94, 0.45)'
                      : 'var(--color-accent)',
                  }}
                >
                  <Wifi size={24} className={`touchPanel:w-8 touchPanel:h-8 ${
                    isConnected ? 'text-success' : 'text-accent'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-medium touchPanel:text-2xl ${
                      isConnected ? 'text-success' : 'text-accent'
                    }`}>
                      Processor
                    </h4>
                    <p className={`text-sm touchPanel:text-xl ${
                      isConnected ? 'text-success' : 'text-accent'
                    }`}>
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                  {isConnected && (
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                  )}
                </div>

                {/* System Details Grid */}
                <div className="grid grid-cols-2 gap-4 touchPanel:gap-6 text-sm touchPanel:text-lg pt-2">
                  <div>
                    <div className="text-muted-foreground mb-1">Last Program Update</div>
                    <div className="text-foreground font-medium">March 09, 2026</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Last UI Update</div>
                    <div className="text-foreground font-medium">March 09, 2026</div>
                  </div>
                  <div>
                    <div className="font-medium text-heading mb-1 touchPanel:mb-2">Last Program Editor</div>
                    <div className="text-foreground">{programInfo.lastProgramEditor.name}</div>
                  </div>
                  <div>
                    <div className="font-medium text-heading mb-1 touchPanel:mb-2">Last UI Editor</div>
                    <div className="text-foreground">{programInfo.lastUIEditor.name}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="font-medium text-heading mb-1 touchPanel:mb-2">Loaded Program Path</div>
                    <div className="text-xs touchPanel:text-base text-muted-foreground bg-gray-50 p-2 touchPanel:p-3 rounded font-mono break-all">
                      {programInfo.loadedPath}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ════════════════════════════════════════════
            🐛 Debug Panel (Toggleable Overlay)
        ════════════════════════════════════════════ */}
        {showDebug && (
          <div className="absolute right-6 top-24 w-96 h-[calc(100vh-150px)] bg-gray-900 rounded-xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden z-50">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Bug size={20} className="text-orange-500" />
                <h3 className="text-white font-bold">Debug Console</h3>
              </div>
              <button
                onClick={handleClearLogs}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
              >
                Clear
              </button>
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setDebugTab('device')}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  debugTab === 'device'
                    ? 'bg-gray-800 text-orange-400 border-b-2 border-orange-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Device List
              </button>
              <button
                onClick={() => setDebugTab('heartbeat')}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  debugTab === 'heartbeat'
                    ? 'bg-gray-800 text-green-400 border-b-2 border-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Heartbeat
              </button>
              {/* ✅ NEW: TCP / ACK tab */}
              <button
                onClick={() => setDebugTab('ack')}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  debugTab === 'ack'
                    ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                TCP / ACK
              </button>
            </div>

            {/* ── Log Output ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
              {activeLogList.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No logs yet...</div>
              ) : (
                activeLogList.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded ${
                      log.type === 'error'   ? 'bg-red-900/30 text-red-300' :
                      log.type === 'success' ? 'bg-green-900/30 text-green-300' :
                      log.type === 'warning' ? 'bg-yellow-900/30 text-yellow-300' :
                      log.type === 'connect' ? 'bg-blue-900/30 text-blue-300' :
                                               'bg-gray-800/50 text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">[{log.time}]</span> {log.message}
                  </div>
                ))
              )}
              <div ref={debugEndRef} />
            </div>

            {/* ── Footer Status ── */}
            <div className="p-3 border-t border-gray-700 bg-gray-800">
              {debugTab === 'ack' ? (
                <div className="text-xs text-gray-400 space-y-1">
                  <div>ACK log entries: {ackLogs.length}</div>
                  <div>Join 322 subscribed: {window.__ackSubActive ? '✅ Yes' : '❓ Unknown'}</div>
                  <div>Last ACK: {ackLogs.length > 0 ? ackLogs[ackLogs.length - 1].message : '—'}</div>
                  <div>WebXPanel: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Buffer size: {jsonBufferRef.current.length} chars</div>
                  <div>Last chunk: {lastChunkRef.current ? 'Received' : 'None'}</div>
                  <div>Devices: {displayDevices.length}</div>
                  <div>Data source: {isMockData ? '⚠️ Mock' : '✅ Live'}</div>
                  <div>Processor: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
};

export default SettingsPage;