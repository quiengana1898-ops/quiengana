-- ============================================================
-- Auto-create a user_profiles row when a new auth.users row is inserted.
-- (SPEC §5 user_profiles / §6 roles — everyone starts as 'contributor';
-- moderator/admin are assigned manually by an admin.)
-- SECURITY DEFINER so it bypasses RLS to write the profile.
-- ============================================================
create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (user_id, display_name, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    'contributor'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
