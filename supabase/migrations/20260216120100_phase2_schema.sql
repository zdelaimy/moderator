-- Phase 2: Verification & Compliance Schema

-- New enum types
create type verification_status as enum ('pending', 'verified', 'rejected');
create type compliance_status as enum ('pending', 'approved', 'rejected');

-- Certification documents uploaded by candidates
create table certification_documents (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references profiles(id) on delete cascade not null,
  certification_type text not null,
  document_url text not null,
  status verification_status default 'pending',
  expiration_date date,
  verified_by uuid references profiles(id) on delete set null,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Compliance requirements defined per job by employers
create table compliance_requirements (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade not null,
  name text not null,
  description text,
  required boolean default true,
  created_at timestamptz default now()
);

-- Compliance document submissions by candidates per requirement
create table compliance_submissions (
  id uuid primary key default uuid_generate_v4(),
  requirement_id uuid references compliance_requirements(id) on delete cascade not null,
  application_id uuid references applications(id) on delete cascade not null,
  document_url text not null,
  status compliance_status default 'pending',
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(requirement_id, application_id)
);

-- Indexes
create index idx_cert_docs_candidate on certification_documents(candidate_id);
create index idx_cert_docs_status on certification_documents(status);
create index idx_cert_docs_expiration on certification_documents(expiration_date);
create index idx_compliance_req_job on compliance_requirements(job_id);
create index idx_compliance_sub_requirement on compliance_submissions(requirement_id);
create index idx_compliance_sub_application on compliance_submissions(application_id);

-- Row Level Security
alter table certification_documents enable row level security;
alter table compliance_requirements enable row level security;
alter table compliance_submissions enable row level security;

-- Certification documents: candidates see own, employers see for their applicants, admins see all
create policy "Candidates can view own cert docs"
  on certification_documents for select using (
    candidate_id in (select id from profiles where user_id = auth.uid())
    or exists (
      select 1 from profiles where user_id = auth.uid() and role = 'admin'
    )
    or candidate_id in (
      select a.candidate_id from applications a
      join jobs j on j.id = a.job_id
      join employer_profiles ep on ep.company_id = j.company_id
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
  );

create policy "Candidates can insert own cert docs"
  on certification_documents for insert with check (
    candidate_id in (select id from profiles where user_id = auth.uid() and role = 'candidate')
  );

create policy "Candidates can update own cert docs"
  on certification_documents for update using (
    candidate_id in (select id from profiles where user_id = auth.uid())
  );

create policy "Admins can update cert docs"
  on certification_documents for update using (
    exists (select 1 from profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Candidates can delete own cert docs"
  on certification_documents for delete using (
    candidate_id in (select id from profiles where user_id = auth.uid())
  );

-- Compliance requirements: all authenticated can read, employers can manage for their jobs
create policy "Authenticated users can view compliance requirements"
  on compliance_requirements for select using (auth.uid() is not null);

create policy "Employers can insert compliance requirements"
  on compliance_requirements for insert with check (
    job_id in (
      select j.id from jobs j
      join employer_profiles ep on ep.company_id = j.company_id
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
  );

create policy "Employers can update compliance requirements"
  on compliance_requirements for update using (
    job_id in (
      select j.id from jobs j
      join employer_profiles ep on ep.company_id = j.company_id
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
  );

create policy "Employers can delete compliance requirements"
  on compliance_requirements for delete using (
    job_id in (
      select j.id from jobs j
      join employer_profiles ep on ep.company_id = j.company_id
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
  );

-- Compliance submissions: candidates see own, employers see for their jobs, admins see all
create policy "Users can view relevant compliance submissions"
  on compliance_submissions for select using (
    application_id in (
      select id from applications where candidate_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
    or requirement_id in (
      select cr.id from compliance_requirements cr
      join jobs j on j.id = cr.job_id
      join employer_profiles ep on ep.company_id = j.company_id
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
    or exists (
      select 1 from profiles where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Candidates can insert compliance submissions"
  on compliance_submissions for insert with check (
    application_id in (
      select id from applications where candidate_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

create policy "Candidates can update own compliance submissions"
  on compliance_submissions for update using (
    application_id in (
      select id from applications where candidate_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

create policy "Employers can update compliance submissions for their jobs"
  on compliance_submissions for update using (
    requirement_id in (
      select cr.id from compliance_requirements cr
      join jobs j on j.id = cr.job_id
      join employer_profiles ep on ep.company_id = j.company_id
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
create trigger cert_docs_updated_at before update on certification_documents
  for each row execute function update_updated_at();
create trigger compliance_submissions_updated_at before update on compliance_submissions
  for each row execute function update_updated_at();
