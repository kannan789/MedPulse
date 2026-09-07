import React from 'react';
import { useDoctor } from '../context/DoctorContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Pill,
  Send,
  ShieldCheck,
  PlusCircle,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';

interface SidebarProps {
  onOpenNewAppointment?: () => void;
  onOpenNewPatient?: () => void;
  onOpenNewPrescription?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewAppointment,
  onOpenNewPatient,
  onOpenNewPrescription,
}) => {
  const { activeTab, setActiveTab, urgentAlerts, appointments } = useDoctor();

  const unreadAlertsCount = urgentAlerts.filter((a) => !a.acknowledged).length;
  const inClinicAppointments = appointments.filter(
    (a) => a.status === 'in_room' || a.status === 'checked_in'
  ).length;

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Doctor Dashboard',
      icon: LayoutDashboard,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount} alerts` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-800',
    },
    {
      id: 'schedule' as const,
      label: 'Daily Visits',
      icon: Calendar,
      badge: inClinicAppointments > 0 ? `${inClinicAppointments} active` : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-800',
    },
    {
      id: 'patients' as const,
      label: 'Patient Records',
      icon: Users,
    },
    {
      id: 'prescriptions' as const,
      label: 'e-Prescriptions',
      icon: Pill,
    },
    {
      id: 'reminders' as const,
      label: 'Automated Reminders',
      icon: Send,
    },
    {
      id: 'audit' as const,
      label: 'HIPAA & Audit Logs',
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#F0EEE6] border-r border-stone-200 shrink-0 p-4 justify-between">
        <div className="space-y-6">
          {/* Quick Action Buttons */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-2">
              Clinical Shortcuts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenNewAppointment}
                className="bg-[#7C8B6F] hover:bg-[#6A795F] text-white rounded-2xl p-2.5 text-xs font-medium flex flex-col items-center justify-center gap-1 transition shadow-xs cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>+ Appointment</span>
              </button>
              <button
                onClick={onOpenNewPrescription}
                className="bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-2xl p-2.5 text-xs font-medium flex flex-col items-center justify-center gap-1 transition shadow-xs cursor-pointer"
              >
                <Pill className="w-4 h-4 text-[#7C8B6F]" />
                <span>+ Write e-Rx</span>
              </button>
            </div>
            <button
              onClick={onOpenNewPatient}
              className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-2xl py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#7C8B6F]" />
              <span>Register New Patient</span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-2 mb-2">
              Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#DCE2D1] text-[#3E4738] font-semibold shadow-xs'
                      : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#3E4738]' : 'text-stone-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-[#4A5443] text-white border-transparent'
                          : 'bg-white/80 text-stone-600 border-stone-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* HIPAA Compliance System Status Box */}
        <div className="bg-white/70 border border-stone-200 rounded-3xl p-4 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-[#3E4738] font-semibold mb-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>HIPAA Secure Session</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            AES-256 Encryption active. BAA signed. Audit daemon active.
          </p>
          <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400">
            <span>Timeout: 15m idle</span>
            <span className="text-emerald-700 font-medium">Online</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F0EEE6]/95 backdrop-blur border-t border-stone-200 px-2 py-1.5 flex items-center justify-around shadow-sm">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] transition relative ${
                isActive ? 'text-[#3E4738] font-bold bg-[#DCE2D1]/60' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
              {item.badge && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
