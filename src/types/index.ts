// User roles
export type UserRole = 'candidate' | 'employer' | 'admin';

// Nuclear industry domain types
export type Certification = 'SRO' | 'RO' | 'NRC' | 'ANSI' | 'HP' | 'RP';
export type ClearanceLevel = 'None' | 'L' | 'Q';
export type PlantType = 'PWR' | 'BWR' | 'AP1000' | 'ABWR' | 'EPR' | 'SMR';
export type ContractType = 'Outage' | 'Long-term' | 'Permanent';
export type NRCRegion = 'I' | 'II' | 'III' | 'IV';

// Database row types
export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfile extends Profile {
  role: 'candidate';
  title?: string;
  years_experience?: number;
  certifications: Certification[];
  clearance_level: ClearanceLevel;
  plant_experience: PlantType[];
  desired_rate?: number;
  available_date?: string;
  willing_to_relocate: boolean;
  resume_url?: string;
}

export interface EmployerProfile extends Profile {
  role: 'employer';
  company_id: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  location?: string;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location: string;
  remote: boolean;
  contract_type: ContractType;
  plant_type?: PlantType;
  nrc_region?: NRCRegion;
  required_certifications: Certification[];
  required_clearance: ClearanceLevel;
  min_rate?: number;
  max_rate?: number;
  start_date?: string;
  duration?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // joined
  company?: Company;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  cover_message?: string;
  created_at: string;
  updated_at: string;
  // joined
  job?: Job;
  candidate?: CandidateProfile;
}

// Phase 2: Verification & Compliance
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type ComplianceStatus = 'pending' | 'approved' | 'rejected';

export interface CertificationDocument {
  id: string;
  candidate_id: string;
  certification_type: Certification;
  document_url: string;
  status: VerificationStatus;
  expiration_date?: string;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRequirement {
  id: string;
  job_id: string;
  name: string;
  description?: string;
  required: boolean;
  created_at: string;
}

export interface ComplianceSubmission {
  id: string;
  requirement_id: string;
  application_id: string;
  document_url: string;
  status: ComplianceStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  // joined
  requirement?: ComplianceRequirement;
}
