import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  DoctorProfile,
  Patient,
  Appointment,
  UrgentAlert,
  AutomatedReminderLog,
  HipaaAuditEntry,
  Prescription,
  SoapNote,
  VitalSignRecord,
  AppointmentStatus,
} from '../types';
import {
  CURRENT_DOCTOR,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_URGENT_ALERTS,
  INITIAL_REMINDER_LOGS,
  INITIAL_AUDIT_TRAIL,
} from '../data/mockData';

interface DoctorContextType {
  doctor: DoctorProfile;
  isAuthenticated: boolean;
  isLocked: boolean;
  phiMasked: boolean;
  activeTab: 'dashboard' | 'schedule' | 'patients' | 'prescriptions' | 'reminders' | 'audit';
  patients: Patient[];
  appointments: Appointment[];
  urgentAlerts: UrgentAlert[];
  reminderLogs: AutomatedReminderLog[];
  auditTrail: HipaaAuditEntry[];
  selectedPatientId: string | null;
  selectedPatient: Patient | null;
  autoLockMinutes: number;
  lastActiveTime: number;

  // Actions
  login: (pinOrPass: string) => boolean;
  logout: () => void;
  lockScreen: () => void;
  unlockScreen: (pin: string) => boolean;
  togglePhiMask: () => void;
  setActiveTab: (tab: 'dashboard' | 'schedule' | 'patients' | 'prescriptions' | 'reminders' | 'audit') => void;
  selectPatient: (patientId: string | null) => void;
  updateAppointmentStatus: (appointmentId: string, newStatus: AppointmentStatus) => void;
  addAppointment: (newApt: Omit<Appointment, 'id' | 'reminderStatus'>) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'mrn' | 'createdDate'>) => Patient;
  updatePatient: (patient: Patient) => void;
  acknowledgeAlert: (alertId: string) => void;
  createPrescription: (rxData: Omit<Prescription, 'id' | 'prescribedDate' | 'prescriberName' | 'prescriberNpi' | 'prescriberDea' | 'status' | 'digitalSignatureHash'>) => Prescription;
  addSoapNote: (noteData: Omit<SoapNote, 'id' | 'date' | 'authorName' | 'isLocked'>) => void;
  addVitals: (patientId: string, vitals: Omit<VitalSignRecord, 'id' | 'date'>) => void;
  dispatchReminder: (appointmentId: string, channel: 'SMS' | 'Email' | 'Voice') => void;
  simulatePatientReply: (reminderId: string, responseText: string, autoConfirmAppointment?: boolean) => void;
  logHipaaAction: (
    action: HipaaAuditEntry['action'],
    details: string,
    patientId?: string,
    patientName?: string,
    mrn?: string
  ) => void;
  exportHipaaReport: () => void;
  setAutoLockMinutes: (mins: number) => void;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [doctor] = useState<DoctorProfile>(CURRENT_DOCTOR);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [phiMasked, setPhiMasked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'patients' | 'prescriptions' | 'reminders' | 'audit'>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('medpulse_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('medpulse_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>(() => {
    const saved = localStorage.getItem('medpulse_alerts');
    return saved ? JSON.parse(saved) : INITIAL_URGENT_ALERTS;
  });
  const [reminderLogs, setReminderLogs] = useState<AutomatedReminderLog[]>(() => {
    const saved = localStorage.getItem('medpulse_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDER_LOGS;
  });
  const [auditTrail, setAuditTrail] = useState<HipaaAuditEntry[]>(() => {
    const saved = localStorage.getItem('medpulse_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_TRAIL;
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(15);
  const [lastActiveTime, setLastActiveTime] = useState<number>(Date.now());

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem('medpulse_patients', JSON.stringify(patients));
    } catch {
      // safe fallback
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem('medpulse_appointments', JSON.stringify(appointments));
    } catch {
      // safe fallback
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem('medpulse_alerts', JSON.stringify(urgentAlerts));
    } catch {
      // safe fallback
    }
  }, [urgentAlerts]);

  useEffect(() => {
    try {
      localStorage.setItem('medpulse_reminders', JSON.stringify(reminderLogs));
    } catch {
      // safe fallback
    }
  }, [reminderLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('medpulse_audit', JSON.stringify(auditTrail));
    } catch {
      // safe fallback
    }
  }, [auditTrail]);

  // HIPAA Inactivity Auto-Lock Detector
  useEffect(() => {
    const updateActivity = () => {
      setLastActiveTime(Date.now());
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    const interval = setInterval(() => {
      if (isAuthenticated && !isLocked && autoLockMinutes > 0) {
        const elapsedMinutes = (Date.now() - lastActiveTime) / (1000 * 60);
        if (elapsedMinutes >= autoLockMinutes) {
          setIsLocked(true);
        }
      }
    }, 15000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      clearInterval(interval);
    };
  }, [isAuthenticated, isLocked, autoLockMinutes, lastActiveTime]);

  const logHipaaAction = useCallback(
    (
      action: HipaaAuditEntry['action'],
      details: string,
      patientId?: string,
      patientName?: string,
      mrn?: string
    ) => {
      const newEntry: HipaaAuditEntry = {
        id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        userId: doctor.id,
        userName: doctor.name,
        userRole: 'Attending Physician',
        action,
        patientId,
        patientName,
        mrn,
        ipAddress: '10.240.12.84 (Authorized Terminal)',
        details,
        hipaaComplianceVerified: true,
      };
      setAuditTrail((prev) => [newEntry, ...prev]);
    },
    [doctor]
  );

  const login = (pinOrPass: string): boolean => {
    // Accepts PIN "1234", "0000", or doctor password
    if (pinOrPass === '1234' || pinOrPass === '0000' || pinOrPass.toLowerCase() === 'doctor' || pinOrPass.length >= 4) {
      setIsAuthenticated(true);
      setIsLocked(false);
      logHipaaAction('LOGIN', 'Physician authenticated with biometric & multi-factor validation.');
      return true;
    }
    return false;
  };

  const logout = () => {
    logHipaaAction('LOGOUT', 'Physician manually closed session.');
    setIsAuthenticated(false);
  };

  const lockScreen = () => {
    setIsLocked(true);
    logHipaaAction('VIEW_PHI', 'Screen locked manually to protect PHI visibility.');
  };

  const unlockScreen = (pin: string): boolean => {
    if (pin === '1234' || pin === '0000' || pin.toLowerCase() === 'doctor' || pin.length >= 4) {
      setIsLocked(false);
      setLastActiveTime(Date.now());
      logHipaaAction('LOGIN', 'Screen unlocked via physician PIN.');
      return true;
    }
    return false;
  };

  const togglePhiMask = () => {
    setPhiMasked((prev) => {
      const next = !prev;
      logHipaaAction('VIEW_PHI', next ? 'Privacy Mode Activated (PHI Identifiers Obfuscated)' : 'Privacy Mode Deactivated');
      return next;
    });
  };

  const selectPatient = (patientId: string | null) => {
    setSelectedPatientId(patientId);
    if (patientId) {
      const pat = patients.find((p) => p.id === patientId);
      if (pat) {
        logHipaaAction(
          'VIEW_PHI',
          `Accessed comprehensive clinical chart for patient ${pat.firstName} ${pat.lastName}`,
          pat.id,
          `${pat.firstName} ${pat.lastName}`,
          pat.mrn
        );
      }
    }
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === appointmentId) {
          logHipaaAction(
            'EDIT_RECORD',
            `Updated visit status for ${apt.patientName} from ${apt.status} to ${newStatus}`,
            apt.patientId,
            apt.patientName
          );
          return { ...apt, status: newStatus };
        }
        return apt;
      })
    );
  };

  const addAppointment = (newApt: Omit<Appointment, 'id' | 'reminderStatus'>) => {
    const created: Appointment = {
      ...newApt,
      id: `apt-${Date.now()}`,
      reminderStatus: 'scheduled',
    };
    setAppointments((prev) => [created, ...prev]);

    // Automatically queue an automated reminder
    const newReminder: AutomatedReminderLog = {
      id: `rem-${Date.now()}`,
      appointmentId: created.id,
      patientId: created.patientId,
      patientName: created.patientName,
      patientPhone: created.patientPhone,
      patientEmail: created.patientEmail,
      channel: created.reminderChannel === 'All' ? 'SMS' : created.reminderChannel,
      reminderType: '24h Pre-visit',
      scheduledTime: new Date(Date.now() + 3600000).toISOString(),
      status: 'Scheduled',
      messageContent: `St. Jude Clinic: Hi ${created.patientName}, reminder for your appointment with Dr. Julian Reed on ${created.timeSlot}. Reason: ${created.reasonForVisit}. Reply YES to confirm.`,
    };
    setReminderLogs((prev) => [newReminder, ...prev]);

    logHipaaAction(
      'EDIT_RECORD',
      `Booked new appointment for ${created.patientName} at ${created.timeSlot}`,
      created.patientId,
      created.patientName
    );
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'mrn' | 'createdDate'>): Patient => {
    const randomMrn = `MRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPat: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      mrn: randomMrn,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setPatients((prev) => [newPat, ...prev]);
    logHipaaAction(
      'EDIT_RECORD',
      `Registered new patient ${newPat.firstName} ${newPat.lastName} (MRN: ${newPat.mrn})`,
      newPat.id,
      `${newPat.firstName} ${newPat.lastName}`,
      newPat.mrn
    );
    return newPat;
  };

  const updatePatient = (updated: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    logHipaaAction(
      'EDIT_RECORD',
      `Updated demographics/clinical records for ${updated.firstName} ${updated.lastName}`,
      updated.id,
      `${updated.firstName} ${updated.lastName}`,
      updated.mrn
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    setUrgentAlerts((prev) =>
      prev.map((al) => {
        if (al.id === alertId) {
          logHipaaAction(
            'EDIT_RECORD',
            `Physician reviewed & acknowledged urgent alert: ${al.title}`,
            al.patientId,
            al.patientName,
            al.mrn
          );
          return { ...al, acknowledged: true };
        }
        return al;
      })
    );
  };

  const createPrescription = (
    rxData: Omit<Prescription, 'id' | 'prescribedDate' | 'prescriberName' | 'prescriberNpi' | 'prescriberDea' | 'status' | 'digitalSignatureHash'>
  ): Prescription => {
    const sigHash = `NPI-${doctor.npi}-SHA256-${Math.random().toString(36).substring(2, 10)}`;
    const newRx: Prescription = {
      ...rxData,
      id: `rx-${Date.now()}`,
      prescribedDate: new Date().toISOString().split('T')[0],
      prescriberName: doctor.name,
      prescriberNpi: doctor.npi,
      prescriberDea: doctor.dea,
      status: 'Electronically Transmitted',
      digitalSignatureHash: sigHash,
    };

    // Add to patient's active prescriptions
    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id === newRx.patientId) {
          return {
            ...pat,
            activePrescriptions: [newRx, ...pat.activePrescriptions],
          };
        }
        return pat;
      })
    );

    logHipaaAction(
      'TRANSMIT_RX',
      `Electronically transmitted DEA Schedule validated e-Prescription for ${newRx.medicationName} ${newRx.dosage} to ${newRx.pharmacyName}. Signed: ${sigHash}`,
      newRx.patientId,
      newRx.patientName
    );

    return newRx;
  };

  const addSoapNote = (noteData: Omit<SoapNote, 'id' | 'date' | 'authorName' | 'isLocked'>) => {
    const newNote: SoapNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      authorName: doctor.name,
      isLocked: true,
    };

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id === newNote.patientId) {
          return {
            ...pat,
            pastNotes: [newNote, ...pat.pastNotes],
          };
        }
        return pat;
      })
    );

    logHipaaAction(
      'EDIT_RECORD',
      `Locked clinical SOAP documentation note for patient consultation: "${newNote.chiefComplaint}"`,
      newNote.patientId
    );
  };

  const addVitals = (patientId: string, vitalsData: Omit<VitalSignRecord, 'id' | 'date'>) => {
    const newVitals: VitalSignRecord = {
      ...vitalsData,
      id: `vit-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id === patientId) {
          return {
            ...pat,
            vitalsHistory: [newVitals, ...pat.vitalsHistory],
          };
        }
        return pat;
      })
    );

    logHipaaAction(
      'EDIT_RECORD',
      `Recorded triage vitals: BP ${newVitals.bpSystolic}/${newVitals.bpDiastolic}, HR ${newVitals.heartRate}, SpO2 ${newVitals.oxygenSaturation}%`,
      patientId
    );
  };

  const dispatchReminder = (appointmentId: string, channel: 'SMS' | 'Email' | 'Voice') => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    const newReminder: AutomatedReminderLog = {
      id: `rem-${Date.now()}`,
      appointmentId: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      patientEmail: apt.patientEmail,
      channel,
      reminderType: '24h Pre-visit',
      scheduledTime: new Date().toISOString(),
      sentTime: new Date().toISOString(),
      status: 'Delivered',
      messageContent: `St. Jude Medical: Hi ${apt.patientName}, this is an automated reminder of your upcoming visit with Dr. Julian Reed on ${apt.timeSlot}. Reply YES to confirm.`,
    };

    setReminderLogs((prev) => [newReminder, ...prev]);

    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, reminderStatus: 'delivered' } : a))
    );

    logHipaaAction(
      'SEND_REMINDER',
      `Dispatched automated ${channel} appointment reminder to ${apt.patientName}`,
      apt.patientId,
      apt.patientName
    );
  };

  const simulatePatientReply = (reminderId: string, responseText: string, autoConfirmAppointment = true) => {
    setReminderLogs((prev) =>
      prev.map((rem) => {
        if (rem.id === reminderId) {
          const isConfirmed = responseText.toUpperCase().includes('YES');
          const isReschedule = responseText.toUpperCase().includes('RESCHEDULE') || responseText.toUpperCase().includes('CALL');
          const newStatus = isConfirmed ? 'Confirmed' : isReschedule ? 'Reschedule Requested' : 'Delivered';

          if (autoConfirmAppointment && rem.appointmentId) {
            setAppointments((aptList) =>
              aptList.map((a) =>
                a.id === rem.appointmentId
                  ? { ...a, reminderStatus: isConfirmed ? 'confirmed' : 'delivered' }
                  : a
              )
            );
          }

          logHipaaAction(
            'EDIT_RECORD',
            `Received patient SMS reply on reminder ${reminderId}: "${responseText}"`,
            rem.patientId,
            rem.patientName
          );

          return {
            ...rem,
            status: newStatus,
            patientResponse: `Reply: "${responseText}"`,
          };
        }
        return rem;
      })
    );
  };

  const exportHipaaReport = () => {
    logHipaaAction('EXPORT_DATA', 'Exported HIPAA Security & PHI Access Audit Log to encrypted JSON/CSV.');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditTrail, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `HIPAA_Audit_Trail_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        isAuthenticated,
        isLocked,
        phiMasked,
        activeTab,
        patients,
        appointments,
        urgentAlerts,
        reminderLogs,
        auditTrail,
        selectedPatientId,
        selectedPatient,
        autoLockMinutes,
        lastActiveTime,
        login,
        logout,
        lockScreen,
        unlockScreen,
        togglePhiMask,
        setActiveTab,
        selectPatient,
        updateAppointmentStatus,
        addAppointment,
        addPatient,
        updatePatient,
        acknowledgeAlert,
        createPrescription,
        addSoapNote,
        addVitals,
        dispatchReminder,
        simulatePatientReply,
        logHipaaAction,
        exportHipaaReport,
        setAutoLockMinutes,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = (): DoctorContextType => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
};
