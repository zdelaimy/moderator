-- Auto-create profile + role-specific profile on signup
-- Reads first_name, last_name, role from auth.users.raw_user_meta_data

create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_profile_id uuid;
  user_role text;
  new_company_id uuid;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'candidate');

  -- Create base profile
  insert into public.profiles (user_id, role, first_name, last_name, email)
  values (
    new.id,
    user_role::user_role,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email
  )
  returning id into new_profile_id;

  -- Create role-specific profile
  if user_role = 'candidate' then
    insert into public.candidate_profiles (id) values (new_profile_id);
  elsif user_role = 'employer' then
    -- Create a default company
    insert into public.companies (name)
    values (
      coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' ||
      coalesce(new.raw_user_meta_data->>'last_name', '') || '''s Company'
    )
    returning id into new_company_id;

    insert into public.employer_profiles (id, company_id)
    values (new_profile_id, new_company_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger fires after insert on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
