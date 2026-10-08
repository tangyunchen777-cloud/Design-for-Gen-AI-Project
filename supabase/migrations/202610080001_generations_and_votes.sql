begin;

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  scene text not null check (char_length(scene) between 12 and 500),
  style text not null check (style in ('witty', 'deadpan', 'absurd')),
  prompt text not null check (char_length(prompt) between 20 and 2000),
  caption text not null check (char_length(caption) between 1 and 280),
  model text not null check (char_length(model) between 1 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id bigint generated always as identity primary key,
  generation_id uuid not null references public.generations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (generation_id, user_id)
);

create index if not exists generations_created_at_idx on public.generations (created_at desc);
create index if not exists votes_generation_id_idx on public.votes (generation_id);

alter table public.generations enable row level security;
alter table public.votes enable row level security;

revoke all on public.generations from anon, authenticated;
grant select (id, scene, style, caption, model, created_at) on public.generations to anon, authenticated;
grant insert (creator_id, scene, style, prompt, caption, model) on public.generations to authenticated;

drop policy if exists "Anyone can read generations" on public.generations;
drop policy if exists "Members create own generations" on public.generations;
create policy "Anyone can read generations" on public.generations
  for select to anon, authenticated using (true);
create policy "Members create own generations" on public.generations
  for insert to authenticated with check ((select auth.uid()) = creator_id);

revoke all on public.votes from anon, authenticated;
grant select, insert (generation_id, user_id, value), update (value, updated_at), delete on public.votes to authenticated;
grant usage, select on sequence public.votes_id_seq to authenticated;

drop policy if exists "Members read own votes" on public.votes;
drop policy if exists "Members cast own votes" on public.votes;
drop policy if exists "Members change own votes" on public.votes;
drop policy if exists "Members remove own votes" on public.votes;
create policy "Members read own votes" on public.votes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members cast own votes" on public.votes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Members change own votes" on public.votes
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Members remove own votes" on public.votes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Return aggregate totals plus only the caller's vote. Voter IDs remain private.
create or replace function public.generation_vote_summary()
returns table (generation_id uuid, upvotes bigint, downvotes bigint, score bigint, my_vote smallint)
language sql stable security definer set search_path = '' as $$
  select
    g.id,
    count(v.id) filter (where v.value = 1)::bigint,
    count(v.id) filter (where v.value = -1)::bigint,
    coalesce(sum(v.value), 0)::bigint,
    max(v.value) filter (where v.user_id = (select auth.uid()))::smallint
  from public.generations g
  left join public.votes v on v.generation_id = g.id
  group by g.id;
$$;

revoke all on function public.generation_vote_summary() from public;
grant execute on function public.generation_vote_summary() to anon, authenticated;

create or replace function public.my_generation_count_since(since_time timestamptz)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::bigint
  from public.generations
  where creator_id = (select auth.uid()) and created_at >= since_time;
$$;

revoke all on function public.my_generation_count_since(timestamptz) from public;
grant execute on function public.my_generation_count_since(timestamptz) to authenticated;

create or replace function public.cast_vote(target_generation_id uuid, new_value smallint)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new_value not in (-1, 1) then
    raise exception 'Vote must be -1 or 1';
  end if;

  insert into public.votes (generation_id, user_id, value)
  values (target_generation_id, (select auth.uid()), new_value)
  on conflict (generation_id, user_id)
  do update set value = excluded.value, updated_at = now();
end;
$$;

revoke all on function public.cast_vote(uuid, smallint) from public;
grant execute on function public.cast_vote(uuid, smallint) to authenticated;

commit;
