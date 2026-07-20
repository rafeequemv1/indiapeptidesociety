-- Harden helpers: fixed search_path; revoke RPC on trigger-only / internal funcs.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

grant execute on function public.is_staff() to authenticated;
revoke all on function public.is_staff() from public, anon;
