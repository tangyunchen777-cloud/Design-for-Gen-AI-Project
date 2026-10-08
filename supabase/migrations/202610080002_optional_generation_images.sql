begin;

alter table public.generations
  add column if not exists image_path text;

alter table public.generations
  drop constraint if exists generations_image_path_format;
alter table public.generations
  add constraint generations_image_path_format check (
    image_path is null or image_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
  );

revoke all on public.generations from anon, authenticated;
grant select (id, scene, style, caption, model, image_path, created_at)
  on public.generations to anon, authenticated;
grant insert (creator_id, scene, style, prompt, caption, model, image_path)
  on public.generations to authenticated;

drop policy if exists "Members create own generations" on public.generations;
drop policy if exists "Members create own image generations" on public.generations;
create policy "Members create own generations" on public.generations
  for insert to authenticated with check (
    (select auth.uid()) = creator_id
    and (
      image_path is null
      or split_part(image_path, '/', 1) = (select auth.uid())::text
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'generation-images',
  'generation-images',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can read generation images" on storage.objects;
drop policy if exists "Members upload own generation images" on storage.objects;
drop policy if exists "Members delete own generation images" on storage.objects;

create policy "Anyone can read generation images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'generation-images');

create policy "Members upload own generation images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'generation-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Members delete own generation images" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'generation-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
