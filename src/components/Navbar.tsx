import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Bell,
  Search,
  LogOut,
  Stethoscope,
  ChevronDown,
  AlertTriangle,
  FileText,
  Clock,
} from 'lucide-react';
import { maskName } from '../utils/hipaa';

export const Navbar: React.FC = () => {
  const {
    doctor,
    phiMasked,
    togglePhiMask,
    lockScreen,
    logout,
    urgentAlerts,
    patients,
    selectPatient,
    setActiveTab,
    acknowledgeAlert,
  } = useDoctor();

  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showDoctorMenu, setShowDoctorMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const unreadAlerts = urgentAlerts.filter((a) => !a.acknowledged);

  const filteredPatients = searchQuery.trim()
    ? patients.filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
          p.firstName.toLowerCase().includes(query) ||
          p.lastName.toLowerCase().includes(query) ||
          p.mrn.toLowerCase().includes(query) ||
          p.phone.includes(query) ||
          p.problemList.some((pr) => pr.diagnosis.toLowerCase().includes(query))
        );
      })
    : [];

  return (
    <header className="sticky top-0 z-30 bg-[#F0EEE6]/95 backdrop-blur border-b border-stone-200 text-stone-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-[#7C8B6F] rounded-2xl flex items-center justify-center text-white shadow-sm">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#4A5443] tracking-tight font-serif">MedPulse EHR</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#DCE2D1] text-[#3E4738] flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> HIPAA
              </span>
            </div>
            <p className="text-[11px] text-stone-500">{doctor.clinicName}</p>
          </div>
        </div>

        {/* Center: Global Patient Quick Search */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search patients by name, MRN, phone, diagnosis..."
              className="w-full bg-white border border-stone-200 rounded-2xl py-2 px-3.5 pl-9 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] transition shadow-xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="p-2.5 bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex justify-between items-center">
                <span>Matching Patients ({filteredPatients.length})</span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-stone-100">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        selectPatient(p.id);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-[#F2F4F0] transition flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <p className="font-semibold text-stone-900">
                          {maskName(`${p.firstName} ${p.lastName}`, phiMasked)}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {p.mrn} • DOB: {p.dob} • Risk: {p.riskLevel}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#3E4738] bg-[#DCE2D1] font-medium px-2 py-0.5 rounded-full">
                        Open Chart
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-stone-400">
                    No patients matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy / PHI Masking Switch */}
          <button
            onClick={togglePhiMask}
            title={phiMasked ? 'Turn off Privacy Mode (Unmask PHI)' : 'Turn on Privacy Mode (Obfuscate Patient Identifiers)'}
            className={`px-3 py-1.5 rounded-2xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
              phiMasked
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {phiMasked ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-stone-400" />}
            <span className="hidden sm:inline">{phiMasked ? 'Privacy Mask: ON' : 'Privacy Mode'}</span>
          </button>

          {/* Urgent Alerts Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAlertMenu(!showAlertMenu)}
              className={`relative p-2 rounded-2xl border transition cursor-pointer ${
                unreadAlerts.length > 0
                  ? 'bg-[#FFF8F8] border-red-200 text-red-600'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
              title="Urgent Clinical Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {showAlertMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-3xl shadow-xl p-4 z-50 text-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 font-semibold text-stone-800">
                  <span className="flex items-center gap-1.5 text-red-600 font-serif text-sm">
                    <AlertTriangle className="w-4 h-4" /> Urgent Patient Alerts ({unreadAlerts.length})
                  </span>
                  <button
                    onClick={() => setShowAlertMenu(false)}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {urgentAlerts.length === 0 ? (
                    <p className="text-stone-400 text-center py-4">No active clinical alerts.</p>
                  ) : (
                    urgentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-2xl border ${
                          alert.acknowledged
                            ? 'bg-stone-50 border-stone-200 text-stone-400'
                            : alert.severity === 'Critical'
                            ? 'bg-[#FFF8F8] border-red-200 text-stone-800'
                            : 'bg-amber-50/70 border-amber-200 text-stone-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span
                            className={`font-semibold text-xs ${
                              alert.severity === 'Critical' ? 'text-red-700' : 'text-amber-800'
                            }`}
                          >
                            {alert.title}
                          </span>
                          <span className="text-[10px] text-stone-400 shrink-0">{alert.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">{alert.description}</p>
                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-200/70">
                          <span className="text-stone-500 font-medium">
                            {maskName(alert.patientName, phiMasked)} ({alert.mrn})
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                selectPatient(alert.patientId);
                                setShowAlertMenu(false);
                              }}
                              className="text-[#4A5443] font-semibold hover:underline cursor-pointer"
                            >
                              Open Chart
                            </button>
                            {!alert.acknowledged && (
                              <button
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                              >
                                Acknowledge
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Screen Lock Button */}
          <button
            onClick={lockScreen}
            className="p-2 rounded-2xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
            title="Lock screen immediately (HIPAA Inactivity Lock)"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Doctor Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDoctorMenu(!showDoctorMenu)}
              className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-stone-200/50 transition cursor-pointer border border-transparent hover:border-stone-200"
            >
              <img
                src={doctor.avatarUrl}
                alt={doctor.name}
                className="w-8 h-8 rounded-full object-cover border border-stone-300"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-stone-900 leading-tight truncate">{doctor.name}</p>
                <p className="text-[10px] text-stone-500 leading-tight">NPI: {doctor.npi}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {showDoctorMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-3xl shadow-xl p-4 z-50 text-xs">
                <div className="pb-3 mb-2 border-b border-stone-200">
                  <p className="font-serif font-bold text-stone-900 text-sm">{doctor.name}</p>
                  <p className="text-[#4A5443] font-medium text-xs">{doctor.title}</p>
                  <p className="text-stone-500 text-[11px] mt-1">{doctor.clinicAddress}</p>
                  <div className="mt-2 text-[10px] bg-stone-100 p-2 rounded-xl text-stone-600 font-mono space-y-0.5 border border-stone-200">
                    <div>DEA: {doctor.dea}</div>
                    <div>License: {doctor.licenseNumber}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('audit');
                      setShowDoctorMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-stone-100 text-stone-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#7C8B6F]" />
                    HIPAA Compliance Audit Log
                  </button>
                  <button
                    onClick={() => {
                      setShowDoctorMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer transition"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    Sign Out / End Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
