-- CampusOS schema. Mirrors lib/types.ts; columns are snake_case, the app sees camelCase
-- (postgres.js `transform: postgres.camel`). Applied by `npm run db:migrate`.

-- One row per Firebase Auth user; written only by that user (through /api/me).
create table users (
  uid        text primary key,                       -- Firebase Auth uid
  name       text not null default '',
  lang       text not null default 'en' check (lang in ('en', 'id')),
  class_ids  text[] not null default '{}',
  fcm_tokens text[] not null default '{}'
);

create table classes (
  id          text primary key,
  course_code text not null,
  course_name text not null,
  section     text not null,
  type        text not null check (type in ('lecture', 'lab', 'advising')),
  lecturer    text not null default '',
  -- [{day 0-6, start "HH:MM", end "HH:MM", room}], validated by the API; always read with the class.
  slots       jsonb not null default '[]' check (jsonb_typeof(slots) = 'array'),
  editors     text[] not null default '{}'           -- uids allowed to post for this class
);

create table assignments (
  id           text primary key default gen_random_uuid()::text,
  class_id     text not null references classes (id) on delete cascade,
  title        text not null,
  instructions text not null default '',
  links        text[] not null default '{}',
  due_at       timestamptz not null,
  created_by   text not null
);
create index assignments_class_due on assignments (class_id, due_at);

create table updates (
  id         text primary key default gen_random_uuid()::text,
  class_id   text not null references classes (id) on delete cascade,
  kind       text not null check (kind in ('absent', 'room_change', 'reschedule')),
  date       text not null check (date ~ '^\d{4}-\d{2}-\d{2}$'),  -- affected session, campus date
  new_room   text,
  new_time   text check (new_time ~ '^\d{2}:\d{2}$'),
  note       text not null default '',
  created_by text not null,
  created_at timestamptz not null default now()
);
create index updates_class_created on updates (class_id, created_at desc);
create index updates_date on updates (date);

-- One row per push job ever sent; the primary key is the dedupe guard for the notify route.
create table notifications (
  id         text primary key,
  kind       text not null,
  class_id   text not null,
  claimed_at timestamptz not null default now(),
  sent       int,
  failed     int,
  removed    int,
  emulated   boolean
);
