# CampusOS demo script (CO-34) — 5 minutes, live site

**URL:** https://campusos-sudo.vercel.app  ·  **Demo:** Mon 2026-11-30  ·  **Owner:** QA (script), Siam (presenter)

Two phones, one laptop on the projector:
- **Student phone** (iPhone, CampusOS on the Home Screen): a team member's Google account, role student.
- **Rep phone** (Android Chrome, installed): a team member's Google account set as **class rep**
  (`npm run set-role` against production, editor of **STIK1003** and **STIK1013**, Monday's two classes).
- **Laptop**: landing page and the EN/ID switch at desktop size; mirrors one phone if possible.

Monday's real timetable (both phones enrolled in all 11 classes):
STIK1003 Pengantar Rekayasa dan Desain 10:45–12:25 Balee Muasyarah · STIK1013 Biologi 14:00–15:40 F01 - 311.

## Prep (day before and 30 min before; not shown on stage)
- [ ] CO-33 done: both Google accounts signed in on production, roles set, rep is in `editors` of STIK1003 and STIK1013 (check: rep sees "Lapor perubahan" on Today).
- [ ] Both phones: onboarding finished, all 11 classes picked, language EN (we switch on stage).
- [ ] Both phones: notifications **allowed** (Account → Reminders shows "On"). iPhone: allowed **from the Home Screen app**.
- [ ] Test push 30 min before: rep posts and deletes a dummy change on STIK1013, student phone gets the alert within ~10 min. If not, use the fallback (below).
- [ ] No leftover test updates/assignments on production (Updates and Assignments tabs empty or tidy).
- [ ] Phones: Do Not Disturb off, brightness up, battery > 50%, notification sound on. Laptop: browser zoom 100%, signed out.
- [ ] Production checks green: `docs/qa/live-report.md`.
- [ ] Decide the "Release notes" link: the repo is private, so it 404s for the audience (LIVE-1). Don't click it on stage unless it's fixed.

## Script

| # | Time | Who / device | Do | Expect (say) |
|---|---|---|---|---|
| 1 | 0:00 | Laptop | Open the URL signed out. | Landing: "Your timetable, with room changes the moment a class rep posts them." Text left, Today screenshot right. *"Built for Computer Engineering students at USK."* |
| 2 | 0:20 | Laptop | Tap **Bahasa Indonesia**, then **English**. | Whole page switches language both ways, instantly. *"Every screen is in English and Indonesian."* |
| 3 | 0:35 | Laptop | **Sign in with Google** with a fresh team account (or narrate over the student phone if time is short). | Google sign-in, then onboarding "Step 1 of 3". |
| 4 | 0:50 | Laptop | Step 1 English → Continue. Step 2: search `stik`, tick 3 classes → "Continue · 3 classes". Step 3: show the sample notification → **Not now**. | Lands on Today. *"Pick your sections once; the timetable is real USK data."* |
| 5 | 1:20 | Student phone | Open CampusOS from the Home Screen. | Today: date, "2 classes", STIK1003 10:45 and STIK1013 14:00 with rooms, durations and a free-time row; "Now"/"Next" if the demo falls in class time. |
| 6 | 1:40 | Rep phone | Today → **Lapor perubahan** → Pindah ruang → session "Today 14:00" (STIK1013) → new room `F01 - 205` → note "Proyektor rusak." → **Kirim ke n mahasiswa**. | "Posted. Students are being notified." *"Only verified reps of that class see this button; the server checks it too."* |
| 7 | 2:10 | Student phone | Pull to Today (reload if needed). | STIK1013 row: **F01 - 205** highlighted, old room struck; Updates tab shows the item with "Demo Rep · verified class rep". |
| 8 | 2:30 | Student phone | Wait for the push (can run in the background while 9–11 go on). | Notification "STIK1013: room moved / Today 14:00 → F01 - 205" within ~5–10 min (cron every 5 min). *Tap it → Updates.* |
| 9 | 2:40 | Rep phone | Assignments → **Tambah** → class STIK1003, title "Tugas 1: ringkasan bab 2", due **In 1 week** → read-back "Mon 7 Dec, 23:59 WIB" → **Post to n students**. | Detail page, "Saved. Students in this class can see it now." |
| 10 | 3:10 | Student phone | Assignments tab. | "Tugas 1: ringkasan bab 2" under **This week**/**Later** with "7 d left"; detail shows instructions, due time in WIB, "Added by …, class rep". |
| 11 | 3:30 | Rep phone | Open the assignment → **Delete assignment** → "Delete for all n students? This can't be undone." → **Delete**. | Back to list, it's gone; student list no longer shows it after a reload. *"Reps can fix mistakes; students can't touch anything."* |
| 12 | 3:55 | Student phone | Account (avatar) → Language **ID**. | Today in Indonesian: "Hari ini", "2 kelas", "Pindah ruang", weekdays "Sen". Switch back to EN. |
| 13 | 4:15 | Laptop (or a spare Android) | Show install: Chrome menu → **Install CampusOS** (Android) / on iPhone Safari: Share → **Add to Home Screen**; open from the icon. | Opens full-screen to Today with the teal icon. *"Push on iPhone works once it's on the Home Screen; the app explains that to iPhone users."* |
| 14 | 4:40 | — | Wrap up. | Recap: schedule with reminders, one assignment format, room/cancel alerts from verified reps only, EN/ID, installable PWA. |
| 15 | 5:00 | Rep phone | (After the demo) delete the test room change from Updates if the team doesn't want it to stay. | — |

## Fallbacks
- **Push late or missing:** point at the Updates tab and the highlighted room on Today — it's the same event the
  push carries — and say the alert follows on the next 5-minute cron run. Don't refresh repeatedly on stage.
- **Google sign-in slow on the laptop:** skip steps 3–4 and do the same story on the student phone (already signed in).
- **Wi-Fi drops:** the app shows "You're offline…"; switch phones to mobile data. Posting offline shows "Couldn't post. Try again."
- **Wrong class time on stage (e.g. demo after 15:40):** the room change still shows on the session row; skip "Now/Next" talk.

## What not to show
Release notes link (private repo, 404) · tablet/desktop week grid (cut) · marking assignments done (cut) · offline cold start (cut).
