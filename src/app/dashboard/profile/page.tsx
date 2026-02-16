'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Certification, ClearanceLevel, PlantType, UserRole } from '@/types';
import CertUpload from '@/components/cert-upload';

const CERTIFICATIONS: Certification[] = ['SRO', 'RO', 'NRC', 'ANSI', 'HP', 'RP'];
const CLEARANCE_LEVELS: ClearanceLevel[] = ['None', 'L', 'Q'];
const PLANT_TYPES: PlantType[] = ['PWR', 'BWR', 'AP1000', 'ABWR', 'EPR', 'SMR'];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');

  // Base profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // Candidate fields
  const [title, setTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [clearance, setClearance] = useState<ClearanceLevel>('None');
  const [plantExperience, setPlantExperience] = useState<PlantType[]>([]);
  const [desiredRate, setDesiredRate] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [willingToRelocate, setWillingToRelocate] = useState(false);

  // Employer fields
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');

  const [profileId, setProfileId] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      setProfileId(profile.id);
      setRole(profile.role as UserRole);
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setPhone(profile.phone ?? '');
      setLocation(profile.location ?? '');
      setBio(profile.bio ?? '');

      if (profile.role === 'candidate') {
        const { data: cand } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('id', profile.id)
          .single();

        if (cand) {
          setTitle(cand.title ?? '');
          setYearsExperience(cand.years_experience?.toString() ?? '');
          setCertifications((cand.certifications as Certification[]) ?? []);
          setClearance((cand.clearance_level as ClearanceLevel) ?? 'None');
          setPlantExperience((cand.plant_experience as PlantType[]) ?? []);
          setDesiredRate(cand.desired_rate?.toString() ?? '');
          setAvailableDate(cand.available_date ?? '');
          setWillingToRelocate(cand.willing_to_relocate ?? false);
          setResumeUrl(cand.resume_url ?? '');
        }
      } else if (profile.role === 'employer') {
        const { data: emp } = await supabase
          .from('employer_profiles')
          .select('company_id')
          .eq('id', profile.id)
          .single();

        if (emp?.company_id) {
          setCompanyId(emp.company_id);
          const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('id', emp.company_id)
            .single();

          if (company) {
            setCompanyName(company.name);
            setCompanyDescription(company.description ?? '');
            setCompanyWebsite(company.website ?? '');
            setCompanyLocation(company.location ?? '');
          }
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const supabase = createClient();

    // Update base profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName, phone, location, bio })
      .eq('id', profileId);

    if (profileError) {
      setMessage(`Error: ${profileError.message}`);
      setSaving(false);
      return;
    }

    if (role === 'candidate') {
      const { error: candError } = await supabase
        .from('candidate_profiles')
        .update({
          title,
          years_experience: yearsExperience ? parseInt(yearsExperience) : null,
          certifications,
          clearance_level: clearance,
          plant_experience: plantExperience,
          desired_rate: desiredRate ? parseFloat(desiredRate) : null,
          available_date: availableDate || null,
          willing_to_relocate: willingToRelocate,
        })
        .eq('id', profileId);

      if (candError) {
        setMessage(`Error: ${candError.message}`);
        setSaving(false);
        return;
      }
    } else if (role === 'employer' && companyId) {
      const { error: compError } = await supabase
        .from('companies')
        .update({
          name: companyName,
          description: companyDescription,
          website: companyWebsite,
          location: companyLocation,
        })
        .eq('id', companyId);

      if (compError) {
        setMessage(`Error: ${compError.message}`);
        setSaving(false);
        return;
      }
    }

    setMessage('Profile saved successfully.');
    setSaving(false);
    router.refresh();
  }

  function toggleArrayItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profileId) return;

    setUploadingResume(true);
    setMessage('');

    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const filePath = `${profileId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage(`Error: ${uploadError.message}`);
      setUploadingResume(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('candidate_profiles')
      .update({ resume_url: publicUrl })
      .eq('id', profileId);

    if (updateError) {
      setMessage(`Error: ${updateError.message}`);
    } else {
      setResumeUrl(publicUrl);
      setMessage('Resume uploaded successfully.');
    }
    setUploadingResume(false);
  }

  async function handleResumeRemove() {
    if (!profileId) return;
    setUploadingResume(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('candidate_profiles')
      .update({ resume_url: null })
      .eq('id', profileId);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setResumeUrl('');
      setMessage('Resume removed.');
    }
    setUploadingResume(false);
  }

  if (loading) {
    return <p className="text-muted">Loading profile...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Edit Profile</h1>

      {message && (
        <div className={`mb-4 p-3 text-sm rounded-lg ${message.startsWith('Error') ? 'bg-red-50 text-danger' : 'bg-green-50 text-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Base fields */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>
        </div>

        {/* Candidate-specific */}
        {role === 'candidate' && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Professional Details</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Reactor Operator"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Certifications</label>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => setCertifications(toggleArrayItem(certifications, cert))}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      certifications.includes(cert)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-muted border-border hover:border-gray-300'
                    }`}
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Clearance Level</label>
              <select
                value={clearance}
                onChange={(e) => setClearance(e.target.value as ClearanceLevel)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              >
                {CLEARANCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Plant Experience</label>
              <div className="flex flex-wrap gap-2">
                {PLANT_TYPES.map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPlantExperience(toggleArrayItem(plantExperience, pt))}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      plantExperience.includes(pt)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-muted border-border hover:border-gray-300'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Desired Rate ($/hr)</label>
                <input
                  type="number"
                  min="0"
                  value={desiredRate}
                  onChange={(e) => setDesiredRate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Available Date</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={willingToRelocate}
                onChange={(e) => setWillingToRelocate(e.target.checked)}
                className="rounded border-border"
              />
              Willing to relocate
            </label>
          </div>
        )}

        {/* Resume Upload */}
        {role === 'candidate' && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Resume</h2>
            {resumeUrl ? (
              <div className="flex items-center gap-4">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View current resume
                </a>
                <button
                  type="button"
                  onClick={handleResumeRemove}
                  disabled={uploadingResume}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted">No resume uploaded.</p>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Upload Resume (PDF, DOC, DOCX)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                className="text-sm text-muted file:mr-4 file:py-2 file:px-4 file:border file:border-border file:rounded-lg file:text-sm file:bg-card file:text-foreground hover:file:bg-gray-50"
              />
              {uploadingResume && <p className="text-xs text-muted mt-1">Uploading...</p>}
            </div>
          </div>
        )}

        {/* Certification Documents */}
        {role === 'candidate' && certifications.length > 0 && (
          <CertUpload profileId={profileId} certifications={certifications} />
        )}

        {/* Employer-specific */}
        {role === 'employer' && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Company Information</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                rows={3}
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Website</label>
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location</label>
              <input
                type="text"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
