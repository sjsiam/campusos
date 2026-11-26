-- Board v3 (Siam, 2026-11-26): an update is only "absent" (cancelled) or "room_change". No reschedule.
delete from updates where kind = 'reschedule';
alter table updates drop column new_time;
alter table updates drop constraint updates_kind_check;
alter table updates add constraint updates_kind_check check (kind in ('absent', 'room_change'));
