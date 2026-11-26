// Usage: npm run set-role -- <uid> <role>   (user must sign in again, or refresh their token, to see it)
import { auth } from "./admin";
import type { Role } from "../lib/types";

const ROLES: Role[] = ["student", "classrep", "labassistant", "lecturer", "admin"];
const [uid, role] = process.argv.slice(2) as [string, Role];

if (!uid || !ROLES.includes(role)) {
  console.error(`Usage: npm run set-role -- <uid> <${ROLES.join("|")}>`);
  process.exit(1);
}
auth.setCustomUserClaims(uid, { role }).then(() => console.log(`${uid} -> role: ${role}`));
