# CampusOS screens

Owner: Designer. Builder: Developer. Read `system.md` first; component names and class
strings come from there. Wireframes are 360px wide phone, one column.

## v3 (read this first)

**Status:** board v3, approved by Siam 2026-11-26. Visual source of
truth: Artifact "CampusOS board v3" (`docs/design/board-v3/index.html`). Tokens and components:
`system.md` v3.

**How to read this file:**
- Where a section below shows a Beranda wireframe (greeting band, round shortcuts, sticker,
  rounded cards), **the layout in this v3 section and on the board wins.**
- The logic, states and copy keys in those sections still apply unless the list below removes
  them.

### Removed in v3 (do not build)
- Reschedule as an update kind: only **cancelled** and **room moved**. Drop `badge.reschedule`,
  `updates.kindTime`, `updates.newTime`, `updates.svcTime`, `sticker.newTime`, `sticker.was`,
  and the push "Rescheduled" texts.
- Editing an assignment: no `/assignments/[id]/edit` and no edit-mode rules or keys
  (`editor.editTitle`, `editor.saveChanges`). Editors can **create** and **delete**.
- `/docs` (cut until after the demo).
- **Cut by Siam 2026-11-26:**
  - `/changelog` page and every link to it (`login.changelog`, `land.changelog`, `cl.*`);
  - the desktop week timetable: desktop reuses the two-pane layout (system.md §5);
  - an offline app shell: when offline, only the `common.offline` message shows;
  - CO-32 polish: the state catalogue in §13 is reference only, not a ticket to finish.
- Beranda pieces:
  - greeting (`greet.*`);
  - RoomNow card and sticker (`hero.*`, `sticker.*`);
  - round shortcuts (`short.*`, except "Report change", which moves into the app bar);
  - the Updates FAB;
  - Login decorative cards (`login.demo*`);
  - pills and countdown tiles.

### One sample day (use it in seed demos and tests too)
Wednesday 25 Nov 2026, 10:25 WIB, student Siti Rahma (class rep of TKE-205):

| Time | Class | Status |
|---|---|---|
| 07:30–09:10 | TKE-201 Sistem Digital, Ruang 301 | past |
| 09:20–11:00 | TKE-205 Struktur Data | now; moved Ruang 204 → 305 by Siti Rahma at 07:58, "Proyektor di 204 rusak." |
| 11:10–12:00 | TKE-108 Matematika Diskrit, Kelas B, Ruang 207 | next |
| 12:00–13:30 | free | gap row |
| 13:30–16:30 | TKE-201P Praktikum Sistem Digital, Lab Elektronika | cancelled by Fajar Maulana (asisten lab) at 09:47, note with typos kept as written |
| 16:00–16:50 | ADV Bimbingan Akademik, Ruang Dosen 2 | later |

Deadlines: Kuis 2 (overdue 10 h), Tugas 3 Linked List (today 23:59), Laporan Modul 4 (Fri
16:00), Latihan Bab 5 (Mon 07:30), Proyek akhir proposal (8 Dec). Updates: the two above, plus
TKE-108 moved to Ruang 302 for Thu (lecturer, yesterday 20:12) and TKE-201 Fri cancelled
(lecturer, Mon). Pushes at 07:58, 09:47 and 10:40 (TKE-108 starts in 30 min).

### Screens (phone unless noted)

