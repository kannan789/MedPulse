import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Video,
  Send,
  Phone,
  Plus,
  Filter,
  User,
  Activity,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import { maskName, maskPhone } from '../utils/hipaa';
import { AppointmentStatus, VisitType } from '../types';

interface AppointmentsViewProps {
  onOpenNewAppointment: () => void;
  onOpenNewPrescription: (patientId?: string) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  onOpenNewAppointment,
  onOpenNewPrescription,
}) => {
  const {
    appointments,
    patients,
    phiMasked,
    selectPatient,
    updateAppointmentStatus,
    dispatchReminder,
  } = useDoctor();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedStatus !== 'ALL' && apt.status !== selectedStatus) {
      return false;
    }
    if (selectedType !== 'ALL' && apt.visitType !== selectedType) {
      return false;
    }
    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase();
      return (
        apt.patientName.toLowerCase().includes(query) ||
        apt.reasonForVisit.toLowerCase().includes(query) ||
        (apt.room && apt.room.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_room':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'in_consult':
        return 'bg-[#DCE2D1] text-[#3E4738] border-[#7C8B6F]/40';
      case 'checked_in':
        return 'bg-stone-100 text-stone-800 border-stone-300';
      case 'scheduled':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F0EEE6] border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#7C8B6F]" />
            Clinic Daily Schedule & Visits
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Manage patient flow, room allocations, consultation progress, and automated notifications.
          </p>
        </div>

        <button
          onClick={onOpenNewAppointment}
          className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white text-xs font-medium py-2.5 px-4 rounded-2xl transition shadow-xs flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-72">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter visits by patient name, reason, room..."
            className="w-full bg-white border border-stone-200 rounded-2xl px-3.5 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-stone-500 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-stone-400" /> Filter:
          </span>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-stone-200 text-stone-700 rounded-2xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
          >
            <option value="ALL">All Statuses ({appointments.length})</option>
            <option value="scheduled">Scheduled</option>
            <option value="checked_in">Checked In (Lobby)</option>
            <option value="in_room">In Exam Room</option>
            <option value="in_consult">In Consultation</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white border border-stone-200 text-stone-700 rounded-2xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
          >
            <option value="ALL">All Visit Types</option>
            <option value="Routine Follow-up">Routine Follow-up</option>
            <option value="Annual Wellness">Annual Wellness</option>
            <option value="Urgent Care">Urgent Care</option>
            <option value="Telehealth">Telehealth</option>
            <option value="Lab Review">Lab Review</option>
          </select>
        </div>
      </div>

      {/* Appointment Cards Timeline */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-3xl p-12 text-center text-stone-500">
            <Calendar className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-serif font-bold text-stone-800">No appointments match current filters</p>
            <p className="text-xs mt-1">Try clearing your search query or filters above.</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const patientData = patients.find((p) => p.id === apt.patientId);

            return (
              <div
                key={apt.id}
                className="bg-white border border-stone-200/80 hover:bg-[#F2F4F0]/40 rounded-3xl p-5 shadow-xs transition space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {/* Time Slot Box */}
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl py-2 px-3 text-center min-w-[75px]">
                      <span className="block text-sm font-bold text-stone-900">{apt.timeSlot}</span>
                      <span className="block text-[11px] text-stone-500 font-mono">
                        {apt.durationMinutes} min
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => selectPatient(apt.patientId)}
                          className="font-serif font-bold text-base text-stone-900 hover:text-[#4A5443] transition text-left cursor-pointer"
                        >
                          {maskName(apt.patientName, phiMasked)}
                        </button>
                        <span className="text-xs text-stone-500">DOB: {apt.patientDob}</span>
                        {patientData && (
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full border ${
                              patientData.riskLevel === 'High Risk / Chronic'
                                ? 'bg-red-50 text-red-700 border-red-200 font-medium'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            {patientData.riskLevel}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-1">
                        <span className="text-[#4A5443] font-medium flex items-center gap-1">
                          {apt.visitType === 'Telehealth' && <Video className="w-3.5 h-3.5 text-[#7C8B6F]" />}
                          {apt.visitType}
                        </span>
                        <span>•</span>
                        <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                          {apt.room || 'Unassigned Room'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {maskPhone(apt.patientPhone, phiMasked)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Controller & Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={apt.status}
                      onChange={(e) =>
                        updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${getStatusBadge(
                        apt.status
                      )}`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="checked_in">Checked In (Lobby)</option>
                      <option value="in_room">In Exam Room</option>
                      <option value="in_consult">In Consultation</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => selectPatient(apt.patientId)}
                      className="text-xs bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer font-medium shadow-xs"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-[#7C8B6F]" />
                      <span>Open Chart</span>
                    </button>
                  </div>
                </div>

                {/* Reason for visit */}
                <div className="bg-stone-50 border border-stone-200/70 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-stone-700">
                    <span className="font-semibold text-stone-900">Clinical Purpose: </span>
                    {apt.reasonForVisit}
                  </div>

                  {apt.telehealthLink && (
                    <a
                      href={apt.telehealthLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#4A5443] hover:underline flex items-center gap-1 font-medium shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Secure Video Room
                    </a>
                  )}
                </div>

                {/* Bottom Bar: Automated Reminder status & actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-stone-200/60">
                  <div className="flex items-center gap-2 text-stone-500">
                    <span className="text-[11px]">Automated Reminder Status:</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        apt.reminderStatus === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : apt.reminderStatus === 'delivered'
                          ? 'bg-stone-100 text-stone-700 border-stone-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {apt.reminderStatus === 'confirmed' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Send className="w-3 h-3 text-stone-400" />
                      )}
                      {apt.reminderStatus === 'confirmed'
                        ? 'Confirmed by Patient'
                        : apt.reminderStatus === 'delivered'
                        ? 'Delivered to Phone'
                        : 'Scheduled in Queue'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-medium">
                    <button
                      onClick={() => dispatchReminder(apt.id, 'SMS')}
                      className="text-stone-600 hover:text-[#4A5443] transition cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send Instant SMS</span>
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => onOpenNewPrescription(apt.patientId)}
                      className="text-[#7C8B6F] hover:underline transition cursor-pointer"
                    >
                      Electronic Prescription
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
