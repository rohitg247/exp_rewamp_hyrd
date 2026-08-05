import { Wrench } from 'lucide-react';


const UnderDevelopment = ({ sidebarEnabled = false }) => {
  return (
    <div className="h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex">
      <div className={`flex-1 p-6 touchPanel:p-8 flex items-center justify-center ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg px-8 py-10 touchPanel:px-12 touchPanel:py-14 max-w-2xl w-full">
          <div className="text-center space-y-6 touchPanel:space-y-8">
            <div className="flex justify-center">
              <div className="p-8 touchPanel:p-10 bg-primary/10 rounded-full">
                <Wrench size={64} className="w-16 h-16 touchPanel:w-20 touchPanel:h-20 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl touchPanel:text-5xl font-bold text-heading">Under Development</h1>
            <p className="text-xl touchPanel:text-2xl text-theme-text-light">
              This feature is coming soon
            </p>
            <p className="text-base touchPanel:text-lg text-theme-text-light opacity-80">
              We're working hard to bring you this functionality. Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default UnderDevelopment;