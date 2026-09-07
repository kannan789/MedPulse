import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import { Lock, ShieldAlert, Fingerprint, KeyRound, AlertOctagon } from 'lucide-react';

export const LockScreen: React.FC = () => {
  const { doctor, unlockScreen, logHipaaAction } = useDoctor();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showBreakGlass, setShowBreakGlass] = useState(false);
  const [breakGlassReason, setBreakGlassReason] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setError('Please enter your 4-digit PIN.');
      return;
    }
    const success = unlockScreen(pin);
    if (!success) {
      setError('Invalid PIN. Please re-enter or use Emergency Break-Glass.');
    }
  };

  const handleQuickUnlock = () => {
    unlockScreen('1234');
  };

  const handleBreakGlass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassReason.trim()) {
      setError('A documented clinical reason is strictly mandatory for Emergency Break-Glass access.');
      return;
    }
    logHipaaAction(
      'BREAK_GLASS',
      `EMERGENCY BREAK-GLASS OVERRIDE: "${breakGlassReason.trim()}". Provider session unlocked without standard PIN.`
    );
    unlockScreen('1234');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-800">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mb-3 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Session Locked for Privacy</h2>
          <p className="text-xs text-stone-600 mt-1">
            HIPAA Security Rule §164.312(a)(2)(iii) Auto-Lock Protection Active
          </p>
        </div>

        <div className="bg-[#F0EEE6] rounded-2xl p-3.5 mb-5 border border-stone-200 flex items-center gap-3">
          <img
            src={doctor.avatarUrl}
            alt={doctor.name}
            className="w-10 h-10 rounded-xl object-cover border border-stone-300"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-serif font-bold text-stone-900 truncate">{doctor.name}</p>
            <p className="text-[11px] text-[#4A5443] truncate font-medium">{doctor.title}</p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700">
            PIN: 1234
          </span>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {!showBreakGlass ? (
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Enter Physician PIN to Resume
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 1234"
                  autoFocus
                  className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-2.5 pl-10 text-center tracking-widest text-lg font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-medium py-2.5 px-4 rounded-2xl text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Unlock Clinical Portal
            </button>

            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs py-2.5 px-3 rounded-2xl border border-stone-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-[#7C8B6F]" />
              Quick Touch ID Unlock (1-Click)
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowBreakGlass(true);
                  setError('');
                }}
                className="text-[11px] text-red-700 hover:text-red-800 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
              >
                <AlertOctagon className="w-3 h-3" />
                Clinical Emergency? Break-Glass Access
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBreakGlass} className="space-y-3.5">
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-red-800">
                <AlertOctagon className="w-4 h-4 text-red-600" /> Emergency Break-Glass Protocol
              </div>
              <p className="text-[11px] text-red-700 leading-relaxed">
                Notice: Invoking emergency break-glass bypasses standard authentication and triggers an immediate high-priority audit record logged under HIPAA Security regulations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Clinical Emergency Justification <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={2}
                value={breakGlassReason}
                onChange={(e) => setBreakGlassReason(e.target.value)}
                placeholder="e.g. Code Blue / Patient cardiac arrest / Unresponsive patient in Exam Room 2 needing immediate allergy check"
                className="w-full bg-white border border-red-300 rounded-2xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowBreakGlass(false);
                  setError('');
                }}
                className="w-1/3 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 rounded-2xl text-xs cursor-pointer border border-stone-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 bg-red-700 hover:bg-red-800 text-white font-medium py-2 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <AlertOctagon className="w-3.5 h-3.5" /> Confirm Break-Glass
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
