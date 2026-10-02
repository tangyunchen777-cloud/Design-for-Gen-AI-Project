-- Run in the SQL Editor after the profiles migration. Everything rolls back.
begin;

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'profile-test-a@example.invalid'),
  ('22222222-2222-4222-8222-222222222222', 'profile-test-b@example.invalid');

do $$ begin
  if (select count(*) from public.profiles where id in (
    '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'
  ) and first_name is null and last_name is null) <> 2 then
    raise exception 'Signup trigger did not create blank profiles';
  end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

do $$ begin
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'RLS exposed another user profile';
  end if;
  update public.profiles set first_name = 'Test', last_name = 'User'
    where id = '11111111-1111-4111-8111-111111111111';
  if not found then raise exception 'Own profile update failed'; end if;
  update public.profiles set first_name = 'Wrong'
    where id = '22222222-2222-4222-8222-222222222222';
  if found then raise exception 'RLS allowed another profile update'; end if;
  begin
    update public.profiles set avatar_path = '22222222-2222-4222-8222-222222222222/photo.png'
      where id = '11111111-1111-4111-8111-111111111111';
    raise exception 'RLS allowed another user avatar path';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
rollback;
select 'PASS: signup trigger, own-profile access, cross-user protection; test users rolled back.' as result;
