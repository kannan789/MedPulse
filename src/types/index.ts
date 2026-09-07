export interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  specialty: string;
  npi: string; // National Provider Identifier (10 digits)
  dea: string; // Drug Enforcement Administration registration
  licenseNumber: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  email: string;
  avatarUrl: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_room'
  | 'in_consult'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type VisitType = 'Routine Follow-up' | 'Annual Wellness' | 'Urgent Care' | 'Telehealth' | 'Post-Op Review' | 'Lab Review';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  patientPhone: string;
  patientEmail: string;
  dateTime: string; // ISO string or YYYY-MM-DDTHH:mm
  timeSlot: string; // e.g. "09:00 AM"
  durationMinutes: number;
  visitType: VisitType;
  status: AppointmentStatus;
  room?: string;
  reasonForVisit: string;
  vitalSignsRecorded: boolean;
  reminderStatus: 'scheduled' | 'sent' | 'delivered' | 'confirmed' | 'failed';
  reminderChannel: 'SMS' | 'Email' | 'Voice' | 'All';
  copayAmount?: number;
  telehealthLink?: string;
  clinicalNotesSummary?: string;
}

export interface VitalSignRecord {
  id: string;
  date: string;
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  tempFahrenheit: number;
  oxygenSaturation: number; // SpO2 %
  respiratoryRate: number;
  bmi: number;
  weightLbs: number;
  heightInches: number;
  notes?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  type: 'Medication' | 'Food' | 'Environmental';
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe / Anaphylaxis';
  dateIdentified: string;
}

export interface MedicalProblem {
  id: string;
  icd10Code: string;
  diagnosis: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  dateDiagnosed: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  medicationName: string;
  genericName: string;
  dosage: string; // e.g. "10 mg"
  form: 'Tablet' | 'Capsule' | 'Liquid' | 'Inhaler' | 'Injection' | 'Topical';
  route: 'Oral' | 'Sublingual' | 'Inhalation' | 'Subcutaneous' | 'Topical';
  sig: string; // Instructions e.g. "Take 1 tablet by mouth daily in the morning"
  quantity: number;
  refillsAllowed: number;
  daysSupply: number;
  prescribedDate: string;
  prescriberName: string;
  prescriberNpi: string;
  prescriberDea: string;
  pharmacyName: string;
  pharmacyNcpdp: string;
  pharmacyAddress: string;
  status: 'Draft' | 'Electronically Transmitted' | 'Dispensed' | 'Cancelled';
  digitalSignatureHash: string;
  drugInteractionWarning?: string;
  allergyConflictOverrideReason?: string;
}

export interface SoapNote {
  id: string;
  appointmentId?: string;
  patientId: string;
  date: string;
  authorName: string;
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosesCodes: string[];
  isLocked: boolean;
}

export interface LabResult {
  id: string;
  testName: string;
  category: 'Hematology' | 'Metabolic' | 'Lipid' | 'Endocrine' | 'Urinalysis';
  dateOrdered: string;
  dateCompleted: string;
  status: 'Pending' | 'Normal' | 'Abnormal' | 'Critical';
  value: string;
  referenceRange: string;
  interpretation?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. "MRN-849201"
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    copay: number;
  };
  preferredPharmacy: {
    name: string;
    ncpdp: string;
    address: string;
    phone: string;
  };
  riskLevel: 'Low' | 'Moderate' | 'High Risk / Chronic';
  allergies: Allergy[];
  problemList: MedicalProblem[];
  vitalsHistory: VitalSignRecord[];
  activePrescriptions: Prescription[];
  pastNotes: SoapNote[];
  labResults: LabResult[];
  createdDate: string;
}

export interface UrgentAlert {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  severity: 'Critical' | 'High' | 'Warning';
  title: string;
  description: string;
  timestamp: string;
  category: 'Vitals' | 'Lab Result' | 'Drug Conflict' | 'Missed Follow-up' | 'Pathology';
  acknowledged: boolean;
  actionRequired: string;
}

export interface AutomatedReminderLog {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  channel: 'SMS' | 'Email' | 'Voice';
  reminderType: '48h Pre-visit' | '24h Pre-visit' | '2h Fasting Alert' | 'Follow-up Due';
  scheduledTime: string;
  sentTime?: string;
  status: 'Scheduled' | 'Sent' | 'Delivered' | 'Confirmed' | 'Reschedule Requested' | 'Failed';
  patientResponse?: string;
  messageContent: string;
}

export interface HipaaAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'LOGIN' | 'LOGOUT' | 'VIEW_PHI' | 'EDIT_RECORD' | 'CREATE_RX' | 'TRANSMIT_RX' | 'SEND_REMINDER' | 'EXPORT_DATA' | 'BREAK_GLASS';
  patientId?: string;
  patientName?: string;
  mrn?: string;
  ipAddress: string;
  details: string;
  hipaaComplianceVerified: boolean;
}
