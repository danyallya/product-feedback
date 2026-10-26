import {createClient} from "@libsql/client";
import {drizzle} from "drizzle-orm/libsql";
import * as schema from "@/db/schema";
const client=createClient({url:process.env.TURSO_DATABASE_URL??"file:./feedback.db",authToken:process.env.TURSO_AUTH_TOKEN||undefined});
export const db=drizzle(client,{schema});