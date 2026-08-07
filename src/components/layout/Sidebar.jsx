import { useLocation } from 'react-router-dom';
import SpeakerControl from '../devices/SpeakerControl';

const Sidebar = ({ className = '' }) => {
  const location = useLocation();

  // Sidebar only for Main Page routes
  const mainPageRoutes = [
    "/main-page",
    "/av-matrix",
    "/audio-controls",
    "/cafe",
    "/room-controls",
    "/settings",
  ];
  const showSidebar = mainPageRoutes.includes(location.pathname);

  // Don't render sidebar if not on a Main Page route
  if (!showSidebar) {
    return null;
  }

  // The sidebar is a positioning wrapper ONLY — deliberately no background.
  // SpeakerControl inside renders <Card variant="glass">, which is the same
  // surface the page cards use, so the column already matches them. Giving the
  // <aside> its own fill stacks a second frosted layer behind that card and the
  // two tints fight; it also makes the 16px by which this element (w-40)
  // overhangs the margin pages reserve for it (mr-36) paint over page content.
  return (
    <aside
      className={`
        fixed top-[72px] touchPanel:top-[110px] right-0
        h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)]
        w-40 touchPanel:w-52 p-6 touchPanel:p-8 pt-7 pb-5
        z-40
        ${className}
      `}
    >
      <SpeakerControl />
    </aside>
  );
};

export default Sidebar;