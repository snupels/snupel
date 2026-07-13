import { z } from "zod";

import {
  ApiError,
  apiResponse,
  badRequest,
  created,
  json,
  LoginUser,
  noContent,
  requireAdmin,
  requireUser,
} from "./api";

type Access = "public" | "user" | "admin";

export type CrudService<Create, Patch> = {
  list(user: LoginUser | null): Promise<unknown>;
  create(input: Create, user: LoginUser | null): Promise<unknown>;
  get(id: number, user: LoginUser | null): Promise<unknown>;
  update(id: number, input: Patch, user: LoginUser | null): Promise<unknown>;
  remove(id: number, user: LoginUser | null): Promise<void>;
};

type Options<Create, Patch> = {
  name: string;
  createSchema: z.ZodType<Create>;
  patchSchema: z.ZodType<Patch>;
  readAccess: Access;
  writeAccess: Access;
  service: CrudService<Create, Patch>;
};

type Context = { params: Promise<{ id: string }> };

export function createCrudRouter<Create, Patch>(options: Options<Create, Patch>) {
  const actor = (request: Request, access: Access) => {
    if (access === "admin") return requireAdmin(request);
    if (access === "user") return requireUser(request);
    return null;
  };

  const idFrom = async (context: Context) => {
    const id = Number((await context.params).id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new ApiError(
        400,
        "bad_request",
        `${options.name} id must be a positive integer.`,
      );
    }
    return id;
  };

  const bodyFrom = async <T>(request: Request, schema: z.ZodType<T>) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return null;
    return parsed.data;
  };

  return {
    collection: {
      GET: (request: Request) =>
        apiResponse(async () =>
          json(await options.service.list(actor(request, options.readAccess))),
        ),
      POST: (request: Request) =>
        apiResponse(async () => {
          const user = actor(request, options.writeAccess);
          const input = await bodyFrom(request, options.createSchema);
          if (!input) return badRequest("Invalid request body.");
          return created(await options.service.create(input, user));
        }),
    },
    item: {
      GET: (request: Request, context: Context) =>
        apiResponse(async () =>
          json(
            await options.service.get(
              await idFrom(context),
              actor(request, options.readAccess),
            ),
          ),
        ),
      PATCH: (request: Request, context: Context) =>
        apiResponse(async () => {
          const user = actor(request, options.writeAccess);
          const input = await bodyFrom(request, options.patchSchema);
          if (!input) return badRequest("Invalid request body.");
          return json(
            await options.service.update(await idFrom(context), input, user),
          );
        }),
      DELETE: (request: Request, context: Context) =>
        apiResponse(async () => {
          await options.service.remove(
            await idFrom(context),
            actor(request, options.writeAccess),
          );
          return noContent();
        }),
    },
  };
}
