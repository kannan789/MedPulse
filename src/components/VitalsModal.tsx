import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import { X, Activity, CheckCircle2 } from 'lucide-react';
import { maskName } from '../utils/hipaa';

interface VitalsModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const VitalsModal: React.FC<VitalsModalProps> = ({
  patientId,
  onClose,
  onSuccess,
}) => {
  const { patients, updatePatient, phiMasked, logHipaaAction } = useDoctor();

  const patient = patients.find((p) => p.id === patientId);

  const [systolic, setSystolic] = useState(128);
  const [diastolic, setDiastolic] = useState(82);
  const [heartRate, setHeartRate] = useState(74);
  const [oxygenSaturation, setOxygenSaturation] = useState(98);
  const [tempFahrenheit, setTempFahrenheit] = useState(98.4);
  const [respiratoryRate, setRespiratoryRate] = useState(16);
  const [weightLbs, setWeightLbs] = useState(168);
  const [heightInches, setHeightInches] = useState(69);
  const [notes, setNotes] = useState('Seated position, right arm, standard cuff.');

  if (!patient) return null;

  // Calculate BMI: (weight in lbs / (height in inches)^2) * 703
  const calculatedBmi = Number(
    ((weightLbs / (heightInches * heightInches)) * 703).toFixed(1)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newVital = {
      id: `vit-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      bpSystolic: Number(systolic),
      bpDiastolic: Number(diastolic),
      heartRate: Number(heartRate),
      tempFahrenheit: Number(tempFahrenheit),
      oxygenSaturation: Number(oxygenSaturation),
      respiratoryRate: Number(respiratoryRate),
      bmi: calculatedBmi,
      weightLbs: Number(weightLbs),
      heightInches: Number(heightInches),
      notes: notes.trim(),
    };

    updatePatient({
      ...patient,
      vitalsHistory: [newVital, ...patient.vitalsHistory],
    });

    logHipaaAction(
      'EDIT_RECORD',
      `Recorded triage vitals: BP ${systolic}/${diastolic}, HR ${heartRate}, SpO2 ${oxygenSaturation}%.`,
      patient.id,
      `${patient.firstName} ${patient.lastName}`,
      patient.mrn
    );

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-800">
        <div className="bg-[#F0EEE6] border-b border-stone-200 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE2D1] border border-[#7C8B6F]/30 flex items-center justify-center text-[#4A5443] shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Record Triage Vitals</h3>
              <p className="text-xs text-stone-600">
                Patient: {maskName(`${patient.firstName} ${patient.lastName}`, phiMasked)} ({patient.mrn})
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Blood Pressure */}
          <div className="bg-[#F0EEE6] p-3.5 rounded-2xl border border-stone-200 space-y-2">
            <label className="block text-stone-800 font-medium">Blood Pressure (mmHg) *</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-stone-500 block mb-1">Systolic</span>
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block mb-1">Diastolic</span>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                  required
                />
              </div>
            </div>
          </div>

          {/* HR & SpO2 & Temp */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Oxygen (SpO2 %)</label>
              <input
                type="number"
                value={oxygenSaturation}
                onChange={(e) => setOxygenSaturation(Number(e.target.value))}
                className="w-full bg-white border border-stone-200 rounded-xl p-2 text-[#4A5443] font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Temp (°F)</label>
              <input
                type="number"
                step="0.1"
                value={tempFahrenheit}
                onChange={(e) => setTempFahrenheit(Number(e.target.value))}
                className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
          </div>

          {/* Weight & Height & Calculated BMI */}
          <div className="grid grid-cols-3 gap-3 items-center">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Weight (lbs)</label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(Number(e.target.value))}
                className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Height (inches)</label>
              <input
                type="number"
                value={heightInches}
                onChange={(e) => setHeightInches(Number(e.target.value))}
                className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
            <div className="bg-[#F0EEE6] p-2 rounded-2xl border border-stone-200 text-center">
              <span className="text-[10px] text-stone-500 block">Computed BMI</span>
              <span className="font-bold text-stone-900 font-mono">{calculatedBmi}</span>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Clinical Notes / Position</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-2xl border border-stone-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-medium px-5 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Vitals to Chart</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
