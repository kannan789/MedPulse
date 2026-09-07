import React, { useState, useEffect } from 'react';
import { useDoctor } from '../context/DoctorContext';
import {
  X,
  Pill,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Building,
  Printer,
  FileCheck,
  ArrowRight,
  Send,
  AlertOctagon,
} from 'lucide-react';
import { COMMON_MEDICATIONS, PHARMACIES } from '../data/mockData';
import { checkDrugAllergies, checkDrugDrugInteractions, maskName } from '../utils/hipaa';
import { Prescription } from '../types';

interface PrescriptionModalProps {
  initialPatientId?: string;
  onClose: () => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  initialPatientId,
  onClose,
}) => {
  const { doctor, patients, createPrescription, phiMasked } = useDoctor();

  const [selectedPatientId, setSelectedPatientId] = useState(
    initialPatientId || (patients.length > 0 ? patients[0].id : '')
  );

  const patient = patients.find((p) => p.id === selectedPatientId);

  const [medicationSearch, setMedicationSearch] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<string>('Lisinopril');
  const [dosage, setDosage] = useState('20 mg');
  const [form, setForm] = useState<'Tablet' | 'Capsule' | 'Liquid' | 'Inhaler' | 'Injection' | 'Topical'>('Tablet');
  const [route, setRoute] = useState<'Oral' | 'Sublingual' | 'Inhalation' | 'Subcutaneous' | 'Topical'>('Oral');
  const [sig, setSig] = useState('Take 1 tablet by mouth once daily in the morning');
  const [quantity, setQuantity] = useState(90);
  const [refillsAllowed, setRefillsAllowed] = useState(3);
  const [daysSupply, setDaysSupply] = useState(90);
  const [selectedPharmacyNcpdp, setSelectedPharmacyNcpdp] = useState(
    patient?.preferredPharmacy.ncpdp || PHARMACIES[0].ncpdp
  );
  const [overrideReason, setOverrideReason] = useState('');
  const [transmittedRx, setTransmittedRx] = useState<Prescription | null>(null);

  // Update defaults when chosen medication changes
  useEffect(() => {
    const med = COMMON_MEDICATIONS.find(
      (m) => m.name.toLowerCase() === selectedMedication.toLowerCase()
    );
    if (med) {
      setDosage(med.strengths[0] || '10 mg');
      setForm(med.forms[0] || 'Tablet');
      setRoute(med.routes[0] || 'Oral');
      setSig(med.defaultSig || 'Take 1 tablet by mouth daily');
      setQuantity(med.defaultQuantity || 30);
      setRefillsAllowed(med.defaultRefills || 0);
    }
  }, [selectedMedication]);

  // Real-time safety validation
  const allergyCheck = patient ? checkDrugAllergies(patient, selectedMedication) : { hasConflict: false, conflictDetails: [], severity: 'None' as const };
  const interactionCheck = patient ? checkDrugDrugInteractions(patient, selectedMedication) : [];

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    if (allergyCheck.hasConflict && !overrideReason.trim()) {
      alert('Clinical override rationale is mandatory when prescribing a medication with a documented allergy conflict.');
      return;
    }

    const pharmacy =
      PHARMACIES.find((p) => p.ncpdp === selectedPharmacyNcpdp) || {
        name: patient.preferredPharmacy.name,
        ncpdp: patient.preferredPharmacy.ncpdp,
        address: patient.preferredPharmacy.address,
      };

    const newRx = createPrescription({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientDob: patient.dob,
      medicationName: selectedMedication,
      genericName: selectedMedication,
      dosage,
      form,
      route,
      sig,
      quantity,
      refillsAllowed,
      daysSupply,
      pharmacyName: pharmacy.name,
      pharmacyNcpdp: pharmacy.ncpdp,
      pharmacyAddress: pharmacy.address,
      allergyConflictOverrideReason: overrideReason.trim() || undefined,
      drugInteractionWarning: interactionCheck.length > 0 ? interactionCheck.map((i) => i.description).join('; ') : undefined,
    });

    setTransmittedRx(newRx);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-stone-800">
        {/* Header */}
        <div className="bg-[#F0EEE6] border-b border-stone-200 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE2D1] border border-[#7C8B6F]/30 flex items-center justify-center text-[#4A5443] shadow-xs">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                Electronic Prescription System (e-Rx)
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#DCE2D1] text-[#3E4738] border border-[#7C8B6F]/40 font-sans">
                  Surescripts Ready
                </span>
              </h2>
              <p className="text-xs text-stone-600">
                DEA Certified EPCS • Prescriber: {doctor.name} (NPI: {doctor.npi}, DEA: {doctor.dea})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition border border-stone-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {!transmittedRx ? (
            <form onSubmit={handleTransmit} className="space-y-4">
              {/* Patient Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Select Patient Record <span className="text-[#7C8B6F]">*</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2.5 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {maskName(`${p.firstName} ${p.lastName}`, phiMasked)} ({p.mrn} • DOB: {p.dob})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Allergies Banner */}
              {patient && patient.allergies.length > 0 && (
                <div className="bg-[#F0EEE6] p-3 rounded-2xl border border-stone-200 flex items-center justify-between text-stone-700">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>
                      <span className="font-semibold text-stone-900">Patient Allergies on File:</span>{' '}
                      {patient.allergies.map((a) => `${a.allergen} (${a.severity})`).join(', ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Real-time Allergy Conflict Alert */}
              {allergyCheck.hasConflict && (
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-red-900 space-y-2 animate-pulse">
                  <div className="flex items-center gap-2 font-bold text-sm text-red-800">
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                    <span>HIGH SEVERITY ALLERGY CONFLICT FLAGGED!</span>
                  </div>
                  <p className="text-xs text-red-800">
                    The chosen medication <span className="font-bold underline">{selectedMedication}</span> is contraindicated for this patient due to:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-red-700 text-[11px]">
                    {allergyCheck.conflictDetails.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-red-200">
                    <label className="block text-[11px] font-bold text-stone-900 mb-1">
                      Mandatory Clinical Override Justification:
                    </label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Desensitization completed / Patient tolerated alternative cephalosporin / Benefit outweighs risk"
                      className="w-full bg-white border border-red-300 rounded-xl p-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Drug-Drug Interaction warning */}
              {interactionCheck.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Potential Drug-Drug Interaction Detected</span>
                  </div>
                  {interactionCheck.map((inter, i) => (
                    <p key={i} className="text-[11px] text-amber-800">
                      • Interaction with existing <span className="font-semibold text-amber-900">{inter.interactingDrug}</span>: {inter.description}
                    </p>
                  ))}
                </div>
              )}

              {/* Medication Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Select Medication from Formulary
                  </label>
                  <select
                    value={selectedMedication}
                    onChange={(e) => setSelectedMedication(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                  >
                    {COMMON_MEDICATIONS.map((med) => (
                      <option key={med.name} value={med.name}>
                        {med.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Strength / Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 20 mg"
                    className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                    required
                  />
                </div>
              </div>

              {/* Form & Route & Refills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Form</label>
                  <select
                    value={form}
                    onChange={(e) => setForm(e.target.value as any)}
                    className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Liquid">Liquid</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Injection">Injection</option>
                    <option value="Topical">Topical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Route</label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value as any)}
                    className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                  >
                    <option value="Oral">Oral</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Subcutaneous">Subcutaneous</option>
                    <option value="Topical">Topical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Refills</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={refillsAllowed}
                    onChange={(e) => setRefillsAllowed(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                  />
                </div>
              </div>

              {/* SIG Instructions */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Patient Instructions (SIG)
                </label>
                <textarea
                  rows={2}
                  value={sig}
                  onChange={(e) => setSig(e.target.value)}
                  placeholder="e.g. Take 1 tablet by mouth daily in the morning with water"
                  className="w-full bg-white border border-stone-200 rounded-2xl p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                  required
                />
              </div>

              {/* Pharmacy Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Destination Pharmacy (Surescripts Certified)
                </label>
                <select
                  value={selectedPharmacyNcpdp}
                  onChange={(e) => setSelectedPharmacyNcpdp(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2.5 text-stone-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                >
                  {PHARMACIES.map((pharm) => (
                    <option key={pharm.ncpdp} value={pharm.ncpdp}>
                      {pharm.name} — {pharm.address} (NCPDP: {pharm.ncpdp})
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Digital Signature Preview */}
              <div className="bg-[#F0EEE6] p-3.5 rounded-2xl border border-stone-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#7C8B6F]" /> Authorized DEA Digital Signature
                  </span>
                  <span className="text-[11px] text-[#4A5443] font-mono font-medium">NPI: {doctor.npi}</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  By clicking 'Sign & Transmit Prescription', you affix your cryptographically verifiable digital signature pursuant to DEA 21 CFR Part 1311.
                </p>
              </div>

              {/* Submit / Transmit */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-2xl text-xs font-medium cursor-pointer border border-stone-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-semibold px-6 py-2.5 rounded-2xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Sign & Electronically Transmit to Pharmacy</span>
                </button>
              </div>
            </form>
          ) : (
            /* Transmitted Success & Prescription Printable Slip */
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-sm">Prescription Electronically Transmitted</h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Surescripts confirmation receipt generated. Routing to {transmittedRx.pharmacyName}.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#7C8B6F]" />
                  <span>Print Slip</span>
                </button>
              </div>

              {/* Official Electronic Prescription Slip */}
              <div className="bg-white text-stone-900 p-6 rounded-3xl border border-stone-200 font-sans shadow-sm space-y-4">
                {/* Header Clinic & Prescriber */}
                <div className="flex items-start justify-between border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="text-base font-serif font-bold uppercase tracking-tight text-stone-900">{doctor.clinicName}</h3>
                    <p className="text-xs text-stone-600">{doctor.clinicAddress} • {doctor.clinicPhone}</p>
                    <p className="text-xs font-bold text-stone-800 mt-1">
                      {doctor.name} • {doctor.title}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-mono font-semibold">NPI: {doctor.npi}</p>
                    <p className="font-mono font-semibold">DEA: {doctor.dea}</p>
                    <p className="text-[11px] text-stone-500">Date: {transmittedRx.prescribedDate}</p>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="grid grid-cols-2 gap-2 text-xs border-b border-stone-200 pb-3">
                  <div>
                    <p className="font-bold">
                      Patient: <span className="font-normal">{transmittedRx.patientName}</span>
                    </p>
                    <p>
                      DOB: <span className="font-normal">{transmittedRx.patientDob}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      Rx ID: <span className="font-mono font-normal">{transmittedRx.id}</span>
                    </p>
                    <p className="text-stone-600">Dispense to: {transmittedRx.pharmacyName}</p>
                  </div>
                </div>

                {/* Rx Symbol & Medication */}
                <div className="py-2 space-y-2">
                  <div className="text-3xl font-serif font-bold text-stone-800">℞</div>
                  <div className="pl-6 space-y-1">
                    <p className="text-base font-bold text-stone-900">
                      {transmittedRx.medicationName} {transmittedRx.dosage} ({transmittedRx.form})
                    </p>
                    <p className="text-xs font-medium text-stone-700">
                      SIG: {transmittedRx.sig}
                    </p>
                    <p className="text-xs text-stone-600">
                      Quantity: #{transmittedRx.quantity} ({transmittedRx.daysSupply} Days Supply) • Refills Allowed: {transmittedRx.refillsAllowed}
                    </p>
                  </div>
                </div>

                {/* Digital Verification & Barcode */}
                <div className="border-t border-stone-200 pt-3 flex items-center justify-between text-xs text-stone-500">
                  <div>
                    <p className="font-mono text-[10px]">
                      Digital Signature Token: {transmittedRx.digitalSignatureHash}
                    </p>
                    <p className="text-[10px]">EPCS Certified Transmission via Surescripts Healthcare Network</p>
                  </div>
                  <div className="font-mono text-xs font-bold border border-stone-300 px-2.5 py-1 bg-stone-50 rounded-lg">
                    ||||| ||| ||||||| |||| |||||
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-semibold px-6 py-2.5 rounded-2xl text-xs cursor-pointer shadow-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
