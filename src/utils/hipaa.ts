import { Patient } from '../types';
import { MedicationFormularyItem, COMMON_MEDICATIONS } from '../data/mockData';

/**
 * HIPAA PHI Masking utility. When Privacy Mode is active (e.g., screen is visible in exam room),
 * sensitive patient health identifiers are masked.
 */
export function maskName(name: string, masked: boolean): string {
  if (!masked) return name;
  const parts = name.trim().split(' ');
  if (parts.length === 1) return `${parts[0][0]}. ***`;
  return `${parts[0][0]}. ${parts[parts.length - 1][0]}***`;
}

export function maskMrn(mrn: string, masked: boolean): string {
  if (!masked) return mrn;
  return `MRN-***${mrn.slice(-3)}`;
}

export function maskPhone(phone: string, masked: boolean): string {
  if (!masked) return phone;
  return `(***) ***-${phone.slice(-4)}`;
}

export function maskDob(dob: string, masked: boolean): string {
  if (!masked) return dob;
  const [year] = dob.split('-');
  return `**/**/${year}`;
}

export function maskAddress(address: string, masked: boolean): string {
  if (!masked) return address;
  const parts = address.split(',');
  return `*** Protected PHI ***, ${parts[parts.length - 1] || 'CA'}`;
}

export interface AllergyCheckResult {
  hasConflict: boolean;
  conflictDetails: string[];
  severity: 'None' | 'Moderate' | 'Severe / Anaphylaxis';
}

/**
 * Checks if the selected medication conflicts with patient's known drug allergies
 */
export function checkDrugAllergies(patient: Patient, medicationName: string): AllergyCheckResult {
  const matchingMed = COMMON_MEDICATIONS.find(
    (m) =>
      m.name.toLowerCase().includes(medicationName.toLowerCase()) ||
      medicationName.toLowerCase().includes(m.name.toLowerCase()) ||
      m.genericName.toLowerCase().includes(medicationName.toLowerCase())
  );

  const conflicts: string[] = [];
  let maxSeverity: 'None' | 'Moderate' | 'Severe / Anaphylaxis' = 'None';

  const medCheckTerms = [
    medicationName.toLowerCase(),
    matchingMed?.genericName.toLowerCase() || '',
    ...(matchingMed?.contraindicatedAllergens.map((c) => c.toLowerCase()) || []),
  ].filter(Boolean);

  for (const allergy of patient.allergies) {
    const allergenLower = allergy.allergen.toLowerCase();
    const isConflict = medCheckTerms.some(
      (term) => allergenLower.includes(term) || term.includes(allergenLower)
    );

    if (isConflict) {
      conflicts.push(
        `Documented Allergy: ${allergy.allergen} (Reaction: ${allergy.reaction}, Severity: ${allergy.severity})`
      );
      if (allergy.severity === 'Severe / Anaphylaxis') {
        maxSeverity = 'Severe / Anaphylaxis';
      } else if (maxSeverity !== 'Severe / Anaphylaxis') {
        maxSeverity = 'Moderate';
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflictDetails: conflicts,
    severity: maxSeverity,
  };
}

export interface DrugDrugInteraction {
  interactingDrug: string;
  severity: 'Major' | 'Moderate' | 'Minor';
  description: string;
}

/**
 * Checks for drug-drug interactions between the newly selected medication
 * and the patient's current active prescriptions.
 */
export function checkDrugDrugInteractions(
  patient: Patient,
  newMedicationName: string
): DrugDrugInteraction[] {
  const results: DrugDrugInteraction[] = [];
  const med = newMedicationName.toLowerCase();

  for (const rx of patient.activePrescriptions) {
    const existing = rx.medicationName.toLowerCase();

    // Interaction: ACE Inhibitor (Lisinopril) + Potassium / Spironolactone
    if (
      (med.includes('lisinopril') && existing.includes('potassium')) ||
      (med.includes('potassium') && existing.includes('lisinopril'))
    ) {
      results.push({
        interactingDrug: rx.medicationName,
        severity: 'Major',
        description:
          'Concurrent ACE-inhibitor and potassium supplementation markedly increases hyperkalemia risk. Serum K+ monitoring required.',
      });
    }

    // Interaction: Anticoagulant (Apixaban / Eliquis / Warfarin) + NSAIDs (Ibuprofen / Naproxen / Aspirin)
    if (
      (med.includes('ibuprofen') || med.includes('aspirin') || med.includes('naproxen')) &&
      (existing.includes('eliquis') || existing.includes('apixaban') || existing.includes('warfarin'))
    ) {
      results.push({
        interactingDrug: rx.medicationName,
        severity: 'Major',
        description:
          'Severe bleeding risk: Combining NSAIDs with oral anticoagulants substantially escalates upper GI hemorrhage hazard.',
      });
    }

    // Interaction: Metformin + Contrast or Renal stressing agents
    if (
      (med.includes('metformin') && existing.includes('contrast')) ||
      (med.includes('contrast') && existing.includes('metformin'))
    ) {
      results.push({
        interactingDrug: rx.medicationName,
        severity: 'Moderate',
        description: 'Lactic acidosis potential: Withhold metformin prior to iodinated radiocontrast.',
      });
    }

    // Interaction: Beta-blocker + Albuterol
    if (
      (med.includes('albuterol') && existing.includes('propranolol')) ||
      (med.includes('propranolol') && existing.includes('albuterol'))
    ) {
      results.push({
        interactingDrug: rx.medicationName,
        severity: 'Moderate',
        description: 'Non-selective beta-blockers antagonize bronchodilatory action of beta-2 agonists.',
      });
    }
  }

  return results;
}

export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
