import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { translations, defaultElectricians } from '../translations';
import { Zap, Shield, Phone, KeyRound, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

interface LoginScreenProps {
  language: Language;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ language, onLoginSuccess }) => {
  const t = translations[language];
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim();
    const cleanPin = pin.trim();

    if (!cleanId) {
      setError(language === 'hi' ? 'कृपया मोबाइल नंबर या कर्मचारी आईडी दर्ज करें' : 'Please enter Mobile Number or Worker ID');
      return;
    }

    if (!cleanPin) {
      setError(language === 'hi' ? 'कृपया 4-अंकों का पिन दर्ज करें' : 'Please enter 4-digit PIN');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching demo electrician or create dynamic profile
      const found = defaultElectricians.find(
        (el) =>
          el.phone === cleanId ||
          el.workerId.toLowerCase() === cleanId.toLowerCase()
      );

      if (found) {
        if (cleanPin === found.pin || cleanPin === '1234') {
          setIsLoading(false);
          onLoginSuccess(found);
          return;
        } else {
          setIsLoading(false);
          setError(t.invalidCredentials);
          return;
        }
      }

      // If user typed custom 10 digit number or worker id with default pin 1234
      if (cleanPin === '1234' || cleanPin.length === 4) {
        const customUser: UserProfile = {
          id: `custom_${Date.now()}`,
          name: cleanId.startsWith('ELEC') ? `Electrician (${cleanId})` : `Field Tech (${cleanId.slice(-4)})`,
          nameHi: cleanId.startsWith('ELEC') ? `इलेक्ट्रीशियन (${cleanId})` : `फील्ड तकनीशियन (${cleanId.slice(-4)})`,
          phone: cleanId.startsWith('ELEC') ? '9876543210' : cleanId,
          workerId: cleanId.startsWith('ELEC') ? cleanId.toUpperCase() : `ELEC-${cleanId.slice(-4) || '9999'}`,
          role: 'Certified Lineman / Wireman',
          roleHi: 'प्रमाणित लाइनमैन / वायरमैन',
          userType: 'worker',
          discom: 'State Electricity Distribution Co.',
          substation: 'Local Circle Grid Substation',
          pin: cleanPin
        };
        setIsLoading(false);
        onLoginSuccess(customUser);
      } else {
        setIsLoading(false);
        setError(t.invalidCredentials);
      }
    }, 400);
  };

  const handleSelectDemo = (elec: UserProfile) => {
    setIdentifier(elec.phone);
    setPin(elec.pin);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Clean Minimalism Electric Blue Header */}
        <div className="bg-[#0052cc] p-6 text-white relative">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[11px] uppercase tracking-wider">
              {t.appSubtitle}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase">
            {t.loginTitle}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Error Display in large readable text */}
          {error && (
            <div
              id="login-error-banner"
              className="p-3.5 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 flex items-start space-x-3 text-sm font-semibold"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="identifier-input"
                className="block text-xs font-bold text-gray-500 uppercase tracking-widest"
              >
                {t.phoneOrWorkerId}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="identifier-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full h-14 bg-gray-50 border-2 border-gray-200 focus:border-[#0052cc] focus:bg-white rounded-xl pl-11 pr-4 text-base font-medium text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="pin-input"
                className="block text-xs font-bold text-gray-500 uppercase tracking-widest"
              >
                {t.pinCode}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  id="pin-input"
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={t.pinPlaceholder}
                  className="w-full h-14 bg-gray-50 border-2 border-gray-200 focus:border-[#0052cc] focus:bg-white rounded-xl pl-11 pr-4 text-lg tracking-widest font-mono text-gray-900 placeholder:tracking-normal placeholder:text-gray-400 transition-all outline-none"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full h-15 bg-[#0052cc] hover:bg-[#0041a3] active:bg-blue-900 text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  <span>{t.loginButton}</span>
                </>
              )}
            </button>
          </form>

          {/* Supervisor Call info */}
          <p className="text-center text-xs text-gray-500">
            {language === 'hi' ? 'लॉगिन में परेशानी? ' : 'Trouble logging in? '}
            <a href="tel:1912" className="text-[#0052cc] font-bold hover:underline">
              {language === 'hi' ? 'सुपरवाइजर / 1912 को कॉल करें' : 'Call Supervisor / 1912'}
            </a>
          </p>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              {t.quickDemoProfiles}
            </p>
            <div className="space-y-2">
              {defaultElectricians.map((el) => (
                <button
                  key={el.id}
                  id={`demo-user-${el.workerId}`}
                  type="button"
                  onClick={() => handleSelectDemo(el)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-[#0052cc]/40 text-xs transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-gray-900 group-hover:text-[#0052cc]">
                      {language === 'hi' ? el.nameHi : el.name}{' '}
                      <span className="text-[#0052cc] font-mono">({el.workerId})</span>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate max-w-[220px]">
                      {el.discom.split(' ')[0]} • +91 {el.phone}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-white text-[10px] font-bold text-[#0052cc] rounded-lg border border-gray-200 shadow-xs shrink-0 group-hover:bg-[#0052cc] group-hover:text-white transition-colors">
                    {language === 'hi' ? 'चुनें' : 'Select'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Security badge footer */}
          <div className="pt-2 flex items-center justify-center space-x-1.5 text-[11px] text-gray-400">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span>Geo-Encrypted Attendance Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};
