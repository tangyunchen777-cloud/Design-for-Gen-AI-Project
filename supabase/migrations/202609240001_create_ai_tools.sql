begin;

create table public.ai_tools (
  id bigint generated always as identity primary key,
  name text not null unique,
  category text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_tools enable row level security;
revoke all on public.ai_tools from anon, authenticated;
grant select on public.ai_tools to anon, authenticated;
create policy "Anyone can read AI tools"
  on public.ai_tools for select to anon, authenticated using (true);

insert into public.ai_tools (name, category, description) values
  ('Study Buddy', 'Learning', 'An example AI assistant that explains study topics.'),
  ('Writing Helper', 'Writing', 'An example AI tool that helps draft and revise text.'),
  ('Code Companion', 'Programming', 'An example AI assistant for understanding code.');

commit;
