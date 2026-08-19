import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  PhoneCall,
  HardHat,
  Smartphone,
  Download,
  CheckCircle2,
  Zap,
  Radio,
  Building,
  Info,
  Phone,
  HelpCircle,
  ShieldAlert,
  Server,
  Cloud,
  LogOut
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { translations } from '../translations';

interface ProfileTabProps {
  user: UserProfile;
  language: Language;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  language,
  onLogout
}) => {
  const t = translations[language];
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        language === 'hi'
          ? 'अपने ब्राउज़र मेनू (तीन डॉट्स ⋮) पर टैप करें और "होम स्क्रीन पर जोड़ें" (Add to Home Screen) चुनें।'
          : 'Tap your browser menu (three dots ⋮) and select "Add to Home screen" or "Install App".'
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Electrician Identity Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0052cc] flex items-center justify-center text-white font-black text-2xl shadow-md shadow-blue-500/20 shrink-0">
            <Zap className="w-8 h-8 fill-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0052cc] font-mono font-bold text-xs border border-blue-200">
                {user.workerId}
              </span>
              <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">
                ACTIVE
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">
              {language === 'hi' ? user.nameHi || user.name : user.name}
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              {language === 'hi' ? user.roleHi : user.role}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-100 text-xs">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
            <span className="text-gray-500 font-bold">{t.discomCircle}:</span>
            <span className="font-semibold text-gray-900">{user.discom}</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
            <span className="text-gray-500 font-bold">{t.substationName}:</span>
            <span className="font-semibold text-gray-900 truncate max-w-[200px]">{user.substation}</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
            <span className="text-gray-500 font-bold">{t.contactNumber}:</span>
            <span className="font-mono font-bold text-[#0052cc]">+91 {user.phone}</span>
          </div>
        </div>
      </div>

      {/* Supervisor Contact Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              {language === 'hi' ? 'साइट सुपरवाइजर संपर्क' : 'Assigned Site Supervisor'}
            </h4>
            <p className="text-xs text-gray-500">
              Er. Rajesh Sharma (AEE / Zonal Inspector)
            </p>
          </div>
        </div>

        <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-between">
          <div className="text-xs">
            <div className="font-bold text-gray-900">ID: SUP-5001</div>
            <div className="text-[11px] text-gray-500">Zonal Inspection Office</div>
          </div>
          <a
            href="tel:9811002233"
            className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Supervisor</span>
          </a>
        </div>
      </div>

      {/* 24x7 Emergency Helpline for Indian Field Electricians */}
      <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-red-100 text-red-600 border border-red-200">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900">
              Electricity Emergency Helpline
            </div>
            <div className="text-[11px] text-gray-600">
              Toll-Free 24x7 State Load Dispatch
            </div>
          </div>
        </div>
        <a
          href="tel:1912"
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-mono font-black text-xs rounded-xl shadow-xs transition-colors"
        >
          📞 1912
        </a>
      </div>

      {/* PWA Mobile Installation Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0052cc] border border-blue-200">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              Progressive Web App (PWA)
            </h4>
            <p className="text-xs text-gray-500">
              Low-RAM Android 8+ Caching & Fast 3G Launch
            </p>
          </div>
        </div>

        <button
          id="install-pwa-button"
          type="button"
          onClick={handleInstallPwa}
          className="w-full h-12 bg-[#0052cc] hover:bg-[#0041a3] active:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          {isInstalled ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.installedApp}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{t.installPwa}</span>
            </>
          )}
        </button>
      </div>

      {/* Logout Button */}
      <button
        id="profile-logout-btn"
        type="button"
        onClick={onLogout}
        className="w-full h-12 bg-white hover:bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider rounded-2xl border border-red-200 transition-colors flex items-center justify-center space-x-2 shadow-xs"
      >
        <LogOut className="w-4 h-4" />
        <span>{t.logout}</span>
      </button>
    </div>
  );
};