| Screen | Layout (v3) |
|---|---|
| Login | Top bar: wordmark + language switch. Bottom: title "Masuk ke CampusOS", one sentence on who it is for, the Google button, a hint, no changelog link (cut). No illustration. |
| Onboarding 1–3 | Teal app bar with "Langkah n dari 3" (+ back). Step 1 is a radio list; step 2 lists sections under each course with their meeting times, checkbox rows with hairlines, sticky "Lanjut · 5 kelas" (or "Simpan" when reopened from Account, QA-05); step 3 shows the real notification it will send, then "Aktifkan pengingat" / "Nanti saja". iPhone Safari shows the Home Screen steps here instead and is **never skipped**. |
| Today | App bar (date, summary, Lapor perubahan for reps, language, avatar) → now band (only during a class) → timetable rows with durations and gap rows → "Tenggat dekat" (2 rows) → bottom nav. The current class appears both as the band and as the tinted row. One "Berikutnya". Cancelled rows show "Dosen berhalangan" / "Asisten berhalangan" plus the rep's note. |
| Assignments | App bar with "Tambah" (editors). Tabs "Belum 5 / Selesai 3". Groups Lewat tenggat / Hari ini / Minggu ini / Nanti as deadline rows. |
| Assignment detail | App bar with back. Course line, full title, a due line with the big countdown, instructions, links, "Ditambahkan oleh …", "Tandai selesai", and for editors a red "Hapus tugas" text button. Delete asks inline: "Hapus untuk 38 mahasiswa? Tidak bisa dibatalkan." [Hapus] [Jangan]. |
| New assignment | App bar with ✕. Class (segmented), title, due (segmented: Pertemuan berikutnya / 1 minggu lagi / Tanggal lain, plus a read-back "Sen 30 Nov, 13:30 WIB"), instructions, one link, sticky "Kirim ke 38 mahasiswa". |
| Updates | App bar (with the rep action) + update items, newest first; unread tinted. |
| Report change | Bottom sheet over Today. Class line, kind (segmented Batal / Pindah ruang), session radio list (today's session pre-selected, next session, other date), new room (big figures), note, "Kirim ke 38 mahasiswa". For Batal the room field is hidden. |
| Account | Bottom sheet: name, email, role; rows Ubah kelas › / Bahasa (EN/ID segmented) / Pengingat (status); "Keluar" (danger outline). |
| Reminders off | Notice under the app bar on Today: text, [Aktifkan], [Nanti], ✕. |
| iPhone hint | Notice "Di iPhone, pengingat hanya jalan setelah …" + "Lihat caranya" → sheet with 3 steps. |
| Push | Same three events as Today (07:58, 09:47, 10:40). Texts in §11 minus the reschedule rows. |
| Landing `/` | Signed-out only. One screen: wordmark, language, sign-in; headline + one paragraph; "Masuk dengan Google"; (no changelog link, cut); **a real screenshot of the built Today** (phone frame); footer "Dibuat oleh Sudo Squad untuk GDG ITB case 1". Desktop: text left, screenshot right. |
| ~~Changelog `/changelog`~~ (cut 2026-11-26) | Top bar (wordmark, language, sign-in). Title, then releases newest first: version (`font-fig`), date, bullet list. Single column, max 680px / about 65ch. Content from `CHANGELOG.md`. |

Wide screens (≥ 768px, tablet and desktop alike): side rail + two panes, spec in **system.md §5** (breakpoints, which pane holds what, rail). The board's desktop week grid and changelog plates are cut.

### New and changed copy keys (EN / ID)

The ID column is a **draft for Alfiz / Siam to proofread** (marked ⟨cek⟩). Course names and
reps' notes are never translated.

| Key | EN | ID ⟨cek⟩ |
|---|---|---|
| `today.summary` | {n} classes · {c} cancelled · {m} moved | {n} kelas · {c} batal · {m} pindah |
| `now.label` | Now | Sekarang |
| `now.until` | until {time} | sampai {time} |
| `now.movedBy` | Moved from {was} by {by}, {at} | Pindah dari {was} oleh {by}, {at} |
| `row.next` | Next | Berikutnya |
| `row.cancelled` | Cancelled | Batal |
| `row.absentLecturer` | Lecturer absent | Dosen berhalangan |
| `row.absentAssistant` | Lab assistant absent | Asisten berhalangan |
| `row.gap` | Free {s}–{e} ({len}) | Kosong {s}–{e} ({len}) |
| `dur.hm` | {h}h {m}m | {h}j {m}m |
| `today.dueSoon` | Due soon | Tenggat dekat |
| `today.all` | All | Semua |
| `report.action` | Report change | Lapor perubahan |
| `report.title` | Report a change | Lapor perubahan |
| `report.kind` | What changed | Apa yang berubah |
| `report.session` | Which session | Sesi yang mana |
| `report.note` | Note for students (optional) | Catatan untuk teman sekelas (opsional) |
| `report.send` | Send to {n} students | Kirim ke {n} mahasiswa |
| `update.cancelled` / `update.moved` | Cancelled / Room moved | Batal / Pindah ruang |
| `update.new` | New | Baru |
| `update.you` | you | kamu |
| `assign.add` | Add | Tambah |
| `assign.delete` | Delete assignment | Hapus tugas |
| `assign.deleteConfirm` | Delete for all {n} students? This can't be undone. | Hapus untuk {n} mahasiswa? Tidak bisa dibatalkan. |
| `assign.deleteYes` / `assign.deleteNo` | Delete / Keep | Hapus / Jangan |
| `assign.addedBy` | Added by {by}, {role} · {at} | Ditambahkan oleh {by}, {role} · {at} |
| `new.next` / `new.week` / `new.other` | Next class / In 1 week / Other date | Pertemuan berikutnya / 1 minggu lagi / Tanggal lain |
| `new.post` | Post to {n} students | Kirim ke {n} mahasiswa |
| `login.title` | Sign in to CampusOS | Masuk ke CampusOS |
| `login.body` | Class schedule, assignments and room changes for Computer Engineering students at Universitas Syiah Kuala. | Jadwal kuliah, tugas, dan info pindah ruang untuk mahasiswa Teknik Komputer Universitas Syiah Kuala. |
| `login.hint` | Use the Google account you use for campus. | Pakai akun Google yang biasa kamu pakai untuk kuliah. |
| `login.changelog` | What's new | Yang baru |
| `onb.count` | Continue · {n} classes | Lanjut · {n} kelas |
| `rem.text` | Reminders are off. Turn them on to hear when a class is cancelled or moved. | Pengingat belum aktif. Aktifkan supaya tahu kalau kelas batal atau pindah ruang. |
| `rem.on` / `rem.later` | Turn on / Later | Aktifkan / Nanti |
| `ios.text` | On iPhone, reminders only work after you add CampusOS to the Home Screen. | Di iPhone, pengingat hanya jalan setelah CampusOS ditambahkan ke Layar Utama. |
| `ios.how` | Show me how | Lihat caranya |
| `acc.out` | Sign out | Keluar |
| `land.headline` | Your timetable, with room changes the moment a class rep posts them. | Jadwal kuliahmu, dengan info pindah ruang begitu ketua kelas mengirimnya. |
| `land.body` | For Computer Engineering students at Universitas Syiah Kuala. Class reps post a cancellation or a new room; the whole class sees it on Today and gets a notification. | Untuk mahasiswa Teknik Komputer Universitas Syiah Kuala. Ketua kelas mengirim info batal atau ruang baru; seluruh kelas melihatnya di Hari ini dan dapat notifikasi. |
| `land.cta` | Sign in with Google | Masuk dengan Google |
| `land.changelog` | Changelog | Catatan rilis |
| `land.footer` | Made by Sudo Squad for GDG ITB case 1 | Dibuat oleh Sudo Squad untuk GDG ITB case 1 |
| `cl.title` | Changelog | Catatan rilis |
| `nav.updates` | Updates | Info kelas |
| `week.title` | Week of {range} | Minggu {range} |
| `side.changes` | Changes this week | Perubahan minggu ini |

---

Copy keys go into `messages/en.json` and `messages/id.json` (flat keys, same style as today).
Existing keys are reused, marked *(exists)*. `{n}`, `{name}` etc. are placeholders the call site
replaces. Indonesian copy is plain, informal-polite campus Indonesian; Siam or a native speaker
on the team should read it once before the demo.

Routes:

| Screen | Route | Bottom nav |
|---|---|---|
| Login | `/login` | hidden |
| Onboarding | `/onboarding` | hidden |
| Today | `/today` (start_url) | shown |
| Assignments list | `/assignments` | shown |
| Assignment detail | `/assignments/[id]` | shown |
| Updates feed | `/updates` | shown |
| Post update | `/updates/new` | hidden (it is a focused task) |
| New assignment | `/assignments/new` (create only) | hidden |
| Landing | `/` (signed out) | hidden |
| ~~Changelog~~ | ~~`/changelog`~~ (cut) | – |
| Account sheet | sheet over any tab | shown |
| Add to Home Screen hint | banner on Today + step in Onboarding | n/a |

Routing rule: not signed in → `/login`. Signed in but profile has no `classIds` → `/onboarding`.
Otherwise the requested page. While auth is resolving, show a full-screen centred spinner
(no flash of the login page).

Shared copy:

| Key | EN | ID |
|---|---|---|
| `common.retry` | Try again | Coba lagi |
| `common.dismiss` | Dismiss | Tutup |
| `common.back` | Back | Kembali |
| `common.save` | Save | Simpan |
| `common.cancel` | Cancel | Batal |
| `common.offline` | You're offline. Showing the last saved data. | Kamu sedang offline. Menampilkan data terakhir. |
| `common.loadError` | Couldn't load. Check your connection. | Gagal memuat. Periksa koneksi kamu. |
| `role.classrep` | class rep | ketua kelas |
| `role.labassistant` | lab assistant | asisten lab |
| `role.lecturer` | lecturer | dosen |
| `type.lecture` | Lecture | Kuliah |
| `type.lab` | Lab | Praktikum |
| `type.advising` | Advising | Bimbingan |

Offline: Firestore's offline cache shows last data; when `navigator.onLine` is false show the
`common.offline` Banner at the top of Today, Assignments and Updates.

---

## 1. Login `/login` *(Beranda wireframe: layout superseded by v3 above)*

```
┌──────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← HeaderBand (bg-head), top ~55% of the screen
│▓                  (Bahasa Indonesia)▓│  ← language pill
│▓                                  ▓│
│▓  ◉ CampusOS                      ▓│  ← logo disc (sun) + name, text-[32px] font-extrabold
│▓  Your classes, assignments and   ▓│
│▓  class changes in one place.     ▓│  ← text-on-head-muted, 18px
│▓   ┌─────────┐ ┌──────────┐       ▓│  ← two decorative mini cards: "Ruang 305 · Moved!"
│▓   │Ruang 305│ │13 hours  │       ▓│     sticker and a countdown tile (aria-hidden), showing
│▓   └─────────┘ └──────────┘       ▓│     what the app does; no illustration
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  ╭──────────────────────────────╮│  ← white sheet, rounded-t-sheet, overlaps band by 24px
│  │ (G) Continue with Google     ││  ← Primary button
│  ╰──────────────────────────────╯│
│  Use your student Google account. │  ← text-sm text-muted, centred
└──────────────────────────────────┘
```

- Content vertically centred, button pinned near the bottom third (thumb reach).
- Sign-in method: Google only (Siam's decision, 2026-11-25). Use `signInWithPopup` by default;
  in the installed iOS app (`navigator.standalone === true`) popups can fail, so use
  `signInWithRedirect` there.
- States:
  - Loading (after tap): button disabled with spinner, label stays.
  - Error: `text-sm text-danger` line above the button, `role="alert"`.
    Popup closed by user: no error, just re-enable.
  - The two mini cards in the band are decoration (`aria-hidden`) and use the real Sticker and
    countdown-tile components with sample text from `login.demoRoom` / `login.demoDue`.
  - Signed in: route per routing rule above.

| Key | EN | ID |
|---|---|---|
| `appName` *(exists)* | CampusOS | CampusOS |
| `login.tagline` | Your classes, assignments and class changes in one place. | Jadwal, tugas, dan info perubahan kelas dalam satu tempat. |
| `login.google` | Continue with Google | Masuk dengan Google |
| `login.hint` | Use your student Google account. | Gunakan akun Google mahasiswa kamu. |
| `login.error` | Sign-in failed. Please try again. | Gagal masuk. Silakan coba lagi. |
| `login.demoRoom` | Ruang 305 | Ruang 305 |
| `login.demoDue` | 13 hours | 13 jam |
| `lang.switch` *(exists)* | Bahasa Indonesia | English |

---

## 2. Onboarding `/onboarding`

Three short steps, one per screen, progress shown as "Step 1 of 3". Back button top-left on
steps 2-3. Beranda styling: a short teal HeaderBand (`pb-5`) holds the step label, back button
and title; content sits on the tinted ground in white rounded cards; the sticky Primary button
is `rounded-full min-h-14`. Saves to the profile with `saveProfile` at the end of step 2 (so a student who
skips step 3 is still set up).

### Step 1: Language

```
┌──────────────────────────────────┐
│ Step 1 of 3                      │
│ Choose your language             │  ← page title
│ Pilih bahasa                     │  ← shown in BOTH languages on this step only
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ◉  English                   │ │  ← radio card, min-h-16, rounded-card
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ ○  Bahasa Indonesia          │ │
│ └──────────────────────────────┘ │
│                                  │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Continue                     │ │  ← Primary, sticky bottom
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

- Default: browser language (`navigator.language` starts with `id` → Indonesian, else English).
- Selecting calls `setLang` immediately so the rest of onboarding is in that language.
- Radio card: `<label>` around a real radio, `min-h-16 rounded-card bg-surface px-4`; selected =
  `bg-primary-soft ring-2 ring-inset ring-primary font-semibold`.

### Step 2: Pick your classes

```
┌──────────────────────────────────┐
│ ←  Step 2 of 3                   │
│ Pick your classes                │
│ Choose every class and section   │
│ you attend this semester.        │  ← text-muted
│ ┌──────────────────────────────┐ │
│ │ 🔍 Search code or name        │ │  ← input, filters list as you type
│ └──────────────────────────────┘ │
│ TKE-2104 Computer Networks       │  ← group heading (course)
│ ┌──────────────────────────────┐ │
│ │ ☑ Sec A · Lecture · Mon 09:00│ │  ← checkbox row, min-h-14
│ │ ☐ Sec B · Lecture · Tue 13:00│ │
│ │ ☑ Lab 2 · Lab · Thu 14:00    │ │
│ └──────────────────────────────┘ │
│ TKE-2201 Embedded Systems        │
│ │ ...                          │ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Continue (3 selected)        │ │  ← Primary, sticky bottom, disabled at 0
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

- Data: `listClasses()`, grouped by `courseCode` (sorted), rows sorted by section.
- Row text: `{class.section} · {type} · {first slot day short} {start}`; the extra slot days
  are not needed here.
- Search matches `courseCode` and `courseName`, case-insensitive. No match → `onb.noMatch`.
- Sticky button sits above the safe area; list gets `pb-28` so the last row is not hidden.
- States:
  - Loading: 3 Skeleton groups.
  - Empty (no classes seeded): EmptyState `onb.noClasses`, no button.
  - Error: ErrorState with retry.
  - Saving: button spinner. Save error: `text-danger` line above the button.
- Students change classes later from the Account sheet (section 12), which reopens this step
  alone (`/onboarding?step=2`, Back returns to the previous page). In this edit mode the button
  label is `common.save` ("Save" / "Simpan"), not the count (QA-05).
- Class rows: each course group is one white `rounded-card` with rows divided by `border-line`;
  checkbox `size-5 accent-primary`.

### Step 3: Reminders

```
┌──────────────────────────────────┐
│ ←  Step 3 of 3                   │
│ Get reminders                    │
│ We'll remind you 30 minutes      │
│ before class, before deadlines,  │
│ and when a class is cancelled or │
│ moved.                           │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Turn on reminders            │ │  ← Primary → Notification.requestPermission
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ Not now                      │ │  ← Secondary → /today
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

- This is the soft prompt. All behaviour (which variant to show per platform, granted /
  denied / iPhone not installed / unsupported) is in section 10.
- **Never skip this step on iPhone/iPad.** Safari tabs have no `Notification` object, so the
  check "no Notification → skip" must come *after* the iOS check: iOS + not installed shows the
  Add-to-Home-Screen steps (section 8) with "Not now"; only non-iOS browsers without
  notifications skip the step.
- Layout: a 64px `bg-primary-soft` bell disc above the title, then body, then the sticky
  buttons (Primary "Turn on reminders", Secondary "Not now").

| Key | EN | ID |
|---|---|---|
| `onb.step` | Step {n} of 3 | Langkah {n} dari 3 |
| `onb.langTitle` | Choose your language | Pilih bahasa |
| `onb.continue` | Continue | Lanjut |
| `onb.continueCount` | Continue ({n} selected) | Lanjut ({n} dipilih) |
| `onb.classesTitle` | Pick your classes | Pilih kelas kamu |
| `onb.classesBody` | Choose every class and section you attend this semester. | Pilih semua kelas dan seksi yang kamu ikuti semester ini. |
| `onb.search` | Search code or name | Cari kode atau nama |
| `onb.noMatch` | No class matches "{q}". | Tidak ada kelas yang cocok dengan "{q}". |
| `onb.noClasses` | No classes yet. Ask your class rep to add them. | Belum ada kelas. Minta ketua kelas untuk menambahkannya. |
| `onb.saveError` | Couldn't save. Try again. | Gagal menyimpan. Coba lagi. |
| `onb.remindTitle` | Get reminders | Aktifkan pengingat |
| `onb.remindBody` | We'll remind you 30 minutes before class, before deadlines, and when a class is cancelled or moved. | Kami akan mengingatkan 30 menit sebelum kelas, sebelum tenggat, dan saat kelas batal atau pindah. |
| `onb.remindOn` | Turn on reminders | Aktifkan pengingat |
| `onb.notNow` | Not now | Nanti saja |

---

## 3. Today `/today` *(layout superseded by v3 above)*

```
┌──────────────────────────────────┐
│▓ (Bahasa Indonesia)          (S) ▓│  ← HeaderBand: language pill, avatar (sun) → Account
│▓ Good morning, Siti              ▓│  ← greeting by WIB hour, text-on-head-muted
│▓ Wednesday, 25 November          ▓│  ← text-2xl font-bold
│▓▓╭──────────────────────────────╮▓│
│  │ In progress now   until 11:40│ │  ← RoomNow card, overlaps the band by 48px
│  │ Ruang 305           ╱Moved! ╲│ │  ← 42px extrabold room; sun sticker "from 204"
│  │ Struktur Data · TKE-205      │ │
│  ╰──────────────────────────────╯ │
│  (+)      (▦)       (☑)      (📣) │  ← Shortcuts: Report change (editors only, sun),
│ Report  Tomorrow  Assignm.  Updates│     Tomorrow, Assignments (count), Updates (unread)
│                                  │
│ Today                            │  ← section heading
│ ┌──────────────────────────────┐ │
│ │08:00 Sistem Digital          │ │  ← past: transparent + ring-line, muted
│ │09:40 Ruang 301 · Lecture     │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │13:30 ~~Praktikum Sist. Dig.~~ [Cancelled]│  ← red pill
│ │16:00 Lecturer absent         │ │  ← text-danger
│ │      Asisten lab ujian, ...  │ │  ← rep's note, 13px muted
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │16:00 Bimbingan Akademik [Next]│ │ ← teal pill
│ │17:00 Ruang Dosen 2 · Advising│ │
│ └──────────────────────────────┘ │
│ Due soon                 See all │
│ ┌──────────────────────────────┐ │
│ │[13 ] Tugas 3: Linked List    │ │  ← AssignmentCard with countdown tile
│ │[hrs] TKE-205 · Today 23:59   │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ (▦)Today   ☑ Assignments  📣 Updates│  ← BottomNav, active icon in a teal pill
└──────────────────────────────────┘
```

Data and logic:
- Classes: user's `classIds` → each `slots[]` where `day === selected day` (`Date#getDay` in
  Asia/Jakarta). One timeline row per slot, sorted by `start`.
- Updates: from `listUpdates(classIds)` take those with `date` equal to the selected date;
  attach to the matching class card. If several for one class, the newest wins.
  `absent` → cancelled card; `room_change` → room line shows `newRoom`; `reschedule` → time
  column shows `newTime` and the card re-sorts by the new time.
- The class in progress is not repeated in the list: it is the RoomNow card (rules for which
  class the card shows, and the cancelled variant, are in system.md §5 RoomNow).
- "Next" pill = the first not-cancelled slot that starts after now; only one row gets it, and it
  is shown even while another class is in progress (QA-01). Past rows use the past style.
  Re-evaluate every minute (`setInterval(60_000)`), no live clock.
- Tomorrow: the "Tomorrow" shortcut switches the screen to tomorrow (`/today?day=tomorrow`):
  band title "Tomorrow, Thursday 26 November" / "Besok, Kamis 26 November", no RoomNow card,
  no now/next/past styling, and the shortcut turns into "Today" to switch back. This replaces
  the old Today/Tomorrow segmented control.
- Cancelled row: meta line `today.lecturerAbsent` in `text-danger`, then the rep's `note` as a
  smaller third line (13px, muted, max 2 lines). If the note is empty the third line is left out.
- Shortcut counts: Assignments = items due in the next 48h (the same set as Due soon);
  Updates = unread updates. Hidden at 0.
- Due soon: assignments with `dueAt` in the next 48h or overdue up to 24h ago, sorted by
  `dueAt`, max 3. Section hidden if none (no empty state for this section).
- Page title is the date (the nav already says "Today").

States:
- Loading: band with greeting, a RoomNow skeleton (`h-[132px] rounded-hero`), 3 row skeletons.
- Empty (no slots that day): EmptyState `today.empty` *(exists)* with body `today.emptyBody`.
  Due soon still shows below it.
- Error: ErrorState `common.loadError` + retry. If cached data exists, show it with the
  offline Banner instead of the error.

| Key | EN | ID |
|---|---|---|
| `nav.today` *(exists)* | Today | Hari ini |
| `today.tomorrow` | Tomorrow | Besok |
| `today.classes` | Classes | Kelas |
| `today.now` | Now | Sekarang |
| `today.next` | Next | Berikutnya |
| `today.lecturerAbsent` | Lecturer absent | Dosen berhalangan |
| `today.dueSoon` | Due soon | Segera dikumpulkan |
| `today.seeAll` | See all | Lihat semua |
| `today.empty` *(exists)* | No classes today. | Tidak ada kelas hari ini. |
| `today.emptyTomorrow` | No classes tomorrow. | Tidak ada kelas besok. |
| `today.emptyBody` | Enjoy the free time. | Selamat menikmati waktu luang. |
| `greet.morning` | Good morning, {name} | Selamat pagi, {name} |
| `greet.midday` | Good afternoon, {name} | Selamat siang, {name} |
| `greet.afternoon` | Good afternoon, {name} | Selamat sore, {name} |
| `greet.evening` | Good evening, {name} | Selamat malam, {name} |
| `today.tomorrowTitle` | Tomorrow, {date} | Besok, {date} |
| `hero.inProgress` | In progress now | Sedang berlangsung |
| `hero.until` | until {time} | sampai {time} |
| `hero.next` | Next class | Kelas berikutnya |
| `hero.inMin` | in {n} min | {n} menit lagi |
| `hero.at` | at {time} | jam {time} |
| `hero.tomorrow` | Tomorrow | Besok |
| `hero.cancelled` | Cancelled | Batal |
| `sticker.moved` | Moved! | Pindah! |
| `sticker.from` | from {room} | dari {room} |
| `sticker.newTime` | New time! | Jam baru! |
| `sticker.was` | was {time} | tadinya {time} |
| `short.report` | Report change | Lapor perubahan |
| `short.tomorrow` | Tomorrow | Besok |
| `short.today` | Today | Hari ini |
| `badge.absent` | Cancelled | Batal |
| `badge.room_change` | Room moved | Pindah ruang |
| `badge.reschedule` | New time | Jam berubah |

---

## 4. Assignments list `/assignments` *(layout superseded by v3 above)*

```
┌──────────────────────────────────┐
│▓ (Bahasa Indonesia)          (+) ▓│  ← HeaderBand; (+) sun disc = Add (editors only)
│▓ Assignments                     ▓│
│▓ ( To do )( Done )               ▓│  ← pill tabs in the band
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│ Overdue                          │  ← section heading
│ ┌──────────────────────────────┐ │
│ │[Late] Kuis 2: perbaikan      │ │  ← countdown tile red: "Late" + "10 h"
│ │[10 h] TKE-201 · Tue 23:59    │ │
│ └──────────────────────────────┘ │
│ Today                            │
│ ┌──────────────────────────────┐ │
│ │[ 13 ] Tugas 3: Implementasi  │ │  ← warn tile
│ │[hours] Linked List           │ │
│ │       TKE-205 · 23:59        │ │
│ └──────────────────────────────┘ │
│ This week                        │
│ │[ 2  ] Laporan Praktikum M. 4 │ │  ← teal tile
│ Later                            │
│ │[ 13 ] Proyek akhir: proposal │ │  ← grey tile
└──────────────────────────────────┘
```

- Data: `listAssignments(classIds)` (already sorted by `dueAt`).
- Groups: Overdue (`dueAt` < now), Today (due before midnight WIB today), This week
  (< 7 days), Later. Empty groups are not shown.
- Editors (uid in `editors` of at least one of their classes, or `role === "admin"`) see a
  round "+" button in the band, right side (`size-11 rounded-full bg-sun text-on-sun`,
  `aria-label` = `assignments.add`), linking to `/assignments/new`. Students see the avatar
  there instead (Account); editors reach Account from Today.
- Done: per-device, stored in localStorage as a list of assignment ids (no Firestore field
  exists for it). `shortcut:` device-only, does not sync across phones; fine for the demo.
  "Done" tab lists done ones, newest due first, countdown tile replaced by the done tile
  (check icon), title `text-muted`.
- Overdue items older than 14 days and not done drop off the To do tab (avoid a wall of red
  from old semesters' seed data).
- States:
  - Loading: 4 assignment Skeletons.
  - Empty To do: EmptyState `assignments.empty` *(exists)* + `assignments.emptyBody`.
  - Empty Done: EmptyState `assignments.emptyDone`.
  - Error: ErrorState + retry.

| Key | EN | ID |
|---|---|---|
| `nav.assignments` *(exists)* | Assignments | Tugas |
| `assignments.todo` | To do | Belum |
| `assignments.done` | Done | Selesai |
| `assignments.overdue` | Overdue | Lewat tenggat |
| `assignments.today` | Today | Hari ini |
| `assignments.thisWeek` | This week | Minggu ini |
| `assignments.add` | Add | Tambah |
| `assignments.later` | Later | Nanti |
| `assignments.empty` *(exists)* | No assignments yet. | Belum ada tugas. |
| `assignments.emptyBody` | New assignments from your classes will show up here. | Tugas baru dari kelas kamu akan muncul di sini. |
| `assignments.emptyDone` | Nothing marked done yet. | Belum ada tugas yang selesai. |
| `due.overdue` | Overdue | Lewat tenggat |
| `due.hours` | Due in {n}h | {n} jam lagi |
| `due.days` | {n} days | {n} hari |
| `due.late` | Late | Lewat |
| `unit.hours` | hours | jam |
| `unit.h` | {n} h | {n} jam |
| `unit.days` | days | hari |

## 5. Assignment detail `/assignments/[id]` *(layout superseded by v3 above)*

The "one uniform format": every assignment shows the same five blocks in the same order.

```
┌──────────────────────────────────┐
│▓ (←)                    (✎ Edit) ▓│  ← short HeaderBand: back disc, Edit pill (editors)
│▓ TKE-205 · Struktur Data         ▓│  ← text-on-head-muted
│▓ Tugas 3: Implementasi Linked    ▓│  ← text-2xl font-bold, wraps fully
│▓ List                            ▓│
│▓▓╭──────────────────────────────╮▓│
│  │[ 13 ] Due                    │ │  ← due card overlaps the band (like RoomNow):
│  │[hours] Wed 25 Nov, 23:59 WIB │ │     countdown tile + full date
│  ╰──────────────────────────────╯ │
│ Instructions                     │
│ ┌──────────────────────────────┐ │
│ │ Implement a singly linked... │ │  ← white card, whitespace-pre-line
│ └──────────────────────────────┘ │
│ Links                            │
│ ┌──────────────────────────────┐ │
│ │ (🔗) elearning.usk.ac.id/…  ↗ │ │  ← each link a row min-h-14
│ └──────────────────────────────┘ │
│ Posted by Siti Rahma (class rep) │  ← text-sm text-muted
│ ╭──────────────────────────────╮ │
│ │ ✓ Mark as done               │ │  ← Secondary (teal-soft); done: "Done ✓ · Undo"
│ ╰──────────────────────────────╯ │
└──────────────────────────────────┘
```

- Links show hostname + path start, `break-all`; `rel="noopener noreferrer" target="_blank"`.
  Only render `http:`/`https:` URLs as links (plain text otherwise).
- No links → Links block hidden. Empty instructions → `assignments.noInstructions`.
- Back goes to `/assignments` (or browser back if it came from Today).
- States: Loading (title + block skeletons); Not found/no access → EmptyState
  `assignments.notFound` + back button; Error → ErrorState.

| Key | EN | ID |
|---|---|---|
| `assignments.due` | Due | Tenggat |
| `assignments.instructions` | Instructions | Instruksi |
| `assignments.links` | Links | Tautan |
| `assignments.noInstructions` | No instructions given. | Tidak ada instruksi. |
| `assignments.postedBy` | Posted by {name} | Diposting oleh {name} |
| `assignments.markDone` | Mark as done | Tandai selesai |
| `assignments.isDone` | Done | Selesai |
| `assignments.undo` | Undo | Batalkan |
| `assignments.notFound` | This assignment isn't available. | Tugas ini tidak tersedia. |
| `assignments.edit` | Edit | Ubah |

---

## 6. Updates feed `/updates` *(layout superseded by v3 above)*

```
┌──────────────────────────────────┐
│▓ (Bahasa Indonesia)          (S) ▓│
│▓ Updates                         ▓│
│▓ Only verified class reps, lab   ▓│  ← text-on-head-muted, one line of trust
│▓ assistants and lecturers post.  ▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│ ┌──────────────────────────────┐ │
│ │(✕) Cancelled [New]    1h ago │ │  ← UpdateItem: kind disc, kind word, New pill
│ │    Praktikum Sistem Digital  │ │
│ │    Today 13:30               │ │
│ │    Asisten lab ujian, ...    │ │
│ │    Fajar Maulana · lab asst ✓│ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │(🚪) Room moved [New]   2h ago │ │
│ │    Struktur Data · TKE-205   │ │
│ │    Today 10:00 → Ruang 305   │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │(⏱) New time        yesterday │ │
│ └──────────────────────────────┘ │
│                ╭───────────────╮ │
│                │ + Report change│ │  ← FAB (editors only), sun: bg-sun text-on-sun
│                ╰───────────────╯ │
├──────────────────────────────────┤
│  Today   Assignments   (📣)Updates│
└──────────────────────────────────┘
```

- Data: `listUpdates(classIds)`, newest first. UpdateItem from `system.md`.
- Session date line: "Today" / "Tomorrow" / weekday + date, plus slot start time of that
  class on that weekday.
- Updates whose `date` is more than 7 days in the past are hidden (keeps the feed short).
- Poster name/role: needs the poster's display name and role. `ClassUpdate` only has
  `createdBy` (uid). **Ask Developer**: denormalise `posterName` and `posterRole` onto the
  update doc at write time (cheapest), otherwise show only "Verified class rep ✓" without name.
- FAB "Report change": shown only when the user's uid is in `editors` of at least one of their
  classes. `fixed bottom-20 right-4 min-h-14 rounded-full bg-sun px-5 font-bold text-on-sun
  shadow-card` (sits above the nav; aligned to the `max-w-md` column on wide screens). Opens
  the Post-update sheet.
- The other entry for posters is the "Report change" shortcut on Today, which opens the sheet
  pre-filled with the RoomNow class and today's session (or the next class they edit). This is
  the fastest path for a rep standing outside an empty classroom.
- Opening this page sets "last seen" (localStorage) → clears the nav dot.
- States:
  - Loading: 3 Skeletons `h-28`.
  - Empty: EmptyState `updates.empty` *(exists)* + `updates.emptyBody`.
  - Error: ErrorState + retry.

| Key | EN | ID |
|---|---|---|
| `nav.updates` *(exists)* | Updates | Info kelas |
| `nav.newUpdates` | New | Baru |
| `class.section` | Sec {s} | Kelas {s} |
| `updates.trust` | Only verified class reps, lab assistants and lecturers can post. | Hanya ketua kelas, asisten lab, dan dosen terverifikasi yang bisa memposting. |
| `updates.empty` *(exists)* | No class updates. | Tidak ada info kelas. |
| `updates.emptyBody` | Cancelled or moved classes will show up here. | Kelas yang batal atau pindah akan muncul di sini. |
| `updates.post` | Post update | Kirim info |
| `updates.reportChange` | Report change | Laporkan perubahan |
| `updates.verified` | Verified {role} | {role} terverifikasi |
| `date.today` | Today | Hari ini |
| `date.tomorrow` | Tomorrow | Besok |

---

## 7. Post update `/updates/new` (class reps, lab assistants, lecturers) *(layout superseded by v3 above)*

Goal: posted in under 30 seconds, one hand, standing in a corridor. Target: 3 taps + room
name for the common case. Everything defaults; only what changes is asked.

Beranda: a **bottom sheet** over the page the rep came from (route `/updates/new` renders the
sheet over a teal band showing the chosen class), like picking a service in a super-app. The
three kinds are round "service" buttons.

```
┌──────────────────────────────────┐
│▓ Struktur Data · TKE-205     (✕) ▓│  ← band: chosen class (tap = class chips), close
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│╭────────────────────────────────╮│  ← Sheet, rounded-t-sheet
│              ───                 │  ← grab handle
│ Report a class change            │  ← text-[22px] font-bold
│   (✕)        (🚪)        (⏱)     │  ← service buttons, 104px tall, single-select
│ Cancelled   New room   New time  │     selected: bg-primary-soft ring-2 ring-primary
│ Session                          │
│ (Today 10:00) (Fri 27 10:00) (Other)│ ← chips, first pre-selected
│ New room                         │  ← only for "New room"; Big input, autofocus
│ ╭──────────────────────────────╮ │
│ │ Ruang 305                    │ │
│ ╰──────────────────────────────╯ │
│ Note (optional)                  │
│ ╭──────────────────────────────╮ │
│ │ Projector broken in 204.     │ │
│ ╰──────────────────────────────╯ │
│ ╭──────────────────────────────╮ │
│ │   Send to 38 students        │ │  ← Primary, rounded-full, min-h-14
│ ╰──────────────────────────────╯ │
└──────────────────────────────────┘
```

Behaviour:
- Class: only classes where the user is in `editors`. Pre-selected from `?classId=`, from the
  RoomNow class, or if there is exactly one. The band shows the chosen class; when the rep edits
  more than one class, tapping it shows class chips at the top of the sheet.
- Kind: no default (the one decision that must be deliberate). Conditional field appears
  right after choosing:
  - Cancelled → no extra field.
  - Room → "New room" text input, autofocused, required. `enterKeyHint="send"`.
  - Time → "New start time" `<input type="time">`, required.
- Session: chips for the next two upcoming sessions of the class (from `slots`, campus time),
  first one pre-selected, or from `?date=`. "Other date" reveals `<input type="date">`
  (min today, max +30 days).
- Note: optional, 200 chars, counter shown only past 150. Free language; never translated.
- Button label includes the student count if cheap to get; otherwise `updates.submit`
  ("Post and notify class"). Do not block on it.
- Submit: `createUpdate`. Button spinner. On success: go back to where they came from and show
  a toast-like Banner at top for 4s, `bg-ok-soft text-ok`, `role="status"`: `updates.posted`.
- Double-submit guard: button disabled while saving.
- Validation (inline, on submit): kind missing → error under "What changed?"; room/time empty →
  error under that field. Focus moves to the first error.
- Error from Firestore (e.g. rules deny because not an editor): `text-danger` line above the
  button, `role="alert"`, keep everything typed.
- Not a poster visiting the URL: EmptyState `updates.notAllowed` + back.
- Offline: Firestore queues the write; show `updates.queued` instead of `updates.posted`.

Time budget (common case, room change, from Today's "Report change"): class + session
pre-filled → tap Room (1) → type ~12 chars (≈8s) → tap Post (2). Well under 30s.
QA can time this.

| Key | EN | ID |
|---|---|---|
| `updates.formTitle` | Post class update | Kirim info kelas |
| `updates.class` | Class | Kelas |
| `updates.whatChanged` | What changed? | Apa yang berubah? |
| `updates.kindAbsent` | Cancelled | Batal |
| `updates.kindRoom` | Room | Ruang |
| `updates.kindTime` | Time | Jam |
| `updates.session` | Which session? | Sesi yang mana? |
| `updates.otherDate` | Other date | Tanggal lain |
| `updates.newRoom` | New room | Ruang baru |
| `updates.newTime` | New start time | Jam mulai baru |
| `updates.note` | Note (optional) | Catatan (opsional) |
| `updates.notePlaceholder` | e.g. Assignment posted on the LMS instead | mis. Diganti tugas di LMS |
| `updates.submit` | Post and notify class | Kirim dan beri tahu kelas |
| `updates.submitCount` | Send to {n} students | Kirim ke {n} mahasiswa |
| `updates.sheetTitle` | Report a class change | Lapor perubahan kelas |
| `updates.svcAbsent` | Cancelled | Batal |
| `updates.svcRoom` | New room | Pindah ruang |
| `updates.svcTime` | New time | Ganti jam |
| `updates.posted` | Posted. Students are being notified. | Terkirim. Mahasiswa sedang diberi tahu. |
| `updates.queued` | Saved offline. It will post when you're back online. | Disimpan offline. Akan terkirim saat online. |
| `updates.errKind` | Choose what changed. | Pilih apa yang berubah. |
| `updates.errRoom` | Enter the new room. | Isi ruang baru. |
| `updates.errTime` | Enter the new time. | Isi jam baru. |
| `updates.errPost` | Couldn't post. Try again. | Gagal mengirim. Coba lagi. |
| `updates.notAllowed` | Only verified class reps, lab assistants and lecturers can post updates. | Hanya ketua kelas, asisten lab, dan dosen terverifikasi yang bisa mengirim info. |

---

## 8. iPhone "Add to Home Screen" hint

Why: on iOS, web push (reminders, change alerts) only works once the app is added to the
Home Screen (iOS 16.4+). Without it the reminders core feature silently does nothing.

Show when ALL are true:
- iOS/iPadOS Safari (UA contains `iPhone|iPad` or `Macintosh` with touch, and not
  `CriOS|FxiOS|EdgiOS`; other iOS browsers can't install, show `install.useSafari` instead).
- Not installed: `navigator.standalone !== true`.
- Not dismissed in the last 7 days (localStorage timestamp).

Where: Banner on Today under the shortcuts, and inline in Onboarding step 3.

Banner (collapsed):
```
┌──────────────────────────────────┐
│ ⓘ Add CampusOS to your Home     ✕│
│   Screen to get class reminders. │
│   How?                           │  ← text button, opens sheet
└──────────────────────────────────┘
```

Sheet (the standard `<Sheet>` from system.md: rounded-t-sheet, scrim, ✕, Escape, swipe-down,
focus trapped; step numbers in 28px `bg-primary-soft text-primary` discs):
```
┌──────────────────────────────────┐
│ Add to Home Screen             ✕ │
│                                  │
│ 1  Tap the Share button  [⬆︎]     │  ← draw the iOS share glyph as inline SVG
│    at the bottom of Safari.      │
│ 2  Scroll and tap                │
│    "Add to Home Screen" [⊞]      │
│ 3  Tap "Add", then open CampusOS │
│    from your Home Screen.        │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Got it                       │ │  ← Primary, closes + sets dismissed
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```
- "Add to Home Screen" stays in quotes because it is Safari's own label; on an
  Indonesian-language iPhone it reads "Tambah ke Layar Utama", so the ID copy uses that.
- Steps are a real `<ol>`.
- Android/Chrome: no custom UI in MVP (Chrome shows its own install prompt once the manifest
  has PNG icons, see the `shortcut:` in `app/manifest.ts`).

| Key | EN | ID |
|---|---|---|
| `install.banner` | Add CampusOS to your Home Screen to get class reminders. | Tambahkan CampusOS ke Layar Utama agar dapat pengingat kelas. |
| `install.how` | How? | Caranya? |
| `install.title` | Add to Home Screen | Tambah ke Layar Utama |
| `install.step1` | Tap the Share button at the bottom of Safari. | Ketuk tombol Bagikan di bagian bawah Safari. |
| `install.step2` | Scroll and tap "Add to Home Screen". | Gulir lalu ketuk "Tambah ke Layar Utama". |
| `install.step3` | Tap "Add", then open CampusOS from your Home Screen. | Ketuk "Tambah", lalu buka CampusOS dari Layar Utama. |
| `install.gotIt` | Got it | Mengerti |
| `install.useSafari` | Open this page in Safari to add it to your Home Screen and get reminders. | Buka halaman ini di Safari untuk menambahkannya ke Layar Utama dan dapat pengingat. |

---

## 9. New assignment `/assignments/new` (class editors; v3: create only, edit mode removed)

Goal: same speed as the update form, posted in under 30 seconds. One uniform format: every
assignment has exactly these fields from `Assignment`, in this order. Bottom nav hidden.

Who: users whose uid is in `editors` of the class, or `role === "admin"`. Entry points:
"+" on the Assignments band (section 4), "Edit" on the detail (section 5).

Beranda: full screen (not a sheet: it has more fields). Short teal band with close (✕) and the
title; fields on white `rounded-card` groups on the tinted ground; due quick picks are chips;
sticky Primary button `rounded-full min-h-14`.

```
┌──────────────────────────────────┐
│ ✕   New assignment               │  ← close (size-11) → back; title per mode
│                                  │
│ CLASS                            │
│ (TKE-2104 Sec A) (TKE-2201 Lab 2)│  ← chips, single-select; hidden if only 1 class
│                                  │
│ Title                            │
│ ┌──────────────────────────────┐ │
│ │ Lab report 3: Subnetting     │ │  ← required, autofocus, maxLength 100
│ └──────────────────────────────┘ │
│                                  │
│ DUE (WIB)                        │
│ (Next class) (In 1 week) (Pick date)│ ← chips, single-select
│ ┌───────────────┐┌─────────────┐ │
│ │ 📅 27/11/2026 ││ 🕐 23:59    │ │  ← date + time inputs, always visible, editable
│ └───────────────┘└─────────────┘ │
│ Thursday 27 November, 23:59 WIB  │  ← text-sm text-muted, read-back of the choice
│                                  │
│ Instructions (optional)          │
│ ┌──────────────────────────────┐ │
│ │                              │ │  ← textarea rows=4, auto-grow, maxLength 2000
│ └──────────────────────────────┘ │
│                                  │
│ Links (optional)                 │
│ ┌──────────────────────────┐ ┌─┐ │
│ │ https://drive.google.com…│ │✕│ │  ← type="url" inputMode="url", remove size-11
│ └──────────────────────────┘ └─┘ │
│ + Add link                       │  ← text button, hidden at 5 links
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Post assignment              │ │  ← Primary, sticky bottom; edit: "Save changes"
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

Behaviour:
- Class: chips of classes the user can edit; pre-selected from `?classId=` or when there is
  exactly one (block hidden). In edit mode the class shows as plain text, not editable
  (`classId` must not change, CO-17).
- Due quick chips fill the date and time inputs; the inputs stay editable afterwards:
  - "Next class": start date + time of the class's next session after now (`lib/schedule.ts`,
    CO-18). Hidden if the class has no slots.
  - "In 1 week": today + 7 days, 23:59.
  - "Pick date": focuses the date input; time defaults to 23:59.
  - Create mode: nothing pre-selected (due date is a deliberate choice). Edit mode: inputs
    filled from `dueAt`, no chip selected.
- Time zone: inputs mean WIB, whatever the phone's zone. Build `dueAt` as
  ``new Date(`${date}T${time}:00+07:00`)`` and display with `timeZone: "Asia/Jakarta"`.
  The read-back line under the inputs shows the exact result so an international student
  on a home-zone phone can see what will be saved.
- Links: start with one empty row only after "+ Add link" (no empty row by default). Trim;
  drop empty rows on save. Max 5.
- Save: create → `createAssignment` with `createdBy` = uid; edit → update title,
  instructions, links, dueAt only (`classId`, `createdBy` untouched). Button spinner,
  disabled while saving. Success → detail page of that assignment with the success Banner
  (`bg-ok-soft text-ok`, `role="status"`, 4s): `editor.saved`.
- Leaving with unsaved changes (✕ or back): `confirm(editor.discard)` (native dialog is
  fine for the MVP).
- Delete: not in MVP (rules allow it; add only if the Lead tickets it).

Validation (on submit, inline under the field, focus moves to the first error):

| Case | Key |
|---|---|
| No class chosen | `editor.errClass` |
| Title empty (after trim) | `editor.errTitle` |
| Date or time missing | `editor.errDue` |
| Due time in the past (create mode only; edit allows it so old items can be fixed) | `editor.errPast` |
| A link that isn't `http://` or `https://` | `editor.errLink` (under that row) |
| Firestore error | `editor.errSave`, `role="alert"` above the button, nothing typed is lost |

States: Loading (edit mode, fetching the assignment: field skeletons); Not allowed (not an
editor of that class, or opening the URL as a student): EmptyState `editor.notAllowed` +
back; Not found (edit of a missing id): EmptyState `assignments.notFound` + back.

Time budget (rep on the Assignments list, one class): tap Add → type title (≈10s) → tap
"Next class" → tap Post. About 15s.

| Key | EN | ID |
|---|---|---|
| `editor.newTitle` | New assignment | Tugas baru |
| `editor.editTitle` | Edit assignment | Ubah tugas |
| `editor.class` | Class | Kelas |
| `editor.title` | Title | Judul |
| `editor.titlePlaceholder` | e.g. Lab report 3: Subnetting | mis. Laporan praktikum 3: Subnetting |
| `editor.due` | Due (WIB) | Tenggat (WIB) |
| `editor.nextClass` | Next class | Pertemuan berikutnya |
| `editor.inWeek` | In 1 week | 1 minggu lagi |
| `editor.pickDate` | Pick date | Pilih tanggal |
| `editor.dueReadback` | {date}, {time} WIB | {date}, {time} WIB |
| `editor.instructions` | Instructions (optional) | Instruksi (opsional) |
| `editor.links` | Links (optional) | Tautan (opsional) |
| `editor.addLink` | Add link | Tambah tautan |
| `editor.removeLink` | Remove link | Hapus tautan |
| `editor.post` | Post assignment | Kirim tugas |
| `editor.saveChanges` | Save changes | Simpan perubahan |
| `editor.saved` | Saved. Students in this class can see it now. | Tersimpan. Mahasiswa di kelas ini sudah bisa melihatnya. |
| `editor.discard` | Discard your changes? | Buang perubahan kamu? |
| `editor.errClass` | Choose a class. | Pilih kelas. |
| `editor.errTitle` | Enter a title. | Isi judul. |
| `editor.errDue` | Choose a due date and time. | Pilih tanggal dan jam tenggat. |
| `editor.errPast` | The due time has already passed. | Waktu tenggat sudah lewat. |
| `editor.errLink` | Links must start with http:// or https://. | Tautan harus diawali http:// atau https://. |
| `editor.errSave` | Couldn't save. Try again. | Gagal menyimpan. Coba lagi. |
| `editor.notAllowed` | Only this class's reps, lab assistants and lecturer can add assignments. | Hanya ketua kelas, asisten lab, dan dosen kelas ini yang bisa menambah tugas. |

---

## 10. Notification permission (CO-26)

Rules:
- Never ask on first load, and never call `Notification.requestPermission()` outside a tap
  handler (iOS ignores it otherwise; other browsers may quietly block sites that ask unprompted).
- Always show our own explanation first (the soft prompt); the browser's dialog only appears
  after the user taps "Turn on reminders". A "Not now" costs nothing; a browser "Block" is
  close to permanent, so we only trigger it when the user has already said yes.

### Where it is asked
1. Onboarding step 3 (section 2): the first and main ask.
2. Today Banner, if the user tapped "Not now": shown from the next day, dismissible, comes
   back at most every 7 days (localStorage timestamp), stops after 3 dismissals.
3. Account sheet (section 12), Reminders row: always available, never pushy.

Today shows at most one of these Banners at a time: the install hint (section 8) on iOS
not installed, otherwise the reminders Banner. They never stack.

### Which variant to show (same decision on all three surfaces)

Check in this order:

| # | Condition | Show |
|---|---|---|
| 1 | iOS/iPadOS and not installed (`navigator.standalone !== true`) | Install variant: "Reminders on iPhone need CampusOS on your Home Screen" + the section 8 steps. No permission button (Safari tabs can't get push). |
| 2 | iOS installed but no `Notification` / `PushManager` (iOS older than 16.4) | `notif.iosOld`, no button. |
| 3 | No `Notification`, `serviceWorker` or `PushManager` (other old browsers) | Nothing on onboarding (skip step 3) or Today; Account row says `notif.unsupported`. |
| 4 | `Notification.permission === "default"` | Soft prompt: body + "Turn on reminders" + "Not now". |
| 5 | `"granted"` | Get the FCM token, `addFcmToken` (arrayUnion, so no duplicates). Do this silently on every app start too, so a rotated token is saved. Onboarding goes on to `/today`. Account row: `notif.on`. |
| 6 | `"denied"` | No button (the browser won't show its dialog again). Account row shows `notif.blocked` + the how-to for this platform below. |

After the user taps "Turn on reminders":
- Granted → token saved → `/today` (from onboarding) or the Banner turns into a 4s
  `bg-ok-soft` confirmation `notif.enabled`.
- Denied → `/today` (from onboarding). Today shows ONE Banner, once ever:
  `notif.deniedBanner` with a link "How to turn on" that opens the Account sheet. That
  covers CO-26's "shows how to enable it later".
- Dismissed without choosing (permission still `default`) → treat as "Not now".
- Token request fails (offline, FCM error) → keep `granted`, retry on next app start; no error
  shown to the student.

### iPhone flow, end to end
1. Student opens the link in Safari, signs in, onboards. Step 3 shows the install variant.
2. Student adds to Home Screen and opens CampusOS from the icon.
3. **The installed app has its own storage, separate from Safari** (cookies + localStorage).
   So: they sign in again (Login screen), onboarding is skipped (profile is in Firestore),
   but the language in localStorage is gone. **Developer: after sign-in, if localStorage has
   no `lang`, call `setLang(profile.lang)`.** Also save `lang` to the profile when it is
   changed (step 1, Account sheet) so the push texts (section 11) use it.
4. First open in standalone with permission `default` → Today shows the soft-prompt Banner
   immediately (not "from the next day"), since this is the moment it can work.
5. Tap → iOS dialog → granted → token saved.

### How to turn on later (blocked state, shown in the Account sheet)

| Platform (detect by UA) | Key |
|---|---|
| iPhone/iPad (installed) | `notif.howIos` |
| Android, installed app | `notif.howAndroidApp` |
| Android Chrome tab, desktop browsers | `notif.howBrowser` |

Soft-prompt Banner on Today:
```
┌──────────────────────────────────┐
│ 🔔 Get a reminder 30 min before  ✕│
│    class and when it's moved.    │
│    [Turn on reminders]           │  ← Primary, w-auto px-4
└──────────────────────────────────┘
```

| Key | EN | ID |
|---|---|---|
| `notif.banner` | Get a reminder 30 min before class and when it's moved. | Dapatkan pengingat 30 menit sebelum kelas dan saat kelas pindah. |
| `notif.turnOn` | Turn on reminders | Aktifkan pengingat |
| `notif.iosInstall` | Reminders on iPhone need CampusOS on your Home Screen. | Pengingat di iPhone butuh CampusOS di Layar Utama. |
| `notif.iosOld` | Reminders need iOS 16.4 or newer. You can still check Today and Updates. | Pengingat butuh iOS 16.4 atau lebih baru. Kamu tetap bisa melihat Hari ini dan Info kelas. |
| `notif.unsupported` | This browser can't show reminders. | Browser ini tidak bisa menampilkan pengingat. |
| `notif.enabled` | Reminders are on. | Pengingat aktif. |
| `notif.deniedBanner` | Reminders are off, so you won't hear about cancelled or moved classes. | Pengingat mati, jadi kamu tidak akan tahu jika kelas batal atau pindah. |
| `notif.howLink` | How to turn on | Cara mengaktifkan |
| `notif.on` | On | Aktif |
| `notif.off` | Off | Mati |
| `notif.blocked` | Blocked in settings | Diblokir di pengaturan |
| `notif.howIos` | Open iPhone Settings → Notifications → CampusOS → turn on Allow Notifications. | Buka Pengaturan iPhone → Notifikasi → CampusOS → aktifkan Izinkan Notifikasi. |
| `notif.howAndroidApp` | Press and hold the CampusOS icon → App info → Notifications → turn on. | Tekan lama ikon CampusOS → Info aplikasi → Notifikasi → aktifkan. |
| `notif.howBrowser` | Tap the icon left of the web address → Permissions → Notifications → Allow, then reload. | Ketuk ikon di kiri alamat web → Izin → Notifikasi → Izinkan, lalu muat ulang. |

---

## 11. Push notification texts (CO-20, CO-25)

Sent by Cloud Functions in the student's `profile.lang` (default `en`). Keys live in
`messages/*.json` under `push.*`; the functions may import those files or copy them (Developer's
call), but the wording must match this table.

Placeholders: `{code}` course code, `{course}` course name, `{start}` slot start (e.g.
`09:00`, ID uses `09.00`), `{room}` effective room, `{title}` assignment title, `{due}`
weekday + time ("Fri 23:59" / "Jum 23.59"), `{date}` "today" / "tomorrow" / "Mon 1 Dec" in the
student's language, `{newRoom}`, `{oldTime}`, `{newTime}`, `{note}`.

| Event | Key | EN | ID |
|---|---|---|---|
| Class in 30 min | `push.classSoon.title` | {code} starts in 30 min | {code} mulai 30 menit lagi |
| | `push.classSoon.body` | {course} · {start} · {room} | {course} · {start} · {room} |
| Class in 30 min, room changed today | `push.classSoonMoved.body` | {course} · {start} · Moved to {room} | {course} · {start} · Pindah ke {room} |
| Deadline in 24 h | `push.due24.title` | Due in 24 hours: {title} | Tenggat 24 jam lagi: {title} |
| | `push.due24.body` | {code} · due {due} WIB | {code} · tenggat {due} WIB |
| Deadline in 1 h | `push.due1.title` | Due in 1 hour: {title} | Tenggat 1 jam lagi: {title} |
| | `push.due1.body` | {code} · due {due} WIB. Submit now. | {code} · tenggat {due} WIB. Kumpulkan sekarang. |
| Room change | `push.room.title` | {code}: room moved | {code}: pindah ruang |
| | `push.room.body` | {date} {start} → {newRoom}. {note} | {date} {start} → {newRoom}. {note} |
| Lecturer absent | `push.absent.title` | {code} cancelled | {code} batal |
| | `push.absent.body` | {date} {start}: lecturer absent. {note} | {date} {start}: dosen berhalangan. {note} |
| Rescheduled | `push.reschedule.title` | {code}: new time | {code}: jam berubah |
| | `push.reschedule.body` | {date}: {oldTime} → {newTime}. {note} | {date}: {oldTime} → {newTime}. {note} |

Rules:
- Title uses the course code, not the full name: lock screens cut titles at about 40
  characters. Truncate `{title}` to 40 characters with "…".
- `{note}`: the poster's text as written (not translated), trimmed to 80 characters with "…".
  If empty, drop it and the space before it.
- Class reminder skipped when that session is cancelled; uses the new room/time when changed
  (CO-20). A change posted less than 30 min before class sends only the update push, not both.
- Tap target (`data.url` / `fcmOptions.link`): class reminder → `/today`, deadline →
  `/assignments/{id}`, update → `/updates`.
- `tag` so repeats replace, not stack: `class-{classId}-{date}` for the reminder and updates
  of that session (a later correction replaces the earlier alert), `due-{assignmentId}` for
  deadlines.
- Icon: the 192px app icon (CO-27). No sound/vibration settings (browser default).

---

## 12. Account sheet *(layout superseded by v3 above)* (CO-09 sign-out, CO-10 change classes/language, CO-26 how to re-enable)

Opened from the avatar in the HeaderBand on Today and Updates (and Assignments for students):
`size-11 rounded-full bg-sun text-on-sun font-bold` showing the first letter of the user's
name, `aria-label` = `account.open`. It is the standard `<Sheet>`. It holds exactly: who is
signed in, **Change classes**, **Language**, Reminders status, **Sign out** (QA-02).

```
┌──────────────────────────────────┐
│              ───                 │  ← grab handle
│ Account                       (✕)│
│ (S) Siti Rahma                   │  ← 48px sun avatar + name
│     siti.rahma@mhs.usk.ac.id     │  ← text-sm text-muted, break-all
│ ┌──────────────────────────────┐ │
│ │(▦) Change classes   4 classes›│ │  ← rows in one white card group, min-h-14,
│ │(文) Language  (English)(Indonesia)│   divided by border-line
│ │(🔔) Reminders          [On]   │ │  ← status pill; how-to line when blocked
│ └──────────────────────────────┘ │
│ ╭──────────────────────────────╮ │
│ │ Sign out                     │ │  ← Danger button (bg-danger-soft text-danger)
│ ╰──────────────────────────────╯ │
└──────────────────────────────────┘
```

- Sign out: no confirm. `signOut()` → `/login`.
- Reminders row by state (section 10): install variant → `notif.iosInstall` + "How?" opening
  the section 8 sheet; unsupported/old iOS → that text; default → `notif.off` + button;
  granted → `notif.on`; denied → `notif.blocked` + how-to.

| Key | EN | ID |
|---|---|---|
| `account.open` | Account | Akun |
| `account.title` | Account | Akun |
| `account.classes` | Change classes | Ubah kelas |
| `account.classCount` | {n} classes | {n} kelas |
| `account.language` | Language | Bahasa |
| `account.reminders` | Reminders | Pengingat |
| `account.signOut` | Sign out | Keluar |

---

## 13. State catalogue (CO-32; polish cut 2026-11-26, reference only)

One row per screen/state. Developer ticks "Built", QA ticks "Checked". IDs are for bug
reports ("ST-14 fails"). Components (Skeleton, EmptyState, ErrorState, Banner) are in
`system.md` §4. Error states always keep what the user typed and offer a retry.

| ID | Screen | State | Shows | Built | Checked |
|---|---|---|---|---|---|
| ST-01 | Auth gate (any route) | Loading | Full-screen centred spinner, no login flash | [ ] | [ ] |
| ST-02 | Login | Loading | Google button disabled + spinner, label kept | [ ] | [ ] |
| ST-03 | Login | Error | `login.error` above button, `role="alert"`; closed popup shows nothing | [ ] | [ ] |
| ST-04 | Onboarding 2 Classes | Loading | 3 skeleton groups | [ ] | [ ] |
| ST-05 | Onboarding 2 Classes | Empty | EmptyState `onb.noClasses`, no Continue button | [ ] | [ ] |
| ST-06 | Onboarding 2 Classes | No search match | `onb.noMatch` | [ ] | [ ] |
| ST-07 | Onboarding 2 Classes | Error loading | ErrorState `common.loadError` + retry | [ ] | [ ] |
| ST-08 | Onboarding 2 Classes | Saving / save error | Button spinner / `onb.saveError` above button | [ ] | [ ] |
| ST-09 | Onboarding 3 Reminders | Variants | Install / iOS old / skipped / soft prompt per §10 table | [ ] | [ ] |
| ST-10 | Today | Loading | Band + RoomNow skeleton + 3 row skeletons | [ ] | [ ] |
| ST-11 | Today | Empty day | EmptyState `today.empty` / `today.emptyTomorrow` + `today.emptyBody`; Due soon still shown | [ ] | [ ] |
| ST-12 | Today | Error | ErrorState + retry; with cached data: data + offline Banner instead | [ ] | [ ] |
| ST-13 | Today | No due-soon items | Due soon section hidden | [ ] | [ ] |
| ST-14 | Today | Changed class | Sticker on RoomNow / pill on the row; cancelled row shows "Lecturer absent" + note, never hidden; Next pill on one row (QA-01) | [ ] | [ ] |
| ST-15 | Assignments list | Loading | 4 assignment skeletons | [ ] | [ ] |
| ST-16 | Assignments list | Empty To do | EmptyState `assignments.empty` + `assignments.emptyBody` | [ ] | [ ] |
| ST-17 | Assignments list | Empty Done | EmptyState `assignments.emptyDone` | [ ] | [ ] |
| ST-18 | Assignments list | Error | ErrorState + retry | [ ] | [ ] |
| ST-19 | Assignment detail | Loading | Title + block skeletons | [ ] | [ ] |
| ST-20 | Assignment detail | Not found / no access | EmptyState `assignments.notFound` + back | [ ] | [ ] |
| ST-21 | Assignment detail | Error | ErrorState + retry | [ ] | [ ] |
| ST-22 | Assignment detail | No links / no instructions | Links block hidden / `assignments.noInstructions` | [ ] | [ ] |
| ST-23 | Assignment editor | Loading (edit) | Field skeletons | [ ] | [ ] |
| ST-24 | Assignment editor | Validation | Inline errors per §9 table, focus to first | [ ] | [ ] |
| ST-25 | Assignment editor | Saving / save error | Button spinner / `editor.errSave`, input kept | [ ] | [ ] |
| ST-26 | Assignment editor | Not allowed / not found | EmptyState `editor.notAllowed` / `assignments.notFound` + back | [ ] | [ ] |
| ST-27 | Assignment editor | Success | Detail page + `editor.saved` Banner 4s | [ ] | [ ] |
| ST-28 | Updates feed | Loading | 3 skeletons `h-28` | [ ] | [ ] |
| ST-29 | Updates feed | Empty | EmptyState `updates.empty` + `updates.emptyBody` | [ ] | [ ] |
| ST-30 | Updates feed | Error | ErrorState + retry | [ ] | [ ] |
| ST-31 | Updates feed | Unread | "New" pill (system.md UpdateItem) + nav dot; cleared on open | [ ] | [ ] |
| ST-32 | Post update | Validation | `updates.errKind` / `errRoom` / `errTime`, focus to first | [ ] | [ ] |
| ST-33 | Post update | Saving / error | Button spinner / `updates.errPost`, input kept | [ ] | [ ] |
| ST-34 | Post update | Success / offline | `updates.posted` / `updates.queued` Banner 4s | [ ] | [ ] |
| ST-35 | Post update | Not allowed | EmptyState `updates.notAllowed` + back | [ ] | [ ] |
| ST-36 | Install hint | Shown / hidden | iOS Safari not installed only; dismissed 7 days; `install.useSafari` in other iOS browsers | [ ] | [ ] |
| ST-37 | Reminders Banner (Today) | Default / denied once | Soft prompt per §10 / `notif.deniedBanner` once ever | [ ] | [ ] |
| ST-38 | Account sheet | Reminders row | One of the six §10 states | [ ] | [ ] |
| ST-39 | Any tab | Offline | `common.offline` Banner on Today, Assignments, Updates | [ ] | [ ] |
| ST-40 | Any screen | Indonesian at 360px | No clipped or overlapping text, no horizontal scroll | [ ] | [ ] |

---

## Out of scope for this spec (not designed, by choice)
Deleting assignments, theme toggle, crowd map, Wi-Fi status, Android install UI, admin
screens for verifying posters, in-app notification history. Ask the Lead if any of these get
a ticket.
