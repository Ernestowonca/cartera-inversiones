-- Ejecutar una vez en SQL Editor de un proyecto Supabase propio.
-- Solo cada usuario autenticado puede acceder a su propia cartera.
create table public.portfolios (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null check (jsonb_typeof(payload) = 'object'),
 revision integer not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.portfolios enable row level security;
revoke all on public.portfolios from anon;
grant select, insert, update on public.portfolios to authenticated;
create policy own_select on public.portfolios for select to authenticated using ((select auth.uid()) = user_id);
create policy own_insert on public.portfolios for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_update on public.portfolios for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function public.load_portfolio() returns jsonb language sql security invoker set search_path = '' as $$
 select jsonb_build_object('payload',payload,'revision',revision)
 from public.portfolios where user_id = auth.uid();
$$;
create function public.save_portfolio(p_expected integer,p_payload jsonb) returns integer
language plpgsql security invoker set search_path = '' as $$
declare next_revision integer;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_expected is null or p_expected < 0 or p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'INVALID'; end if;
 if p_expected = 0 then
  insert into public.portfolios(user_id,payload,revision) values(auth.uid(),p_payload,1)
   on conflict(user_id) do nothing returning revision into next_revision;
 else
  update public.portfolios set payload=p_payload, revision=revision+1,updated_at=now()
   where user_id=auth.uid() and revision=p_expected returning revision into next_revision;
 end if;
 if next_revision is null then raise exception 'CONFLICT'; end if;
 return next_revision;
end;
$$;
revoke all on function public.load_portfolio() from public,anon;
revoke all on function public.save_portfolio(integer,jsonb) from public,anon;
grant execute on function public.load_portfolio() to authenticated;
grant execute on function public.save_portfolio(integer,jsonb) to authenticated;
