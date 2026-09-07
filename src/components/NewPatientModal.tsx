import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import { X, UserPlus, Shield, AlertTriangle, Building, Phone } from 'lucide-react';
import { PHARMACIES } from '../data/mockData';

interface NewPatientModalProps {
  onClose: () => void;
  onSuccess: (patientId: string) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ onClose, onSuccess }) => {
  const { addPatient } = useDoctor();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1985-06-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState('(555) 492-1029');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('100 Main St, Los Angeles, CA');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('Blue Shield California');
  const [policyNumber, setPolicyNumber] = useState('BSC-8492018');
  const [pharmacyNcpdp, setPharmacyNcpdp] = useState(PHARMACIES[0].ncpdp);
  const [allergen, setAllergen] = useState('');
  const [allergySeverity, setAllergySeverity] = useState<'Mild' | 'Moderate' | 'Severe / Anaphylaxis'>('Moderate');
  const [initialProblem, setInitialProblem] = useState('');
  const [initialIcd, setInitialIcd] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const chosenPharmacy = PHARMACIES.find((p) => p.ncpdp === pharmacyNcpdp) || PHARMACIES[0];

    const newPatient = addPatient({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob,
      gender,
      phone: phone.trim(),
      email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      address: address.trim(),
      emergencyContact: {
        name: emergencyName.trim() || 'Primary Contact',
        relationship: emergencyRel,
        phone: emergencyPhone.trim() || phone.trim(),
      },
      insurance: {
        provider: insuranceProvider.trim(),
        policyNumber: policyNumber.trim(),
        groupNumber: 'GRP-100',
        copay: 25,
      },
      preferredPharmacy: {
        name: chosenPharmacy.name,
        ncpdp: chosenPharmacy.ncpdp,
        address: chosenPharmacy.address,
        phone: chosenPharmacy.phone,
      },
      riskLevel: allergen.trim() ? 'Moderate' : 'Low',
      allergies: allergen.trim()
        ? [
            {
              id: `alg-${Date.now()}`,
              allergen: allergen.trim(),
              type: 'Medication',
              reaction: 'Documented hypersensitivity',
              severity: allergySeverity,
              dateIdentified: new Date().toISOString().split('T')[0],
            },
          ]
        : [],
      problemList: initialProblem.trim()
        ? [
            {
              id: `prb-${Date.now()}`,
              icd10Code: initialIcd.trim() || 'Z00.00',
              diagnosis: initialProblem.trim(),
              status: 'Active',
              dateDiagnosed: new Date().toISOString().split('T')[0],
            },
          ]
        : [],
      vitalsHistory: [
        {
          id: `vit-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          bpSystolic: 120,
          bpDiastolic: 80,
          heartRate: 72,
          tempFahrenheit: 98.6,
          oxygenSaturation: 99,
          respiratoryRate: 14,
          bmi: 23.5,
          weightLbs: 155,
          heightInches: 68,
          notes: 'Intake triage vitals',
        },
      ],
      activePrescriptions: [],
      pastNotes: [],
      labResults: [],
    });

    onSuccess(newPatient.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-800">
        <div className="bg-[#F0EEE6] border-b border-stone-200 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE2D1] border border-[#7C8B6F]/30 flex items-center justify-center text-[#4A5443] shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Register New Patient Record</h3>
              <p className="text-xs text-stone-600">HIPAA Compliant Electronic Chart Intake</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition border border-stone-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Jordan"
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Miller"
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
          </div>

          {/* DOB & Gender & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Date of Birth *</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Contact Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-stone-700 font-medium mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address, City, State, ZIP"
              className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
            />
          </div>

          {/* Insurance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Insurance Carrier</label>
              <input
                type="text"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="e.g. Aetna, Blue Cross, Medicare"
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Policy ID Number</label>
              <input
                type="text"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="e.g. POL-8492010"
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
              />
            </div>
          </div>

          {/* Preferred Pharmacy */}
          <div>
            <label className="block text-stone-700 font-medium mb-1">Preferred Pharmacy</label>
            <select
              value={pharmacyNcpdp}
              onChange={(e) => setPharmacyNcpdp(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
            >
              {PHARMACIES.map((p) => (
                <option key={p.ncpdp} value={p.ncpdp}>
                  {p.name} — {p.address}
                </option>
              ))}
            </select>
          </div>

          {/* Allergy intake */}
          <div className="p-3.5 bg-[#F0EEE6] rounded-2xl border border-stone-200 space-y-2">
            <span className="font-medium text-stone-800 block">Initial Allergy (if any)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={allergen}
                  onChange={(e) => setAllergen(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa, Latex (Leave blank if NKDA)"
                  className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                />
              </div>
              <div>
                <select
                  value={allergySeverity}
                  onChange={(e) => setAllergySeverity(e.target.value as any)}
                  className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe / Anaphylaxis">Severe / Anaphylaxis</option>
                </select>
              </div>
            </div>
          </div>

          {/* Initial Diagnosis */}
          <div className="p-3.5 bg-[#F0EEE6] rounded-2xl border border-stone-200 space-y-2">
            <span className="font-medium text-stone-800 block">Primary Diagnosis / Chief Complaint</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  value={initialIcd}
                  onChange={(e) => setInitialIcd(e.target.value)}
                  placeholder="ICD-10 (e.g. I10)"
                  className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={initialProblem}
                  onChange={(e) => setInitialProblem(e.target.value)}
                  placeholder="Diagnosis name (e.g. Essential Hypertension)"
                  className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-2xl border border-stone-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-semibold px-5 py-2.5 rounded-2xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Patient & Generate MRN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
