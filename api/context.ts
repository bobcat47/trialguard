import type { CreateContext } from "@trpc/server/adapters/hono";
import type { Context as HonoContext } from "hono";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export async function createContext(opts: { req: Request; res: Response }) {
  const token = opts.req.headers.get("authorization")?.replace("Bearer ", "");
  let user = null;

  if (token) {
    try {
      const { jwtVerify } = await import("jose");
      const secret = new TextEncoder().encode(process.env.APP_SECRET || "dev-secret");
      const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
      const db = getDb();
      const [found] = await db.select().from(users).where(eq(users.id, payload.sub as unknown as number));
      if (found) user = found;
    } catch {
      // Invalid token
    }
  }

  return { user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
