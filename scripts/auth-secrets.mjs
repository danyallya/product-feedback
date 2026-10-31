import { randomBytes } from "node:crypto";

console.log("# Add these values to your ignored .env file:");
console.log(`MORROW_SETUP_TOKEN=${randomBytes(32).toString("base64url")}`);
console.log(`MORROW_SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
