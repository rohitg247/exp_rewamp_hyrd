import { Mail, Phone, Globe, Info } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Logo from '../../assets/images/Actis_logo.jpg';
import WhiteLogo from "../../assets/images/White_logo.png";
import { useTheme } from '../../context/ThemeContext'; // ✅ ADDED

const SystemInfoModal = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme(); // ✅ ADDED


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Information"
      maxWidth="max-w-lg touchPanel:max-w-xl"
      showCloseButton={true}
      // ✅ REMOVED: height="h-auto" — invalid, Modal defaults to auto height
    >
      <div className="flex flex-col items-center space-y-6 touchPanel:space-y-8">
        
        {/* Actis Logo */}
        <div className="w-48 h-auto touchPanel:w-64">
          <img
            src={isDarkMode ? WhiteLogo : Logo}
            alt="Actis Logo"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Main Heading */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Info className="w-5 h-5 touchPanel:w-6 touchPanel:h-6 text-heading" />
            <h3 className="text-lg touchPanel:text-xl font-bold text-heading">
              System Designed & Installed by
            </h3>
          </div>
          <h2 className="text-2xl touchPanel:text-3xl font-extrabold text-heading">
            Actis Technologies Pvt. Ltd.
          </h2>
        </div>

        {/* Divider */}
        {/* <div className="w-full border-t-2 border-gray-200"></div> */}

        {/* Support Section */}
        {/* <div className="w-full space-y-4">
          <h4 className="text-base touchPanel:text-lg font-semibold text-heading text-center">
            Need Support?
          </h4>
          
          <p className="text-sm touchPanel:text-base text-gray-600 text-center">
            Log your ticket via our website
          </p> */}

          {/* Support Portal Button */}
          {/* <Button
            variant="primary"
            size="md"
            onClick={handleSupportClick}
            className="w-full flex items-center justify-center space-x-2 py-3 touchPanel:py-4"
          >
            <ExternalLink className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
            <span className="text-sm touchPanel:text-base">Visit Support Portal</span>
          </Button>
        </div> */}

        {/* Divider */}
        <div className="w-full border-t-2 border-gray-200"></div>

        {/* Contact Details */}
        <div className="w-full space-y-3 touchPanel:space-y-4">
          <h4 className="text-base touchPanel:text-2xl font-semibold text-heading text-center mb-3">
            Contact Information
          </h4>

          {/* Email */}
          <div className="flex items-center space-x-3 text-sm touchPanel:text-xl text-gray-700">
            <Mail className="w-5 h-5 touchPanel:w-8 touchPanel:h-8 text-heading flex-shrink-0" />
            <a 
              href="mailto:support@actis.co.in" 
              className="hover:text-heading transition-colors"
            >
              support@actis.co.in
            </a>
          </div>

          {/* Phone */}
          <div className="flex items-center space-x-3 text-sm touchPanel:text-xl text-gray-700">
            <Phone className="w-5 h-5 touchPanel:w-8 touchPanel:h-8 text-heading flex-shrink-0" />
            <a 
              href="tel:+911234567890" 
              className="hover:text-heading transition-colors"
            >
              +91 22 3080 8000
            </a>
          </div>

          {/* Website */}
          <div className="flex items-center space-x-3 text-sm touchPanel:text-xl text-gray-700">
            <Globe className="w-5 h-5 touchPanel:w-8 touchPanel:h-8 text-heading flex-shrink-0" />
            <a 
              href="https://www.actis.co.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-heading transition-colors"
            >
              www.actis.co.in
            </a>
          </div>
        </div>

        {/* Close Button */}
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          className="w-full py-3 touchPanel:py-4"
        >
          <span className="text-sm touchPanel:text-xl">Close</span>
        </Button>

      </div>
    </Modal>
  );
};

export default SystemInfoModal;
