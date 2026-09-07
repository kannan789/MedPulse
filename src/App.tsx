import React, { useState } from 'react';
import { DoctorProvider, useDoctor } from './context/DoctorContext';
import { LoginView } from './components/LoginView';
import { LockScreen } from './components/LockScreen';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AppointmentsView } from './components/AppointmentsView';
import { PatientRecordsView } from './components/PatientRecordsView';
import { PrescriptionsView } from './components/PrescriptionsView';
import { RemindersView } from './components/RemindersView';
import { HipaaAuditView } from './components/HipaaAuditView';
import { PatientChartModal } from './components/PatientChartModal';
import { PrescriptionModal } from './components/PrescriptionModal';
import { NewPatientModal } from './components/NewPatientModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { SoapNoteModal } from './components/SoapNoteModal';
import { VitalsModal } from './components/VitalsModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLocked, activeTab, selectedPatientId, selectPatient } = useDoctor();

  // Modal control states
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [rxPatientId, setRxPatientId] = useState<string | undefined>(undefined);

  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [appointmentPatientId, setAppointmentPatientId] = useState<string | undefined>(undefined);

  const [soapPatientId, setSoapPatientId] = useState<string | null>(null);
  const [vitalsPatientId, setVitalsPatientId] = useState<string | null>(null);

  // Handlers
  const handleOpenNewPrescription = (patientId?: string) => {
    setRxPatientId(patientId);
    setIsRxModalOpen(true);
  };

  const handleOpenNewAppointment = (patientId?: string) => {
    setAppointmentPatientId(patientId);
    setIsNewAppointmentModalOpen(true);
  };

  const handleOpenNewPatient = () => {
    setIsNewPatientModalOpen(true);
  };

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-stone-800 flex flex-col font-sans selection:bg-[#DCE2D1] selection:text-[#3E4738]">
      {/* HIPAA Automatic Lock Screen Overlay */}
      {isLocked && <LockScreen />}

      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          onOpenNewAppointment={() => handleOpenNewAppointment()}
          onOpenNewPatient={handleOpenNewPatient}
          onOpenNewPrescription={() => handleOpenNewPrescription()}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewAppointment={() => handleOpenNewAppointment()}
              onOpenNewPrescription={(pid) => handleOpenNewPrescription(pid)}
            />
          )}

          {activeTab === 'schedule' && (
            <AppointmentsView
              onOpenNewAppointment={() => handleOpenNewAppointment()}
              onOpenNewPrescription={(pid) => handleOpenNewPrescription(pid)}
            />
          )}

          {activeTab === 'patients' && (
            <PatientRecordsView
              onOpenNewPatient={handleOpenNewPatient}
              onOpenNewPrescription={(pid) => handleOpenNewPrescription(pid)}
              onOpenNewAppointment={(pid) => handleOpenNewAppointment(pid)}
            />
          )}

          {activeTab === 'prescriptions' && (
            <PrescriptionsView
              onOpenNewPrescription={(pid) => handleOpenNewPrescription(pid)}
            />
          )}

          {activeTab === 'reminders' && <RemindersView />}

          {activeTab === 'audit' && <HipaaAuditView />}
        </main>
      </div>

      {/* Global Modals */}

      {/* 1. Patient Medical Chart & Comprehensive EHR */}
      {selectedPatientId && (
        <PatientChartModal
          onClose={() => selectPatient(null)}
          onOpenNewPrescription={(pid) => handleOpenNewPrescription(pid)}
          onOpenSoapModal={(pid) => setSoapPatientId(pid)}
          onOpenVitalsModal={(pid) => setVitalsPatientId(pid)}
        />
      )}

      {/* 2. Electronic Prescription e-Rx Tool */}
      {isRxModalOpen && (
        <PrescriptionModal
          initialPatientId={rxPatientId}
          onClose={() => {
            setIsRxModalOpen(false);
            setRxPatientId(undefined);
          }}
        />
      )}

      {/* 3. New Patient Registration Modal */}
      {isNewPatientModalOpen && (
        <NewPatientModal
          onClose={() => setIsNewPatientModalOpen(false)}
          onSuccess={(newPatientId) => {
            setIsNewPatientModalOpen(false);
            selectPatient(newPatientId);
          }}
        />
      )}

      {/* 4. Book New Appointment Modal */}
      {isNewAppointmentModalOpen && (
        <NewAppointmentModal
          initialPatientId={appointmentPatientId}
          onClose={() => {
            setIsNewAppointmentModalOpen(false);
            setAppointmentPatientId(undefined);
          }}
          onSuccess={() => {
            setIsNewAppointmentModalOpen(false);
            setAppointmentPatientId(undefined);
          }}
        />
      )}

      {/* 5. SOAP Clinical Encounter Note Modal */}
      {soapPatientId && (
        <SoapNoteModal
          patientId={soapPatientId}
          onClose={() => setSoapPatientId(null)}
          onSuccess={() => setSoapPatientId(null)}
        />
      )}

      {/* 6. Triage Vitals Recording Modal */}
      {vitalsPatientId && (
        <VitalsModal
          patientId={vitalsPatientId}
          onClose={() => setVitalsPatientId(null)}
          onSuccess={() => setVitalsPatientId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <DoctorProvider>
      <AppContent />
    </DoctorProvider>
  );
}
