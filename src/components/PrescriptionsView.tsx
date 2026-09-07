import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import {
  Pill,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  AlertTriangle,
  Building,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { maskName, maskDob } from '../utils/hipaa';
import { Prescription } from '../types';

interface PrescriptionsViewProps {
  onOpenNewPrescription: (patientId?: string) => void;
}

export const PrescriptionsView: React.FC<PrescriptionsViewProps> = ({
  onOpenNewPrescription,
}) => {
  const { patients, phiMasked, doctor, selectPatient } = useDoctor();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Aggregate all prescriptions from all patients
  const allPrescriptions: (Prescription & { patientDob: string })[] = [];
  patients.forEach((p) => {
    p.activePrescriptions.forEach((rx) => {
      allPrescriptions.push({
        ...rx,
        patientDob: p.dob,
      });
    });
  });

  const filteredPrescriptions = allPrescriptions.filter((rx) => {
    if (statusFilter !== 'ALL' && rx.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rx.medicationName.toLowerCase().includes(q) ||
        rx.patientName.toLowerCase().includes(q) ||
        rx.pharmacyName.toLowerCase().includes(q) ||
        rx.sig.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F0EEE6] border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5443] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7C8B6F]" />
            <span>DEA EPCS Certified Electronic Prescribing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#7C8B6F]" />
            Electronic Prescriptions Management (e-Rx)
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Active physician orders, Surescripts pharmacy transmissions, refills, and allergy safety verifications.
          </p>
        </div>

        <button
          onClick={() => onOpenNewPrescription()}
          className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-medium text-xs py-2.5 px-4 rounded-2xl transition shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write New e-Prescription</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by medication, patient name, pharmacy..."
            className="w-full bg-white border border-stone-200 rounded-2xl px-3.5 py-2 pl-9 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-500 font-medium">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-stone-200 text-stone-700 rounded-2xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
          >
            <option value="ALL">All Prescriptions ({allPrescriptions.length})</option>
            <option value="Electronically Transmitted">Transmitted to Pharmacy</option>
            <option value="Dispensed">Dispensed</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Prescriptions Grid */}
      <div className="space-y-3">
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-3xl p-12 text-center text-stone-500">
            <Pill className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-serif font-bold text-stone-800">No prescriptions match current query</p>
            <p className="text-xs mt-1">Try changing your search term or click "Write New e-Prescription".</p>
          </div>
        ) : (
          filteredPrescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white border border-stone-200/80 hover:bg-[#F2F4F0]/40 rounded-3xl p-5 shadow-xs transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-stone-900">{rx.medicationName}</span>
                    <span className="text-xs font-mono font-bold text-[#3E4738] bg-[#DCE2D1] px-2.5 py-0.5 rounded-lg border border-[#7C8B6F]/30">
                      {rx.dosage}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                      {rx.form} ({rx.route})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                    <span>Patient: </span>
                    <button
                      onClick={() => selectPatient(rx.patientId)}
                      className="font-semibold text-stone-900 hover:text-[#4A5443] hover:underline cursor-pointer"
                    >
                      {maskName(rx.patientName, phiMasked)}
                    </button>
                    <span>• DOB: {maskDob(rx.patientDob, phiMasked)}</span>
                    <span>• Prescribed: {rx.prescribedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                      rx.status === 'Dispensed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : rx.status === 'Electronically Transmitted'
                        ? 'bg-[#DCE2D1] text-[#3E4738] border-[#7C8B6F]/40'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {rx.status}
                  </span>

                  <button
                    onClick={() => selectPatient(rx.patientId)}
                    className="p-2 rounded-xl bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 cursor-pointer shadow-xs"
                    title="View patient chart"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/70 text-xs">
                <span className="font-semibold text-stone-700">SIG / Patient Instructions: </span>
                <span className="text-stone-800">{rx.sig}</span>
              </div>

              {/* Warnings or Overrides */}
              {rx.allergyConflictOverrideReason && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-red-900">Allergy Override Documented: </span>
                    <span>{rx.allergyConflictOverrideReason}</span>
                  </div>
                </div>
              )}

              {/* Pharmacy and DEA verification */}
              <div className="pt-2 border-t border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-500 gap-2">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-stone-400" />
                  <span>Routed Pharmacy: <strong className="text-stone-800 font-semibold">{rx.pharmacyName}</strong> ({rx.pharmacyAddress})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Qty: {rx.quantity} (#{rx.daysSupply} days)</span>
                  <span>•</span>
                  <span>Refills: {rx.refillsAllowed}</span>
                  <span>•</span>
                  <span className="font-mono text-[#4A5443] font-semibold truncate max-w-[120px]">
                    Sig: {rx.digitalSignatureHash}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
