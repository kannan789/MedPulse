import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import { X, Calendar, Clock, Send, Video, Building } from 'lucide-react';
import { VisitType } from '../types';
import { maskName } from '../utils/hipaa';

interface NewAppointmentModalProps {
  initialPatientId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  initialPatientId,
  onClose,
  onSuccess,
}) => {
  const { patients, addAppointment, phiMasked } = useDoctor();

  const [patientId, setPatientId] = useState(
    initialPatientId || (patients.length > 0 ? patients[0].id : '')
  );
  const [timeSlot, setTimeSlot] = useState('02:30 PM');
  const [duration, setDuration] = useState(30);
  const [visitType, setVisitType] = useState<VisitType>('Routine Follow-up');
  const [room, setRoom] = useState('Exam Room 3');
  const [reason, setReason] = useState('Follow-up on laboratory results and medication tolerance.');
  const [reminderChannel, setReminderChannel] = useState<'SMS' | 'Email' | 'Voice' | 'All'>('SMS');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    addAppointment({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientDob: patient.dob,
      patientPhone: patient.phone,
      patientEmail: patient.email,
      dateTime: new Date().toISOString(),
      timeSlot,
      durationMinutes: duration,
      visitType,
      status: 'scheduled',
      room: visitType === 'Telehealth' ? 'Virtual Clinic #1' : room,
      reasonForVisit: reason.trim(),
      vitalSignsRecorded: false,
      reminderChannel,
      copayAmount: patient.insurance.copay,
      telehealthLink:
        visitType === 'Telehealth'
          ? `https://telehealth.stjudemedical.org/room/dr-reed-${Date.now().toString().slice(-4)}`
          : undefined,
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-stone-800">
        <div className="bg-[#F0EEE6] border-b border-stone-200 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE2D1] border border-[#7C8B6F]/30 flex items-center justify-center text-[#4A5443] shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Book Clinic Appointment</h3>
              <p className="text-xs text-stone-600">Schedule Patient Visit & Queue Automated Reminders</p>
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
          <div>
            <label className="block text-stone-700 font-medium mb-1">Patient *</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {maskName(`${p.firstName} ${p.lastName}`, phiMasked)} ({p.mrn} • DOB: {p.dob})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Time Slot *</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g. 10:15 AM"
                className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Duration (min)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Visit Type *</label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value as VisitType)}
                className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
              >
                <option value="Routine Follow-up">Routine Follow-up</option>
                <option value="Annual Wellness">Annual Wellness</option>
                <option value="Urgent Care">Urgent Care</option>
                <option value="Telehealth">Telehealth</option>
                <option value="Lab Review">Lab Review</option>
                <option value="Post-Op Review">Post-Op Review</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Exam Room Allocation</label>
              <select
                value={room}
                disabled={visitType === 'Telehealth'}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] disabled:opacity-50 cursor-pointer"
              >
                <option value="Exam Room 1">Exam Room 1</option>
                <option value="Exam Room 2">Exam Room 2</option>
                <option value="Exam Room 3">Exam Room 3</option>
                <option value="Exam Room 4">Exam Room 4</option>
                <option value="Procedure Suite">Procedure Suite</option>
                <option value="Virtual Clinic #1">Virtual Clinic #1</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Reason for Visit / Chief Concern *</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Hypertension review, asthma cough worsening"
              className="w-full bg-white border border-stone-200 rounded-2xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
              required
            />
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Automated Reminder Channel</label>
            <select
              value={reminderChannel}
              onChange={(e) => setReminderChannel(e.target.value as any)}
              className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
            >
              <option value="SMS">SMS Text (Recommended)</option>
              <option value="Email">Secure Email</option>
              <option value="All">Both SMS & Email</option>
            </select>
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
              <Calendar className="w-4 h-4" />
              <span>Confirm & Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
