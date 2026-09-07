import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import {
  Users,
  Search,
  Plus,
  Filter,
  Shield,
  Pill,
  Calendar,
  AlertTriangle,
  Stethoscope,
  Activity,
  FileText,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { maskName, maskMrn, maskPhone, calculateAge } from '../utils/hipaa';
import { Patient } from '../types';

interface PatientRecordsViewProps {
  onOpenNewPatient: () => void;
  onOpenNewPrescription: (patientId?: string) => void;
  onOpenNewAppointment: (patientId?: string) => void;
}

export const PatientRecordsView: React.FC<PatientRecordsViewProps> = ({
  onOpenNewPatient,
  onOpenNewPrescription,
  onOpenNewAppointment,
}) => {
  const { patients, phiMasked, selectPatient } = useDoctor();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filteredPatients = patients.filter((p) => {
    if (riskFilter !== 'ALL' && p.riskLevel !== riskFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchesName = fullName.includes(query);
    const matchesMrn = p.mrn.toLowerCase().includes(query);
    const matchesPhone = p.phone.includes(query);
    const matchesDob = p.dob.includes(query);
    const matchesDiagnosis = p.problemList.some(
      (pr) =>
        pr.diagnosis.toLowerCase().includes(query) ||
        pr.icd10Code.toLowerCase().includes(query)
    );
    const matchesAllergy = p.allergies.some((a) =>
      a.allergen.toLowerCase().includes(query)
    );

    return matchesName || matchesMrn || matchesPhone || matchesDob || matchesDiagnosis || matchesAllergy;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F0EEE6] border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5443] uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5 text-[#7C8B6F]" />
            <span>HIPAA-Encrypted Electronic Health Records</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#7C8B6F]" />
            Patient Health Records Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Searchable medical history, active diagnoses, allergy profiles, vital records, and clinical encounters.
          </p>
        </div>

        <button
          onClick={onOpenNewPatient}
          className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white text-xs font-medium py-2.5 px-4 rounded-2xl transition shadow-xs flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, MRN, phone, diagnosis (e.g. Hypertension)..."
            className="w-full bg-white border border-stone-200 rounded-2xl px-3.5 py-2.5 pl-9 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-stone-500 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-stone-400" /> Risk Tier:
          </span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-stone-200 text-stone-700 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
          >
            <option value="ALL">All Patients ({patients.length})</option>
            <option value="High Risk / Chronic">High Risk / Chronic</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatients.length === 0 ? (
          <div className="col-span-2 bg-white border border-stone-200/80 rounded-3xl p-12 text-center text-stone-500">
            <Users className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-serif font-bold text-stone-800">No patient records match "{searchQuery}"</p>
            <p className="text-xs mt-1">Try searching by clinical diagnosis (e.g. "Diabetes"), MRN, or register a new patient.</p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const age = calculateAge(patient.dob);
            const latestVitals = patient.vitalsHistory[0];

            return (
              <div
                key={patient.id}
                className="bg-white border border-stone-200/80 hover:bg-[#F2F4F0]/40 rounded-3xl p-5 shadow-xs transition space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Patient Demographics */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => selectPatient(patient.id)}
                          className="text-base font-serif font-bold text-stone-900 hover:text-[#4A5443] transition text-left cursor-pointer"
                        >
                          {maskName(`${patient.firstName} ${patient.lastName}`, phiMasked)}
                        </button>
                        <span className="text-xs text-stone-500">
                          ({patient.gender}, {age} yrs)
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        <span className="font-mono text-stone-700 font-medium">
                          {maskMrn(patient.mrn, phiMasked)}
                        </span>{' '}
                        • DOB: {patient.dob}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                        patient.riskLevel === 'High Risk / Chronic'
                          ? 'bg-red-50 text-red-700 border-red-200 font-semibold'
                          : patient.riskLevel === 'Moderate'
                          ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                      }`}
                    >
                      {patient.riskLevel}
                    </span>
                  </div>

                  {/* Diagnoses & Problem List */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                      Active Medical History / Diagnoses
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.problemList.length === 0 ? (
                        <span className="text-xs text-stone-400 italic">No chronic diagnoses documented</span>
                      ) : (
                        patient.problemList.map((prob) => (
                          <span
                            key={prob.id}
                            className="bg-stone-50 border border-stone-200 text-stone-700 text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                          >
                            <span className="text-[#4A5443] font-mono text-[10px] font-semibold">{prob.icd10Code}</span>
                            <span className="truncate max-w-[200px]">{prob.diagnosis}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Allergies Notice */}
                  {patient.allergies.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="truncate">
                        <span className="font-semibold">Allergies:</span>{' '}
                        {patient.allergies.map((a) => a.allergen).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Latest Triage Vitals snapshot */}
                  {latestVitals && (
                    <div className="mt-3 bg-stone-50 rounded-2xl p-3 border border-stone-200/70 text-xs flex items-center justify-between text-stone-700">
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <Activity className="w-3.5 h-3.5 text-[#7C8B6F]" />
                        <span>Last Vitals ({latestVitals.date}):</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span
                          className={`px-1.5 py-0.5 rounded-md ${
                            latestVitals.bpSystolic >= 140
                              ? 'bg-red-50 text-red-700 border border-red-200 font-semibold'
                              : 'bg-white border border-stone-200 text-stone-800'
                          }`}
                        >
                          BP {latestVitals.bpSystolic}/{latestVitals.bpDiastolic}
                        </span>
                        <span className="bg-white border border-stone-200 px-1.5 py-0.5 rounded-md text-stone-800">
                          HR {latestVitals.heartRate}
                        </span>
                        <span className="bg-white border border-stone-200 px-1.5 py-0.5 rounded-md text-stone-800">
                          SpO2 {latestVitals.oxygenSaturation}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500">
                    {patient.activePrescriptions.length} Active Rx • {patient.pastNotes.length} SOAP Notes
                  </span>

                  <div className="flex items-center gap-2 font-medium">
                    <button
                      onClick={() => onOpenNewPrescription(patient.id)}
                      className="bg-white hover:bg-stone-50 text-stone-700 px-3 py-1.5 rounded-xl border border-stone-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Create electronic prescription"
                    >
                      <Pill className="w-3.5 h-3.5 text-[#7C8B6F]" />
                      <span>Write e-Rx</span>
                    </button>
                    <button
                      onClick={() => selectPatient(patient.id)}
                      className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-white" />
                      <span>Full Chart</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
