import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Pill,
  Send,
  Video,
  ArrowRight,
  Stethoscope,
  Activity,
  Phone,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { maskName, maskPhone } from '../utils/hipaa';
import { AppointmentStatus, VisitType } from '../types';

interface DashboardViewProps {
  onOpenNewAppointment: () => void;
  onOpenNewPrescription: (patientId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewAppointment,
  onOpenNewPrescription,
}) => {
  const {
    doctor,
    appointments,
    urgentAlerts,
    patients,
    phiMasked,
    selectPatient,
    setActiveTab,
    updateAppointmentStatus,
    acknowledgeAlert,
    dispatchReminder,
    reminderLogs,
  } = useDoctor();

  const [visitFilter, setVisitFilter] = useState<'ALL' | 'IN_CLINIC' | 'SCHEDULED' | 'COMPLETED'>('ALL');

  // Filter today's appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (visitFilter === 'IN_CLINIC') {
      return apt.status === 'checked_in' || apt.status === 'in_room' || apt.status === 'in_consult';
    }
    if (visitFilter === 'SCHEDULED') {
      return apt.status === 'scheduled';
    }
    if (visitFilter === 'COMPLETED') {
      return apt.status === 'completed';
    }
    return true;
  });

  const unreadAlerts = urgentAlerts.filter((a) => !a.acknowledged);
  const inClinicCount = appointments.filter(
    (a) => a.status === 'in_room' || a.status === 'checked_in' || a.status === 'in_consult'
  ).length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const confirmedRemindersCount = reminderLogs.filter((r) => r.status === 'Confirmed').length;

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

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_room':
        return 'In Exam Room';
      case 'in_consult':
        return 'In Consultation';
      case 'checked_in':
        return 'Checked In (Lobby)';
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#F0EEE6] border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5443] uppercase tracking-wider mb-1">
              <Activity className="w-3.5 h-3.5 text-[#7C8B6F]" />
              <span>St. Jude Metropolitan Medical Center • Outpatient Clinic</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Welcome, {doctor.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Today's Schedule: <span className="text-stone-900 font-semibold">{appointments.length} patients booked</span>,{' '}
              <span className="text-stone-800 font-semibold">{inClinicCount} in clinic</span>, and{' '}
              <span className="text-red-600 font-semibold">{unreadAlerts.length} urgent alerts</span>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenNewAppointment}
              className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-medium text-xs py-2.5 px-4 rounded-2xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => onOpenNewPrescription()}
              className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-medium text-xs py-2.5 px-4 rounded-2xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-[#7C8B6F]" />
              <span>e-Prescription</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Today's Visits</span>
            <Calendar className="w-4 h-4 text-[#7C8B6F]" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">{appointments.length}</div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1.5">
            <span className="text-[#3E4738] font-medium">{completedCount} completed</span>
            <span>•</span>
            <span className="text-stone-700 font-medium">{inClinicCount} in clinic</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Urgent Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-red-600">{unreadAlerts.length}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            {unreadAlerts.length > 0 ? 'Requires clinical review' : 'All alerts acknowledged'}
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Active Patients</span>
            <Users className="w-4 h-4 text-[#7C8B6F]" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">{patients.length}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            Full electronic health records
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Automated Reminders</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700">{confirmedRemindersCount}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            SMS / Email confirmations received
          </div>
        </div>
      </div>

      {/* Urgent Patient Alerts Section */}
      {unreadAlerts.length > 0 && (
        <div className="bg-[#4A5443] rounded-3xl p-5 sm:p-6 text-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                Urgent Patient Alerts
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                  {unreadAlerts.length} Action Needed
                </span>
              </h2>
            </div>
            <span className="text-xs text-stone-300 font-medium">HIPAA Protected Clinical Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {unreadAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xs p-4 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        alert.severity === 'Critical'
                          ? 'bg-red-500/80 text-white'
                          : 'bg-amber-400/80 text-stone-900'
                      }`}
                    >
                      {alert.severity} • {alert.category}
                    </span>
                    <span className="text-[11px] text-stone-300">{alert.timestamp}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1">{alert.title}</h4>
                  <p className="text-[11px] text-stone-200 leading-relaxed mb-3">
                    {alert.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/15">
                  <div className="text-[11px] text-stone-200 mb-2 font-medium">
                    Patient: <span className="text-white font-semibold">{maskName(alert.patientName, phiMasked)}</span> ({alert.mrn})
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => selectPatient(alert.patientId)}
                      className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Stethoscope className="w-3 h-3 text-white" />
                      View Chart
                    </button>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-xs bg-[#7C8B6F] hover:bg-[#6A795F] text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Home Grid: Today's Appointments + Reminder Engine Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Daily Visits */}
        <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7C8B6F]" />
                Upcoming Daily Visits
              </h2>
              <p className="text-xs text-stone-500">Scheduled clinical appointments and active consultations</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 self-start sm:self-auto text-xs">
              <button
                onClick={() => setVisitFilter('ALL')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer font-medium ${
                  visitFilter === 'ALL' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                onClick={() => setVisitFilter('IN_CLINIC')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer font-medium ${
                  visitFilter === 'IN_CLINIC' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                In Clinic ({inClinicCount})
              </button>
              <button
                onClick={() => setVisitFilter('SCHEDULED')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer font-medium ${
                  visitFilter === 'SCHEDULED' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => setVisitFilter('COMPLETED')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer font-medium ${
                  visitFilter === 'COMPLETED' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Done
              </button>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                No appointments in this category.
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const patientData = patients.find((p) => p.id === apt.patientId);
                const latestVitals = patientData?.vitalsHistory[0];

                return (
                  <div
                    key={apt.id}
                    className="bg-stone-50/70 border border-stone-200/70 hover:bg-[#F2F4F0] rounded-2xl p-4 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[65px] bg-white border border-stone-200 py-1.5 px-2 rounded-xl shadow-xs">
                          <span className="block text-xs font-bold text-stone-900">{apt.timeSlot}</span>
                          <span className="block text-[10px] text-stone-500">{apt.durationMinutes}m</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-stone-900">
                              {maskName(apt.patientName, phiMasked)}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              DOB: {apt.patientDob}
                            </span>
                          </div>
                          <p className="text-xs text-[#4A5443] flex items-center gap-1 font-medium">
                            {apt.visitType === 'Telehealth' && <Video className="w-3 h-3 text-[#7C8B6F]" />}
                            <span>{apt.visitType}</span>
                            {apt.room && <span className="text-stone-500">• {apt.room}</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status selector */}
                        <select
                          value={apt.status}
                          onChange={(e) =>
                            updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)
                          }
                          className={`text-xs px-2.5 py-1 rounded-xl border font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B6F] cursor-pointer ${getStatusBadge(
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

                        {/* Open Chart */}
                        <button
                          onClick={() => selectPatient(apt.patientId)}
                          className="text-xs bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 px-3 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer font-medium shadow-xs"
                        >
                          <span>Chart</span>
                          <ChevronRight className="w-3 h-3 text-stone-400" />
                        </button>
                      </div>
                    </div>

                    {/* Reason & Triage Vitals snapshot */}
                    <div className="bg-white/80 rounded-xl p-3 border border-stone-200/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-stone-700">
                        <span className="text-stone-500 font-medium">Chief Concern: </span>
                        {apt.reasonForVisit}
                      </div>

                      {latestVitals && (
                        <div className="text-[11px] text-stone-600 shrink-0 flex items-center gap-2">
                          <span
                            className={`font-mono px-1.5 py-0.5 rounded-md ${
                              latestVitals.bpSystolic >= 140
                                ? 'bg-red-50 text-red-700 border border-red-200 font-semibold'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            BP: {latestVitals.bpSystolic}/{latestVitals.bpDiastolic}
                          </span>
                          <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded-md text-stone-700">
                            HR: {latestVitals.heartRate}
                          </span>
                          <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded-md text-stone-700">
                            SpO2: {latestVitals.oxygenSaturation}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom toolbar for appointment: Reminder status & actions */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-stone-600">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {maskPhone(apt.patientPhone, phiMasked)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                            apt.reminderStatus === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : apt.reminderStatus === 'delivered'
                              ? 'bg-stone-100 text-stone-700 border-stone-200'
                              : 'bg-stone-100 text-stone-600 border-stone-200'
                          }`}
                        >
                          {apt.reminderStatus === 'confirmed' ? (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Send className="w-2.5 h-2.5 text-stone-400" />
                          )}
                          Reminder: {apt.reminderStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-medium">
                        <button
                          onClick={() => dispatchReminder(apt.id, 'SMS')}
                          className="text-[#4A5443] hover:underline transition cursor-pointer"
                          title="Trigger immediate SMS reminder"
                        >
                          Resend SMS
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => onOpenNewPrescription(apt.patientId)}
                          className="text-[#7C8B6F] hover:underline transition cursor-pointer"
                        >
                          Write Rx
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Automated Reminder System Overview & Quick Actions */}
        <div className="space-y-6">
          {/* Automated Reminder Status Panel */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-[#DCE2D1] text-[#3E4738]">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-stone-900">Automated Reminders</h3>
                  <p className="text-[11px] text-stone-500">SMS & Email Confirmation Engine</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('reminders')}
                className="text-xs text-[#4A5443] font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Live Simulator</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] text-stone-500 uppercase font-medium">Delivered</span>
                <p className="text-xl font-serif font-bold text-stone-900">{reminderLogs.length}</p>
              </div>
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] text-stone-500 uppercase font-medium">Patient Replies</span>
                <p className="text-xl font-serif font-bold text-emerald-700">{confirmedRemindersCount}</p>
              </div>
            </div>

            {/* Active automated rules */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Automated Dispatch Rules
              </span>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <div className="flex items-center justify-between font-medium text-stone-800">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#7C8B6F]" /> 24-Hour Pre-Visit SMS
                  </span>
                  <span className="text-[10px] bg-[#DCE2D1] text-[#3E4738] px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Sends clinic address, parking instructions & "Reply YES to confirm".
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <div className="flex items-center justify-between font-medium text-stone-800">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#7C8B6F]" /> 2-Hour Fasting Alert
                  </span>
                  <span className="text-[10px] bg-[#DCE2D1] text-[#3E4738] px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Automated warning for fasting bloodwork & lab visits.
                </p>
              </div>
            </div>

            {/* Test Reminder Simulator CTA */}
            <button
              onClick={() => setActiveTab('reminders')}
              className="w-full bg-[#7C8B6F] hover:bg-[#6A795F] text-white text-xs font-medium py-2.5 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Test Interactive Patient SMS Simulator</span>
            </button>
          </div>

          {/* HIPAA Security & Compliance Snapshot Card */}
          <div className="bg-[#F0EEE6] border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#3E4738]">
              <ShieldCheck className="w-4 h-4 text-[#7C8B6F]" />
              <h3 className="text-sm font-serif font-bold text-stone-900">HIPAA Compliance Center</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Patient data privacy controls active under 45 CFR Part 164 Subpart C.
            </p>
            <ul className="text-xs text-stone-700 space-y-1.5 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C8B6F]" />
                <span>Audit logging active on all PHI access</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C8B6F]" />
                <span>AES-256 encrypted local record storage</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C8B6F]" />
                <span>DEA schedule & digital signature enforcement</span>
              </li>
            </ul>

            <button
              onClick={() => setActiveTab('audit')}
              className="w-full bg-white hover:bg-stone-50 text-stone-800 text-xs py-2.5 px-3 rounded-2xl border border-stone-200 transition flex items-center justify-center gap-1 cursor-pointer font-medium shadow-xs"
            >
              <span>View Access Audit Trail</span>
              <ArrowRight className="w-3 h-3 text-stone-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
