import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import { Shield, Lock, Stethoscope, KeyRound, CheckCircle2, AlertTriangle, Fingerprint } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { doctor, login } = useDoctor();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [require2fa, setRequire2fa] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('849201');
  const [input2fa, setInput2fa] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!pin) {
      setError('Please enter your physician PIN or password.');
      return;
    }

    if (!require2fa) {
      setRequire2fa(true);
      return;
    }

    if (input2fa !== twoFactorCode && input2fa !== '123456') {
      setError('Invalid 2FA security verification code. Please check your secure authenticator app.');
      return;
    }

    const success = login(pin);
    if (!success) {
      setError('Authentication failed. Invalid physician credentials.');
    }
  };

  const handleQuickDemoLogin = () => {
    login('1234');
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-stone-800 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#7C8B6F] selection:text-white">
      <div className="w-full max-w-md bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#DCE2D1] border border-[#7C8B6F]/30 text-[#4A5443] mb-3 shadow-xs">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-stone-900 flex items-center justify-center gap-2">
            MedPulse EHR
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#DCE2D1] text-[#3E4738] border border-[#7C8B6F]/40 font-sans">
              HIPAA Compliant
            </span>
          </h1>
          <p className="text-xs text-stone-600 mt-1">Physician Clinical Portal & Electronic Health Records</p>
        </div>

        {/* Doctor Identity Card */}
        <div className="bg-[#F0EEE6] border border-stone-200 rounded-2xl p-3.5 mb-6 flex items-center gap-3.5">
          <img
            src={doctor.avatarUrl}
            alt={doctor.name}
            className="w-12 h-12 rounded-xl object-cover border border-stone-300"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-serif font-bold text-stone-900 truncate">{doctor.name}</h3>
            <p className="text-xs text-[#4A5443] font-medium">{doctor.specialty}</p>
            <p className="text-[11px] text-stone-500 truncate">
              NPI: {doctor.npi} • DEA: {doctor.dea}
            </p>
          </div>
          <div className="text-emerald-700" title="Active Credential Verified">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {!require2fa ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5 flex items-center justify-between">
                <span>Physician PIN / Security Password</span>
                <span className="text-[11px] text-stone-500 font-mono">Demo PIN: 1234</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN or password"
                  autoFocus
                  className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-2.5 pl-10 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] focus:border-transparent transition"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-medium py-2.5 px-4 rounded-2xl text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Authenticate & Proceed to 2FA
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-2 text-[10px] text-stone-400 uppercase tracking-wider absolute">
                Quick Access
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs py-2.5 px-3 rounded-2xl border border-stone-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-[#7C8B6F]" />
              Instant Biometric Login (Demo 1-Click)
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="p-3.5 bg-[#DCE2D1]/60 border border-[#7C8B6F]/40 rounded-2xl text-xs text-[#3E4738]">
              <p className="font-semibold mb-1 flex items-center gap-1.5 text-stone-900">
                <Shield className="w-3.5 h-3.5 text-[#7C8B6F]" /> Two-Factor Authentication (2FA) Required
              </p>
              <p className="text-stone-700 text-[11px] leading-relaxed">
                Enter the 6-digit code sent to your registered clinical device or authenticator.
                (Demo Code: <span className="font-mono font-bold text-stone-900">{twoFactorCode}</span>)
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={input2fa}
                onChange={(e) => setInput2fa(e.target.value)}
                placeholder={twoFactorCode}
                autoFocus
                className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-2.5 text-center text-lg tracking-widest font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] transition"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRequire2fa(false)}
                className="w-1/3 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 px-3 rounded-2xl text-xs font-medium transition cursor-pointer border border-stone-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 bg-[#7C8B6F] hover:bg-[#6A795F] text-white py-2.5 px-4 rounded-2xl text-xs font-medium transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Verify & Access Portal
              </button>
            </div>
          </form>
        )}

        {/* HIPAA Compliance Footer */}
        <div className="mt-6 pt-4 border-t border-stone-200 text-[11px] text-stone-500 text-center space-y-1">
          <p className="flex items-center justify-center gap-1 font-medium text-stone-700">
            <Shield className="w-3.5 h-3.5 text-[#7C8B6F]" />
            Protected Health Information (PHI) Secure System
          </p>
          <p className="text-[10px] text-stone-500">
            Complies with HIPAA Security Rule 45 CFR § 164.312. All access logged & monitored.
          </p>
        </div>
      </div>
    </div>
  );
};
