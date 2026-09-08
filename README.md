# MedPulse EHR — Doctor Practice & Patient Records Portal

> **Live Deployment:** [https://medpulse-coral.vercel.app/](https://medpulse-coral.vercel.app/)

**MedPulse EHR** is a HIPAA-compliant Electronic Health Record (EHR) and clinical practice management portal designed for physicians, nurse practitioners, and outpatient clinics. It streamlines patient triage, clinical documentation, electronic prescribing (e-Rx), appointment scheduling, and automated patient communication in a secure, unified interface.

---

## 🌟 Key Features

### 1. Clinical Practice Dashboard
- **Real-Time Operational Pulse**: View today's total appointments, checked-in triage queue, pending e-prescriptions, and critical lab alerts at a glance.
- **Triage Priority & Risk Stratification**: Instant flags for high-risk chronic patients, abnormal vitals, and pending lab results.
- **Daily Encounter Timeline**: Interactive schedule tracking appointment status from arrival to discharge.

### 2. Comprehensive Patient Health Records (EHR)
- **7-Tab Interactive Patient Chart**:
  - **Clinical Overview**: Demographics, primary insurance provider, copay, preferred Surescripts pharmacy, and latest vital snapshot.
  - **Medical Problem List**: ICD-10 coded chronic and acute diagnosis management with status tracking (Active, Resolved).
  - **Vitals & Biometric Trend Log**: Systolic/diastolic BP, heart rate, SpO2, temperature, and automated BMI calculation with clinical threshold alerts.
  - **Allergies & Adverse Reactions**: Documented allergen registries with severity grading (Mild, Moderate, Severe) and clinical manifestations.
  - **Electronic Prescriptions (e-Rx)**: Active medication regimens, SIG dosage instructions, quantity, days supply, refills, and cryptographic signature verification.
  - **SOAP Encounter Notes**: Structured Subjective, Objective, Assessment, and Plan clinical documentation signed with author credentials.
  - **Diagnostic Lab Reports**: Laboratory chemistry and hematology panels with abnormal/critical status flags and clinician interpretation notes.

### 3. Electronic Prescriptions (e-Rx) System
- Built-in e-Prescribing engine supporting Surescripts NCPDP routing.
- Real-time interaction verification and digital SHA-256 signature hashing for controlled and non-controlled medication dispensing.
- Patient pharmacy directory with NCPDP identifiers and direct fill status updates.

### 4. Appointment Scheduling & Patient Queue
- Daily calendar and list views for scheduling new consultations, follow-ups, and procedures.
- Workflow stage tracking: `Scheduled` ➔ `Checked In` ➔ `In Consultation` ➔ `Completed` / `No-Show`.
- Quick triage modal to capture vitals and chief complaints upon patient arrival.

### 5. Automated Patient Reminders
- Omnichannel automated communication engine supporting SMS and Email delivery.
- Customizable trigger rules (24-hour reminder, 2-hour reminder, post-visit instructions).
- Real-time delivery status logs (`Delivered`, `Pending`, `Confirmed`).

### 6. HIPAA Security & Privacy Compliance Suite
- **PHI Masking Toggle**: One-click obfuscation of Protected Health Information (patient names, MRNs, phone numbers, and addresses) for privacy in shared environments.
- **Session Timeout & Screen Lock**: Automated inactivity timer with emergency lock screen and PIN/passcode credential unlock.
- **Immutable HIPAA Audit Trail**: Detailed audit logging capturing every patient record access, modification, export, and prescription event with timestamps and clinician IDs.

---

## 🎨 Design Philosophy — Natural Tones Palette

MedPulse EHR is styled using a calming, high-legibility **Natural Tones** medical aesthetic tailored for long clinical shifts:
- **Canvas**: Warm Linen `#F7F6F2`
- **Containers & Modals**: Soft Alabaster `#F0EEE6` and Pure White `#FFFFFF`
- **Primary Clinical Accents**: Sage Green `#7C8B6F` & Deep Sage `#6A795F`
- **Secondary Surfaces**: Soft Sage Pill Badges `#DCE2D1`
- **Typography & Dark Contrast**: Forest Slate `#4A5443` and Warm Charcoal `#2B2D2F`
- **Alert Colors**: Soft Rose `#FFF1F2` / `#9F1239` (Allergies/Critical Labs) and Soft Amber `#FFFBEB` / `#92400E`

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Language**: [TypeScript 5.8](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Hosting / Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ or 20+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/medpulse-ehr.git
   cd medpulse-ehr
