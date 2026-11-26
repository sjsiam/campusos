-- "Added by {name}, {role} · {date}" on the assignment detail needs the post time.
alter table assignments add column created_at timestamptz not null default now();
