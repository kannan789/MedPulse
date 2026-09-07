import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import {
  ShieldCheck,
  Lock,
  Download,
  Filter,
  Search,
  Eye,
  FileText,
  Pill,
  Send,
  AlertOctagon,
  Clock,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { HipaaAuditEntry } from '../types';
import { maskName } from '../utils/hipaa';

export const HipaaAuditView: React.FC = () => {
  const {
    auditTrail,
    phiMasked,
    exportHipaaReport,
    autoLockMinutes,
    setAutoLockMinutes,
    lockScreen,
  } = useDoctor();

  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditTrail.filter((entry) => {
    if (selectedAction !== 'ALL' && entry.action !== selectedAction) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        entry.details.toLowerCase().includes(q) ||
        (entry.patientName && entry.patientName.toLowerCase().includes(q)) ||
        (entry.mrn && entry.mrn.toLowerCase().includes(q)) ||
        entry.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionBadge = (action: HipaaAuditEntry['action']) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-stone-100 text-stone-800 border-stone-200';
      case 'VIEW_PHI':
        return 'bg-[#DCE2D1] text-[#3E4738] border-[#7C8B6F]/40';
      case 'EDIT_RECORD':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'TRANSMIT_RX':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'SEND_REMINDER':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'BREAK_GLASS':
        return 'bg-red-50 text-red-800 border-red-200 animate-pulse font-bold';
      case 'EXPORT_DATA':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#F0EEE6] border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5443] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7C8B6F]" />
            <span>HIPAA Security Rule • 45 CFR § 164.312 Verification</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            Protected Health Information (PHI) Security & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Immutable clinical access audit log tracking all patient record views, updates, and e-prescriptions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={lockScreen}
            className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs py-2.5 px-3.5 rounded-2xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Lock Screen Now</span>
          </button>

          <button
            onClick={exportHipaaReport}
            className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-medium text-xs py-2.5 px-4 rounded-2xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Official Audit Log (JSON)</span>
          </button>
        </div>
      </div>

      {/* HIPAA Technical Safeguards Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-stone-900 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#7C8B6F]" /> Access & Authentication
            </span>
            <span className="text-[10px] bg-[#DCE2D1] text-[#3E4738] font-semibold px-2.5 py-0.5 rounded-full border border-[#7C8B6F]/40">
              Active
            </span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Unique physician user identification (§164.312(a)(2)(i)), multi-factor credentials, and DEA EPCS digital token verification.
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-stone-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#7C8B6F]" /> Automatic Screen Timeout
            </span>
            <div className="flex items-center gap-1">
              <select
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                className="bg-white border border-stone-200 text-stone-800 text-[10px] rounded-lg px-2 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#7C8B6F]"
              >
                <option value={5}>5 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
              </select>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Auto-lock (§164.312(a)(2)(iii)) terminates session and masks all PHI after inactivity to prevent unauthorized exam room exposure.
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7C8B6F]" /> Audit Controls (§164.312(b))
            </span>
            <span className="text-[10px] bg-[#DCE2D1] text-[#3E4738] font-semibold px-2.5 py-0.5 rounded-full border border-[#7C8B6F]/40">
              Verified
            </span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Hardware & software mechanisms record and examine activity in information systems containing or using PHI.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by detail, patient, user..."
            className="w-full bg-white border border-stone-200 rounded-2xl px-3.5 py-2 pl-9 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-500 font-medium">Action Filter:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-white border border-stone-200 text-stone-700 rounded-2xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
          >
            <option value="ALL">All Recorded Actions ({auditTrail.length})</option>
            <option value="LOGIN">LOGIN</option>
            <option value="VIEW_PHI">VIEW_PHI</option>
            <option value="EDIT_RECORD">EDIT_RECORD</option>
            <option value="TRANSMIT_RX">TRANSMIT_RX</option>
            <option value="SEND_REMINDER">SEND_REMINDER</option>
            <option value="BREAK_GLASS">BREAK_GLASS</option>
            <option value="EXPORT_DATA">EXPORT_DATA</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 border-b border-stone-200 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">User / Provider</th>
                <th className="py-3.5 px-4">Patient Target</th>
                <th className="py-3.5 px-4">IP Address / Terminal</th>
                <th className="py-3.5 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-stone-50/80 transition">
                  <td className="py-3 px-4 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                    {entry.timestamp.replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getActionBadge(
                        entry.action
                      )}`}
                    >
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-900 font-medium">
                    {entry.userName}
                    <span className="block text-[10px] text-stone-500 font-normal">
                      {entry.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-700">
                    {entry.patientName ? (
                      <div>
                        <span className="font-medium text-stone-900">{maskName(entry.patientName, phiMasked)}</span>
                        {entry.mrn && (
                          <span className="block text-[10px] text-stone-500 font-mono">
                            {entry.mrn}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                    {entry.ipAddress}
                  </td>
                  <td className="py-3 px-4 text-stone-700 max-w-md leading-relaxed">
                    {entry.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
