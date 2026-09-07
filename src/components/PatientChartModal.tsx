import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import {
  X,
  Stethoscope,
  Activity,
  AlertTriangle,
  Pill,
  FileText,
  FlaskConical,
  Phone,
  Shield,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';
import { maskName, maskMrn, maskPhone, maskDob, maskAddress, calculateAge } from '../utils/hipaa';

interface PatientChartModalProps {
  onClose: () => void;
  onOpenNewPrescription: (patientId: string) => void;
  onOpenSoapModal: (patientId: string) => void;
  onOpenVitalsModal: (patientId: string) => void;
}

export const PatientChartModal: React.FC<PatientChartModalProps> = ({
  onClose,
  onOpenNewPrescription,
  onOpenSoapModal,
  onOpenVitalsModal,
}) => {
  const { selectedPatient, phiMasked, updatePatient } = useDoctor();
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'problems' | 'allergies' | 'prescriptions' | 'notes' | 'labs'>('overview');
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [newIcdCode, setNewIcdCode] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');

  if (!selectedPatient) return null;

  const age = calculateAge(selectedPatient.dob);
  const latestVitals = selectedPatient.vitalsHistory[0];

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagnosis.trim()) return;

    const newProb = {
      id: `prb-${Date.now()}`,
      icd10Code: newIcdCode.trim() || 'Z00.00',
      diagnosis: newDiagnosis.trim(),
      status: 'Active' as const,
      dateDiagnosed: new Date().toISOString().split('T')[0],
    };

    updatePatient({
      ...selectedPatient,
      problemList: [newProb, ...selectedPatient.problemList],
    });

    setNewIcdCode('');
    setNewDiagnosis('');
    setShowAddProblem(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-800">
        {/* Top Header Banner */}
        <div className="bg-[#F0EEE6] border-b border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE2D1] border border-[#7C8B6F]/30 flex items-center justify-center text-[#4A5443] shadow-xs shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  {maskName(`${selectedPatient.firstName} ${selectedPatient.lastName}`, phiMasked)}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-stone-700 font-mono">
                  {maskMrn(selectedPatient.mrn, phiMasked)}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                    selectedPatient.riskLevel === 'High Risk / Chronic'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {selectedPatient.riskLevel}
                </span>
              </div>

              <div className="text-xs text-stone-600 flex flex-wrap items-center gap-3 mt-1">
                <span>DOB: {maskDob(selectedPatient.dob, phiMasked)} ({age} yrs)</span>
                <span>•</span>
                <span>Gender: {selectedPatient.gender}</span>
                <span>•</span>
                <span>Phone: {maskPhone(selectedPatient.phone, phiMasked)}</span>
                <span>•</span>
                <span className="text-[#4A5443] font-medium">Ins: {selectedPatient.insurance.provider}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onOpenNewPrescription(selectedPatient.id)}
              className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white text-xs font-medium py-2 px-3 rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Write e-Rx</span>
            </button>

            <button
              onClick={() => onOpenSoapModal(selectedPatient.id)}
              className="bg-[#DCE2D1] hover:bg-[#c9d1bd] text-[#3E4738] border border-[#7C8B6F]/30 text-xs font-medium py-2 px-3 rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>+ SOAP Note</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 border border-stone-200 transition cursor-pointer"
              title="Close chart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#FAF9F5] border-b border-stone-200 px-4 flex items-center gap-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#7C8B6F] text-[#4A5443] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Clinical Overview
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'problems'
                ? 'border-[#7C8B6F] text-[#4A5443] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Medical Problems ({selectedPatient.problemList.length})
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'vitals'
                ? 'border-[#7C8B6F] text-[#4A5443] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Vitals History ({selectedPatient.vitalsHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('allergies')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'allergies'
                ? 'border-[#7C8B6F] text-[#4A5443] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Allergies ({selectedPatient.allergies.length})
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'prescriptions'
                ? 'border-[#7C8B6F] text-[#4A5443] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Active e-Rx ({selectedPatient.activePrescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'notes'
                ? 'border-[#7C8B6F] text-[#4A5443] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            SOAP Encounters ({selectedPatient.pastNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'labs'
                ? 'border-[#7C8B6F] text-[#4A5443] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Lab Reports ({selectedPatient.labResults.length})
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* TAB 1: Clinical Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Emergency Banner if Allergies exist */}
              {selectedPatient.allergies.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-3 text-rose-900">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-900">Allergy Alert</h4>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Patient has {selectedPatient.allergies.length} documented adverse reaction(s):{' '}
                      {selectedPatient.allergies.map((a) => `${a.allergen} (${a.reaction})`).join('; ')}
                    </p>
                  </div>
                </div>
              )}

              {/* 3 Col Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Demographics & Insurance */}
                <div className="bg-[#F0EEE6] border border-stone-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A5443]">
                    Demographics & Insurance
                  </h4>
                  <div className="space-y-1.5 text-stone-700">
                    <p>
                      <span className="text-stone-500 font-medium">Address: </span>
                      {maskAddress(selectedPatient.address, phiMasked)}
                    </p>
                    <p>
                      <span className="text-stone-500 font-medium">Emergency: </span>
                      {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relationship}) -{' '}
                      {maskPhone(selectedPatient.emergencyContact.phone, phiMasked)}
                    </p>
                    <p>
                      <span className="text-stone-500 font-medium">Insurance: </span>
                      {selectedPatient.insurance.provider}
                    </p>
                    <p>
                      <span className="text-stone-500 font-medium">Policy ID: </span>
                      {selectedPatient.insurance.policyNumber} (Copay: ${selectedPatient.insurance.copay})
                    </p>
                  </div>
                </div>

                {/* Preferred Pharmacy */}
                <div className="bg-[#F0EEE6] border border-stone-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A5443]">
                    Preferred Surescripts Pharmacy
                  </h4>
                  <div className="space-y-1.5 text-stone-700">
                    <p className="font-semibold text-stone-900">{selectedPatient.preferredPharmacy.name}</p>
                    <p className="text-stone-600">{selectedPatient.preferredPharmacy.address}</p>
                    <p>
                      <span className="text-stone-500 font-medium">Phone: </span>
                      {selectedPatient.preferredPharmacy.phone}
                    </p>
                    <p>
                      <span className="text-stone-500 font-medium">NCPDP ID: </span>
                      <span className="font-mono text-[#4A5443] font-medium">{selectedPatient.preferredPharmacy.ncpdp}</span>
                    </p>
                  </div>
                </div>

                {/* Latest Triage Vitals */}
                <div className="bg-[#F0EEE6] border border-stone-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A5443]">
                      Triage Vitals Snapshot
                    </h4>
                    <button
                      onClick={() => onOpenVitalsModal(selectedPatient.id)}
                      className="text-[10px] text-[#4A5443] hover:underline font-semibold cursor-pointer"
                    >
                      + Record New
                    </button>
                  </div>
                  {latestVitals ? (
                    <div className="grid grid-cols-2 gap-2 text-stone-800">
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Blood Pressure</span>
                        <span
                          className={`font-bold font-mono ${
                            latestVitals.bpSystolic >= 140 ? 'text-rose-700' : 'text-stone-900'
                          }`}
                        >
                          {latestVitals.bpSystolic} / {latestVitals.bpDiastolic} mmHg
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Heart Rate</span>
                        <span className="font-bold font-mono text-stone-900">{latestVitals.heartRate} bpm</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Oxygen (SpO2)</span>
                        <span className="font-bold font-mono text-[#4A5443]">
                          {latestVitals.oxygenSaturation}%
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Body Mass Index</span>
                        <span className="font-bold font-mono text-stone-900">{latestVitals.bmi} BMI</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-stone-500 italic">No vitals recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Active Problems Summary */}
              <div className="bg-[#F0EEE6] border border-stone-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A5443]">
                    Active Clinical Problem List
                  </h4>
                  <button
                    onClick={() => setActiveTab('problems')}
                    className="text-[11px] text-[#4A5443] hover:underline font-semibold cursor-pointer"
                  >
                    Manage Problem List →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPatient.problemList.map((prb) => (
                    <div
                      key={prb.id}
                      className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-mono text-[10px] text-[#3E4738] bg-[#DCE2D1] px-1.5 py-0.5 rounded-lg border border-[#7C8B6F]/30 mr-2 font-medium">
                          {prb.icd10Code}
                        </span>
                        <span className="font-medium text-stone-900">{prb.diagnosis}</span>
                        {prb.notes && <p className="text-[11px] text-stone-500 mt-1">{prb.notes}</p>}
                      </div>
                      <span className="text-[10px] text-stone-500 shrink-0">{prb.dateDiagnosed}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Medical Problems */}
          {activeTab === 'problems' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-stone-900 text-sm">Documented Medical Diagnoses (ICD-10)</h4>
                <button
                  onClick={() => setShowAddProblem(!showAddProblem)}
                  className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white text-xs px-3 py-1.5 rounded-2xl transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Diagnosis</span>
                </button>
              </div>

              {showAddProblem && (
                <form
                  onSubmit={handleAddProblem}
                  className="bg-[#F0EEE6] p-4 rounded-2xl border border-stone-200 space-y-3"
                >
                  <h5 className="font-semibold text-stone-900 text-xs">Add New Clinical Problem</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">ICD-10 Code</label>
                      <input
                        type="text"
                        value={newIcdCode}
                        onChange={(e) => setNewIcdCode(e.target.value)}
                        placeholder="e.g. I10 or E11.9"
                        className="w-full bg-white border border-stone-200 rounded-xl p-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-stone-600 mb-1">Diagnosis Description</label>
                      <input
                        type="text"
                        value={newDiagnosis}
                        onChange={(e) => setNewDiagnosis(e.target.value)}
                        placeholder="e.g. Chronic Kidney Disease Stage 3"
                        className="w-full bg-white border border-stone-200 rounded-xl p-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProblem(false)}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-xl border border-stone-200 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white px-4 py-1.5 rounded-xl text-xs font-medium shadow-xs cursor-pointer"
                    >
                      Save to Problem List
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {selectedPatient.problemList.map((prb) => (
                  <div
                    key={prb.id}
                    className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#3E4738] bg-[#DCE2D1] px-2 py-0.5 rounded-lg border border-[#7C8B6F]/30">
                          {prb.icd10Code}
                        </span>
                        <span className="font-semibold text-stone-900 text-sm">{prb.diagnosis}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                          {prb.status}
                        </span>
                      </div>
                      {prb.notes && <p className="text-stone-600 text-xs mt-1 pl-1">{prb.notes}</p>}
                    </div>
                    <span className="text-[11px] text-stone-500">Diagnosed: {prb.dateDiagnosed}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Vitals History */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-stone-900 text-sm">Vitals & Biometric Trend Log</h4>
                <button
                  onClick={() => onOpenVitalsModal(selectedPatient.id)}
                  className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white text-xs px-3 py-1.5 rounded-2xl transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Triage Vitals</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F0EEE6] border-b border-stone-200 text-stone-600 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Blood Pressure</th>
                      <th className="py-2.5 px-3">Pulse</th>
                      <th className="py-2.5 px-3">SpO2</th>
                      <th className="py-2.5 px-3">Temp</th>
                      <th className="py-2.5 px-3">Weight & BMI</th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-mono">
                    {selectedPatient.vitalsHistory.map((vit) => (
                      <tr key={vit.id} className="hover:bg-[#FAF9F5] transition">
                        <td className="py-2.5 px-3 text-stone-800">{vit.date}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold ${
                              vit.bpSystolic >= 140
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'text-stone-900'
                            }`}
                          >
                            {vit.bpSystolic}/{vit.bpDiastolic} mmHg
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-800">{vit.heartRate} bpm</td>
                        <td className="py-2.5 px-3 text-[#4A5443] font-bold">{vit.oxygenSaturation}%</td>
                        <td className="py-2.5 px-3 text-stone-800">{vit.tempFahrenheit}°F</td>
                        <td className="py-2.5 px-3 text-stone-800">
                          {vit.weightLbs} lbs ({vit.bmi} BMI)
                        </td>
                        <td className="py-2.5 px-3 font-sans text-stone-600">{vit.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Allergies */}
          {activeTab === 'allergies' && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-stone-900 text-sm">Allergies & Adverse Drug Reactions</h4>
              {selectedPatient.allergies.length === 0 ? (
                <div className="bg-[#F0EEE6] p-6 rounded-2xl border border-stone-200 text-center text-stone-600">
                  <CheckCircle2 className="w-8 h-8 text-[#7C8B6F] mx-auto mb-2" />
                  <p className="font-medium text-stone-800">No Known Drug Allergies (NKDA)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPatient.allergies.map((alg) => (
                    <div
                      key={alg.id}
                      className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-900 text-sm">{alg.allergen}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-medium">
                            {alg.severity}
                          </span>
                          <span className="text-[10px] text-stone-500">{alg.type}</span>
                        </div>
                        <p className="text-stone-700 text-xs mt-1">
                          <span className="text-stone-500 font-medium">Manifestation: </span>
                          {alg.reaction}
                        </p>
                      </div>
                      <span className="text-[11px] text-stone-500">Documented: {alg.dateIdentified}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Prescriptions */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-stone-900 text-sm">Active Electronic Prescriptions (e-Rx)</h4>
                <button
                  onClick={() => onOpenNewPrescription(selectedPatient.id)}
                  className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white text-xs px-3 py-1.5 rounded-2xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Write New e-Prescription</span>
                </button>
              </div>

              {selectedPatient.activePrescriptions.length === 0 ? (
                <div className="bg-[#F0EEE6] p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
                  <Pill className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="font-medium text-stone-700">No active prescriptions on file</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPatient.activePrescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="bg-[#F0EEE6] p-4 rounded-2xl border border-stone-200 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-stone-900 text-sm">{rx.medicationName}</span>
                            <span className="text-[#4A5443] font-mono text-xs font-semibold">{rx.dosage}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200">
                              {rx.form} ({rx.route})
                            </span>
                          </div>
                          <p className="text-xs text-stone-700 mt-1">
                            <span className="text-stone-500 font-semibold">SIG: </span>
                            {rx.sig}
                          </p>
                        </div>

                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto font-medium">
                          {rx.status}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center justify-between text-[11px] text-stone-600 gap-2">
                        <span>Qty: {rx.quantity} • Refills: {rx.refillsAllowed} • Days Supply: {rx.daysSupply}</span>
                        <span>Pharmacy: {rx.pharmacyName}</span>
                        <span className="font-mono text-[#4A5443] font-medium">Sig: {rx.digitalSignatureHash}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SOAP Encounter Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-stone-900 text-sm">Physician Consultation Notes (SOAP Format)</h4>
                <button
                  onClick={() => onOpenSoapModal(selectedPatient.id)}
                  className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white text-xs px-3 py-1.5 rounded-2xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>+ New SOAP Consultation Note</span>
                </button>
              </div>

              {selectedPatient.pastNotes.length === 0 ? (
                <div className="bg-[#F0EEE6] p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
                  <FileText className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="font-medium text-stone-700">No clinical notes recorded for this patient yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPatient.pastNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-[#F0EEE6] p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <div>
                          <span className="font-serif font-bold text-stone-900 text-sm">{note.chiefComplaint}</span>
                          <p className="text-[11px] text-[#4A5443] font-medium mt-0.5">Author: {note.authorName}</p>
                        </div>
                        <span className="text-xs text-stone-500">{note.date}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                        <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                          <span className="font-bold text-[#4A5443] block mb-1">Subjective (S):</span>
                          <p className="text-stone-700">{note.subjective}</p>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                          <span className="font-bold text-[#4A5443] block mb-1">Objective (O):</span>
                          <p className="text-stone-700">{note.objective}</p>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                          <span className="font-bold text-[#4A5443] block mb-1">Assessment (A):</span>
                          <p className="text-stone-700">{note.assessment}</p>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                          <span className="font-bold text-[#4A5443] block mb-1">Plan (P):</span>
                          <p className="text-stone-700">{note.plan}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Lab Reports */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-stone-900 text-sm">Diagnostic Lab Results & Chemistry</h4>
              {selectedPatient.labResults.length === 0 ? (
                <div className="bg-[#F0EEE6] p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
                  <FlaskConical className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="font-medium text-stone-700">No recent lab reports on file</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPatient.labResults.map((lab) => (
                    <div
                      key={lab.id}
                      className={`p-4 rounded-2xl border ${
                        lab.status === 'Critical'
                          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                          : lab.status === 'Abnormal'
                          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                          : 'bg-[#F0EEE6] border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-serif font-bold text-stone-900 text-sm">{lab.testName}</h5>
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                lab.status === 'Critical'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : lab.status === 'Abnormal'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-stone-100 text-stone-700 border border-stone-200'
                              }`}
                            >
                              {lab.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500">Category: {lab.category}</span>
                        </div>
                        <span className="text-xs text-stone-500">{lab.dateCompleted}</span>
                      </div>

                      <div className="bg-white rounded-xl p-3 border border-stone-200 font-mono flex items-center justify-between text-xs">
                        <div>
                          <span className="text-stone-500">Measured Value: </span>
                          <span className="font-bold text-base text-stone-900">{lab.value}</span>
                        </div>
                        <div className="text-stone-500">
                          Reference Range: <span className="text-stone-700">{lab.referenceRange}</span>
                        </div>
                      </div>

                      {lab.interpretation && (
                        <p className="text-xs mt-2 leading-relaxed text-stone-700 font-sans">
                          <span className="font-bold text-stone-900">Clinical Interpretation: </span>
                          {lab.interpretation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
