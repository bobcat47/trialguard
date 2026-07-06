import { createTRPCContext } from "@trpc/server";
import { TRPCError, initTRPC } from "@trpc/server";
import { type Context } from "./context";
import { ZodError } from "zod";
import { superjson } from "superjson";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createRouter = t.router;
export const publicQuery = t.procedure;
export const authedQuery = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return opts.next({ ctx: { user: ctx.user } });
});
export const adminQuery = t.procedure.use(async function isAdmin(opts) {
  const { ctx } = opts;
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
  }
  return opts.next({ ctx: { user: ctx.user } });
});
