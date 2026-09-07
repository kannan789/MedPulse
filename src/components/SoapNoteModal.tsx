import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import { X, FileText, CheckCircle2, Shield } from 'lucide-react';
import { maskName } from '../utils/hipaa';

interface SoapNoteModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const SoapNoteModal: React.FC<SoapNoteModalProps> = ({
  patientId,
  onClose,
  onSuccess,
}) => {
  const { patients, doctor, updatePatient, phiMasked, logHipaaAction } = useDoctor();

  const patient = patients.find((p) => p.id === patientId);

  const [chiefComplaint, setChiefComplaint] = useState('Routine Clinical Follow-up & Evaluation');
  const [subjective, setSubjective] = useState(
    'Patient presents for scheduled follow-up. Reports good medication adherence. No acute chest pain, dyspnea, or palpitations reported. Denies headaches or visual changes.'
  );
  const [objective, setObjective] = useState(
    'Alert and oriented x4. Pleasant, in no acute distress. Heart: Regular rate and rhythm, no murmurs, gallops, or friction rubs. Lungs: Clear to auscultation bilaterally, no wheezes or rales. Extremities: No peripheral edema.'
  );
  const [assessment, setAssessment] = useState(
    'Essential Hypertension (ICD-10 I10) - Stable, well-controlled on current ACE inhibitor therapy. Preventive wellness measures updated.'
  );
  const [plan, setPlan] = useState(
    '1. Continue Lisinopril 20mg daily.\n2. Maintain low-sodium DASH diet and daily aerobic exercise.\n3. Repeat basic metabolic panel in 6 months.\n4. Follow up in clinic in 6 months or sooner if blood pressure exceeds 140/90.'
  );

  if (!patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newNote = {
      id: `soap-${Date.now()}`,
      encounterId: `enc-${Date.now().toString().slice(-5)}`,
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      authorName: doctor.name,
      authorRole: doctor.title,
      chiefComplaint: chiefComplaint.trim(),
      subjective: subjective.trim(),
      objective: objective.trim(),
      assessment: assessment.trim(),
      plan: plan.trim(),
      diagnosesCodes: patient.problemList.map((p) => p.icd10Code),
      isLocked: true,
    };

    updatePatient({
      ...patient,
      pastNotes: [newNote, ...patient.pastNotes],
    });

    logHipaaAction(
      'EDIT_RECORD',
      `Documented SOAP Clinical Consultation Note for encounter ${newNote.encounterId}.`,
      patient.id,
      `${patient.firstName} ${patient.lastName}`,
      patient.mrn
    );

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-800">
        <div className="bg-[#F0EEE6] border-b border-stone-200 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE2D1] border border-[#7C8B6F]/30 flex items-center justify-center text-[#4A5443] shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Document SOAP Encounter Note</h3>
              <p className="text-xs text-stone-600">
                Patient: {maskName(`${patient.firstName} ${patient.lastName}`, phiMasked)} ({patient.mrn}) • Clinician: {doctor.name}
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Chief Complaint / Reason for Encounter *</label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
              required
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[#4A5443] font-bold mb-1">Subjective (S) - Patient History & Symptoms</label>
              <textarea
                rows={3}
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>

            <div>
              <label className="block text-[#4A5443] font-bold mb-1">Objective (O) - Physical Exam & Diagnostics</label>
              <textarea
                rows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>

            <div>
              <label className="block text-[#4A5443] font-bold mb-1">Assessment (A) - Clinical Diagnoses & Differential</label>
              <textarea
                rows={2}
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>

            <div>
              <label className="block text-[#4A5443] font-bold mb-1">Plan (P) - Therapeutics, Prescriptions, Follow-Up</label>
              <textarea
                rows={3}
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
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
              <span>Save & Sign SOAP Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
