import React, { useState, useEffect } from 'react';
import {
  Zap,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Globe,
  LogOut,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  user: UserProfile | null;
  language: Language;
  onToggleLanguage: (lang?: Language) => void;
  onLogout: () => void;
  pendingCount: number;
  onSyncClick: () => void;
  isSyncing: boolean;
  isAdminView?: boolean;
  onToggleAdminView?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  language,
  onToggleLanguage,
  onLogout,
  pendingCount,
  onSyncClick,
  isSyncing,
  isAdminView = false,
  onToggleAdminView
}) => {
  const t = translations[language];
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery status API if supported on Android
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Status Utility Bar */}
      <div className="bg-gray-50 px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs font-sans text-gray-600 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <span className="inline-flex items-center text-green-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              <Wifi className="w-3.5 h-3.5 mr-1 text-green-600" />
              <span>4G+ {t.online}</span>
            </span>
          ) : (
            <span className="inline-flex items-center text-orange-700 font-bold">
              <WifiOff className="w-3.5 h-3.5 mr-1 text-orange-600" />
              <span>{t.offline}</span>
            </span>
          )}

          {batteryLevel !== null && (
            <span className="hidden sm:inline-flex items-center text-gray-500 ml-2 font-medium">
              {isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 mr-1 text-green-600" />
              ) : (
                <Battery className="w-3.5 h-3.5 mr-1 text-gray-500" />
              )}
              <span>{batteryLevel}%</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Admin Switch Button */}
          {onToggleAdminView && (
            <button
              id="admin-toggle-btn"
              onClick={onToggleAdminView}
              className={`flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border transition-colors shadow-xs ${
                isAdminView
                  ? 'bg-purple-600 text-white border-purple-700'
                  : 'bg-white hover:bg-gray-100 text-purple-700 border-gray-200'
              }`}
              title="Toggle Supervisor Admin Verification Portal"
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              <span>{isAdminView ? 'Field View' : 'Admin Panel'}</span>
            </button>
          )}

          {/* Sync Queue Pill */}
          {pendingCount > 0 ? (
            <button
              id="sync-badge-btn"
              onClick={onSyncClick}
              disabled={isSyncing || !isOnline}
              className="inline-flex items-center px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold hover:bg-orange-200"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingCount} {language === 'hi' ? 'बाकी' : 'Pending'}</span>
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center text-green-700 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-green-600" />
              <span>{language === 'hi' ? 'सिंक सुरक्षित' : 'Synced'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Branding / User Bar with Prominent Bilingual [ENG | हिंदी] Toggle next to Avatar */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          {user ? (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#0052cc] p-0.5 shrink-0 bg-white shadow-xs">
              <div className="w-full h-full bg-[#0052cc] rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm tracking-wider">
                {getInitials(user.name)}
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#0052cc] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Zap className="w-5 h-5 fill-white" />
            </div>
          )}

          <div className="min-w-0">
            {user ? (
              <>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate">
                  {language === 'hi' ? user.nameHi || user.name : user.name}
                </h2>
                <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider truncate">
                  {language === 'hi' ? user.roleHi : user.role}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-1.5">
                  <h1 className="font-bold text-sm sm:text-base text-gray-900 tracking-tight leading-tight">
                    {t.appTitle}
                  </h1>
                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[#0052cc] text-[9px] font-black tracking-wider uppercase">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium truncate max-w-[170px] sm:max-w-xs">
                  {t.appSubtitle}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Section: [ENG | हिंदी] One-Tap Segmented Toggle + Logout */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Prominent Bilingual Segmented Toggle [ENG | हिंदी] */}
          <div
            id="bilingual-toggle-control"
            className="p-0.5 bg-gray-100 rounded-xl border border-gray-200 flex items-center shadow-xs"
          >
            <button
              type="button"
              onClick={() => onToggleLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-[#0052cc] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ENG
            </button>
            <button
              type="button"
              onClick={() => onToggleLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'hi'
                  ? 'bg-[#0052cc] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              हिंदी
            </button>
          </div>

          {user && (
            <button
              id="logout-btn"
              onClick={onLogout}
              className="p-2 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200 transition-colors shrink-0"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
