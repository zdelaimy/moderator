-- Nuclear Staffing Solutions - Initial Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum types
create type user_role as enum ('candidate', 'employer', 'admin');
create type clearance_level as enum ('None', 'L', 'Q');
create type contract_type as enum ('Outage', 'Long-term', 'Permanent');
create type application_status as enum ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted');

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role user_role not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  location text,
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Candidate-specific fields
create table candidate_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  title text,
  years_experience integer,
  certifications text[] default '{}',
  clearance_level clearance_level default 'None',
  plant_experience text[] default '{}',
  desired_rate numeric(10,2),
  available_date date,
  willing_to_relocate boolean default false,
  resume_url text
);

-- Companies
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  logo_url text,
  website text,
  location text,
  created_at timestamptz default now()
);

-- Employer-specific fields
create table employer_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  company_id uuid references companies(id) on delete set null
);

-- Job postings
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  posted_by uuid references profiles(id) on delete set null,
  title text not null,
  description text not null,
  location text not null,
  remote boolean default false,
  contract_type contract_type not null,
  plant_type text,
  nrc_region text,
  required_certifications text[] default '{}',
  required_clearance clearance_level default 'None',
  min_rate numeric(10,2),
  max_rate numeric(10,2),
  start_date date,
  duration text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Applications
create table applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade not null,
  candidate_id uuid references profiles(id) on delete cascade not null,
  status application_status default 'pending',
  cover_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(job_id, candidate_id)
);

-- Indexes
create index idx_profiles_user_id on profiles(user_id);
create index idx_profiles_role on profiles(role);
create index idx_jobs_company_id on jobs(company_id);
create index idx_jobs_is_active on jobs(is_active);
create index idx_jobs_contract_type on jobs(contract_type);
create index idx_applications_job_id on applications(job_id);
create index idx_applications_candidate_id on applications(candidate_id);
create index idx_applications_status on applications(status);

-- Row Level Security
alter table profiles enable row level security;
alter table candidate_profiles enable row level security;
alter table employer_profiles enable row level security;
alter table companies enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;

-- Profiles: users can read all profiles, update only their own
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = user_id);

-- Candidate profiles: viewable by all, editable by owner
create policy "Candidate profiles are viewable by everyone"
  on candidate_profiles for select using (true);

create policy "Candidates can update own profile"
  on candidate_profiles for update using (
    id in (select id from profiles where user_id = auth.uid())
  );

create policy "Candidates can insert own profile"
  on candidate_profiles for insert with check (
    id in (select id from profiles where user_id = auth.uid() and role = 'candidate')
  );

-- Employer profiles: viewable by all, editable by owner
create policy "Employer profiles are viewable by everyone"
  on employer_profiles for select using (true);

create policy "Employers can update own profile"
  on employer_profiles for update using (
    id in (select id from profiles where user_id = auth.uid())
  );

create policy "Employers can insert own profile"
  on employer_profiles for insert with check (
    id in (select id from profiles where user_id = auth.uid() and role = 'employer')
  );

-- Companies: viewable by all, editable by associated employers
create policy "Companies are viewable by everyone"
  on companies for select using (true);

create policy "Employers can update their company"
  on companies for update using (
    id in (
      select ep.company_id from employer_profiles ep
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
  );

create policy "Authenticated users can create companies"
  on companies for insert with check (auth.uid() is not null);

-- Jobs: viewable by all, manageable by posting company's employers
create policy "Active jobs are viewable by everyone"
  on jobs for select using (true);

create policy "Employers can insert jobs for their company"
  on jobs for insert with check (
    company_id in (
      select ep.company_id from employer_profiles ep
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
  );

create policy "Employers can update their company jobs"
  on jobs for update using (
    company_id in (
      select ep.company_id from employer_profiles ep
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
  );

-- Applications: candidates see own, employers see for their jobs
create policy "Candidates can view own applications"
  on applications for select using (
    candidate_id in (select id from profiles where user_id = auth.uid())
    or job_id in (
      select j.id from jobs j
      join employer_profiles ep on ep.company_id = j.company_id
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
  );

create policy "Candidates can create applications"
  on applications for insert with check (
    candidate_id in (select id from profiles where user_id = auth.uid() and role = 'candidate')
  );

create policy "Employers can update application status"
  on applications for update using (
    job_id in (
      select j.id from jobs j
      join employer_profiles ep on ep.company_id = j.company_id
      join profiles p on p.id = ep.id
      where p.user_id = auth.uid()
    )
  );

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger jobs_updated_at before update on jobs
  for each row execute function update_updated_at();
create trigger applications_updated_at before update on applications
  for each row execute function update_updated_at();
