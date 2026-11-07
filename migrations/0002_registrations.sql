create table if not exists registrations (
  id          serial primary key,
  ref         text not null unique,
  kind        text not null check (kind in ('attendee', 'volunteer')),
  name        text not null,
  phone       text not null,
  phone_key   text not null,
  cohort      text not null default '',
  city        text not null default '',
  role        text not null default '',
  note        text not null default '',
  created_at  timestamptz not null default now()
);

create unique index if not exists registrations_kind_phone_idx
  on registrations (kind, phone_key);

create index if not exists registrations_created_idx
  on registrations (created_at desc);
