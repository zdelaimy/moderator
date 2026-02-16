'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Certification, ClearanceLevel, ContractType, NRCRegion, PlantType } from '@/types';

const CONTRACT_TYPES: ContractType[] = ['Outage', 'Long-term', 'Permanent'];
const PLANT_TYPES: PlantType[] = ['PWR', 'BWR', 'AP1000', 'ABWR', 'EPR', 'SMR'];
const NRC_REGIONS: NRCRegion[] = ['I', 'II', 'III', 'IV'];
const CERTIFICATIONS: Certification[] = ['SRO', 'RO', 'NRC', 'ANSI', 'HP', 'RP'];
const CLEARANCE_LEVELS: ClearanceLevel[] = ['None', 'L', 'Q'];

export default function NewJobPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [contractType, setContractType] = useState<ContractType>('Outage');
  const [plantType, setPlantType] = useState('');
  const [nrcRegion, setNrcRegion] = useState('');
  const [requiredCerts, setRequiredCerts] = useState<Certification[]>([]);
  const [requiredClearance, setRequiredClearance] = useState<ClearanceLevel>('None');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [complianceReqs, setComplianceReqs] = useState<{ name: string; description: string; required: boolean }[]>([]);

  function addComplianceReq() {
    setComplianceReqs([...complianceReqs, { name: '', description: '', required: true }]);
  }

  function updateComplianceReq(index: number, field: string, value: string | boolean) {
    setComplianceReqs(complianceReqs.map((req, i) =>
      i === index ? { ...req, [field]: value } : req
    ));
  }

  function removeComplianceReq(index: number) {
    setComplianceReqs(complianceReqs.filter((_, i) => i !== index));
  }

  function toggleCert(cert: Certification) {
    setRequiredCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get employer profile & company
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data: empProfile } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('id', profile!.id)
      .single();

    if (!empProfile?.company_id) {
      setError('No company associated with your profile. Please update your profile first.');
      setLoading(false);
      return;
    }

    const { data: newJob, error: insertError } = await supabase.from('jobs').insert({
      company_id: empProfile.company_id,
      posted_by: profile!.id,
      title,
      description,
      location,
      remote,
      contract_type: contractType,
      plant_type: plantType || null,
      nrc_region: nrcRegion || null,
      required_certifications: requiredCerts,
      required_clearance: requiredClearance,
      min_rate: minRate ? parseFloat(minRate) : null,
      max_rate: maxRate ? parseFloat(maxRate) : null,
      start_date: startDate || null,
      duration: duration || null,
    }).select('id').single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Insert compliance requirements
    const validReqs = complianceReqs.filter((r) => r.name.trim());
    if (validReqs.length > 0 && newJob) {
      const { error: reqError } = await supabase.from('compliance_requirements').insert(
        validReqs.map((r) => ({
          job_id: newJob.id,
          name: r.name,
          description: r.description || null,
          required: r.required,
        }))
      );
      if (reqError) {
        setError(reqError.message);
        setLoading(false);
        return;
      }
    }

    router.push('/dashboard/jobs');
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Post a New Job</h1>

      {error && (
        <div className="mb-4 p-3 text-sm text-danger bg-red-50 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Job Details</h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Reactor Operator - Outage Support"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm pb-2">
                <input
                  type="checkbox"
                  checked={remote}
                  onChange={(e) => setRemote(e.target.checked)}
                  className="rounded border-border"
                />
                Remote available
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contract Type</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              >
                {CONTRACT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Plant Type</label>
              <select
                value={plantType}
                onChange={(e) => setPlantType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              >
                <option value="">Not specified</option>
                {PLANT_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">NRC Region</label>
            <select
              value={nrcRegion}
              onChange={(e) => setNrcRegion(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              <option value="">Not specified</option>
              {NRC_REGIONS.map((r) => (
                <option key={r} value={r}>Region {r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Requirements</h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Required Certifications</label>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATIONS.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => toggleCert(cert)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    requiredCerts.includes(cert)
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
            <label className="block text-sm font-medium text-foreground mb-1">Required Clearance</label>
            <select
              value={requiredClearance}
              onChange={(e) => setRequiredClearance(e.target.value as ClearanceLevel)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              {CLEARANCE_LEVELS.map((cl) => (
                <option key={cl} value={cl}>{cl}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Compensation & Timeline</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Min Rate ($/hr)</label>
              <input
                type="number"
                min="0"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Max Rate ($/hr)</label>
              <input
                type="number"
                min="0"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 6 months, 1 year"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Compliance Requirements</h2>
            <button
              type="button"
              onClick={addComplianceReq}
              className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Add Requirement
            </button>
          </div>
          <p className="text-sm text-muted">
            Define documents or certifications candidates must submit after being shortlisted.
          </p>
          {complianceReqs.length > 0 ? (
            <div className="space-y-3">
              {complianceReqs.map((req, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={req.name}
                        onChange={(e) => updateComplianceReq(i, 'name', e.target.value)}
                        placeholder="Requirement name"
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                      />
                      <input
                        type="text"
                        value={req.description}
                        onChange={(e) => updateComplianceReq(i, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeComplianceReq(i)}
                      className="ml-3 text-xs text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={req.required}
                      onChange={(e) => updateComplianceReq(i, 'required', e.target.checked)}
                      className="rounded border-border"
                    />
                    Required
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No compliance requirements added.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}
