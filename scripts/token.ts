// Prints a Firebase ID token for a uid from the Auth emulator, to call the API by hand:
//   curl -H "Authorization: Bearer $(npm run -s token -- rep-demo)" http://127.0.0.1:3000/api/me
// The token carries the user's custom claims (e.g. role: admin set by seed or set-role). Emulator only.
import { auth } from "./admin";

async function main() {
  const uid = process.argv[2];
  if (!uid) throw new Error("Usage: npm run -s token -- <uid>");
  const token = await auth.createCustomToken(uid);
  const res = await fetch(
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=demo-key`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, returnSecureToken: true }) },
  );
  const json = (await res.json()) as { idToken?: string; error?: { message: string } };
  if (!json.idToken) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  console.log(json.idToken);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
