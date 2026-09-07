import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import {
  Send,
  MessageSquare,
  Mail,
  CheckCircle2,
  Clock,
  Smartphone,
  PhoneCall,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { maskName, maskPhone } from '../utils/hipaa';

export const RemindersView: React.FC = () => {
  const {
    appointments,
    reminderLogs,
    phiMasked,
    dispatchReminder,
    simulatePatientReply,
  } = useDoctor();

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    appointments.length > 0 ? appointments[0].id : ''
  );
  const [selectedChannel, setSelectedChannel] = useState<'SMS' | 'Email' | 'Voice'>('SMS');
  const [customReply, setCustomReply] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const selectedApt = appointments.find((a) => a.id === selectedAppointmentId);
  const latestReminder = reminderLogs.find((r) => r.appointmentId === selectedAppointmentId) || reminderLogs[0];

  const handleSendNow = () => {
    if (selectedAppointmentId) {
      dispatchReminder(selectedAppointmentId, selectedChannel);
    }
  };

  const handleSimulateReply = (replyText: string) => {
    if (latestReminder) {
      simulatePatientReply(latestReminder.id, replyText, true);
      setCustomReply('');
    }
  };

  const filteredLogs = reminderLogs.filter((log) => {
    if (statusFilter !== 'ALL' && log.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const confirmedCount = reminderLogs.filter((r) => r.status === 'Confirmed').length;
  const deliveredCount = reminderLogs.filter((r) => r.status === 'Delivered' || r.status === 'Confirmed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#F0EEE6] border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5443] uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-[#7C8B6F]" />
            <span>Automated Patient Notification Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-[#7C8B6F]" />
            Automated Reminder System & SMS Queue
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            HIPAA-compliant encrypted notifications with bidirectional patient response tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-white border border-stone-200 px-3.5 py-2 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] text-stone-500 block uppercase font-medium">Confirmation Rate</span>
            <span className="text-sm font-serif font-bold text-emerald-700">
              {reminderLogs.length > 0 ? `${Math.round((confirmedCount / reminderLogs.length) * 100)}%` : '100%'}
            </span>
          </div>
          <div className="bg-white border border-stone-200 px-3.5 py-2 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] text-stone-500 block uppercase font-medium">Total Dispatched</span>
            <span className="text-sm font-serif font-bold text-stone-900">{reminderLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive SMS Simulator & Rules Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Dispatcher & Scheduled Log Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Instant Dispatcher Box */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#7C8B6F]" />
              Manual / On-Demand Notification Dispatch
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Target Patient Visit</label>
                <select
                  value={selectedAppointmentId}
                  onChange={(e) => setSelectedAppointmentId(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-2xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F] cursor-pointer"
                >
                  {appointments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {maskName(apt.patientName, phiMasked)} ({apt.timeSlot} • {apt.visitType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Notification Channel</label>
                <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('SMS')}
                    className={`py-1 rounded-xl text-center cursor-pointer transition text-xs font-medium ${
                      selectedChannel === 'SMS' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('Email')}
                    className={`py-1 rounded-xl text-center cursor-pointer transition text-xs font-medium ${
                      selectedChannel === 'Email' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('Voice')}
                    className={`py-1 rounded-xl text-center cursor-pointer transition text-xs font-medium ${
                      selectedChannel === 'Voice' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    Voice
                  </button>
                </div>
              </div>
            </div>

            {selectedApt && (
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70 text-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#4A5443]">Generated Message Preview:</span>
                <p className="text-stone-700 italic leading-relaxed">
                  "St. Jude Medical: Hi {maskName(selectedApt.patientName, phiMasked)}, this is an automated reminder of your upcoming appointment with Dr. Julian Reed at {selectedApt.timeSlot}. Please reply YES to confirm or CALL to reschedule."
                </p>
              </div>
            )}

            <button
              onClick={handleSendNow}
              className="w-full bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-medium py-2.5 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Automated {selectedChannel} Reminder Now</span>
            </button>
          </div>

          {/* Reminder Delivery Logs */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7C8B6F]" />
                Live Notification Delivery Log
              </h3>

              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-stone-200 text-stone-700 rounded-xl px-2.5 py-1 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#7C8B6F]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Reschedule Requested">Reschedule</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-stone-50 border border-stone-200/70 rounded-2xl p-3.5 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-stone-900">
                        {maskName(log.patientName, phiMasked)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 font-mono">
                        {log.channel}
                      </span>
                      <span className="text-[10px] text-stone-500">{log.reminderType}</span>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${
                        log.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : log.status === 'Delivered'
                          ? 'bg-[#DCE2D1] text-[#3E4738] border-[#7C8B6F]/40'
                          : log.status === 'Reschedule Requested'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-relaxed">{log.messageContent}</p>

                  {log.patientResponse && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between font-medium">
                      <span>{log.patientResponse}</span>
                      <span className="text-[10px] text-emerald-600 font-normal">Received via SMS Gateway</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Smartphone SMS Simulator Screen */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#F0EEE6] border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#7C8B6F]" />
                Live Patient SMS Simulator
              </h3>
              <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#DCE2D1] text-[#3E4738] border border-[#7C8B6F]/40">
                Interactive Test
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Test how reminders appear on a patient's mobile device and test bidirectional SMS confirmation replies.
            </p>

            {/* Mock Smartphone Frame */}
            <div className="mx-auto max-w-[320px] bg-white border-4 border-stone-300 rounded-[36px] p-3.5 shadow-md space-y-3">
              {/* Phone Speaker & Dynamic Island */}
              <div className="flex justify-center">
                <div className="w-20 h-3.5 bg-stone-200 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-stone-300" />
                </div>
              </div>

              {/* SMS Header */}
              <div className="text-center pb-2 border-b border-stone-200">
                <p className="text-xs font-bold text-stone-900">St. Jude Medical Clinic</p>
                <p className="text-[10px] text-stone-500">Short Code: 742-99 (Verified Healthcare SMS)</p>
              </div>

              {/* SMS Message Thread */}
              <div className="space-y-3 py-2 min-h-[220px] max-h-[260px] overflow-y-auto px-1 text-xs">
                {latestReminder ? (
                  <>
                    {/* Clinic Outgoing Message */}
                    <div className="flex justify-start">
                      <div className="bg-stone-100 text-stone-800 rounded-2xl rounded-tl-xs p-3 max-w-[85%] text-[11px] leading-relaxed border border-stone-200 shadow-xs">
                        {latestReminder.messageContent}
                      </div>
                    </div>

                    {/* Patient Reply Message (if any) */}
                    {latestReminder.patientResponse && (
                      <div className="flex justify-end">
                        <div className="bg-[#7C8B6F] text-white rounded-2xl rounded-tr-xs p-3 max-w-[85%] text-[11px] leading-relaxed shadow-xs">
                          {latestReminder.patientResponse.replace('Reply: ', '')}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-stone-400 text-xs py-8">No messages in queue</p>
                )}
              </div>

              {/* Patient Interactive Reply Controls */}
              <div className="pt-2 border-t border-stone-200 space-y-2 text-xs">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block text-center">
                  Simulate Patient Reply Action:
                </span>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleSimulateReply('YES - Confirmed, see you then!')}
                    className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white font-medium py-2 px-2 rounded-xl text-[11px] transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Reply "YES" (Confirm)</span>
                  </button>

                  <button
                    onClick={() => handleSimulateReply('Need to reschedule, please call me.')}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 font-medium py-2 px-2 rounded-xl text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Reschedule</span>
                  </button>
                </div>

                {/* Custom reply field */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={customReply}
                    onChange={(e) => setCustomReply(e.target.value)}
                    placeholder="Type simulated reply..."
                    className="flex-1 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-[11px] text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7C8B6F]"
                  />
                  <button
                    onClick={() => handleSimulateReply(customReply || 'Confirmed')}
                    className="bg-[#4A5443] hover:bg-[#3E4738] text-white px-3.5 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition shadow-xs"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
