import { createCrudRouter, CrudService } from "../crud-router";
import {
  BadgeCreate,
  BadgeCreateSchema,
  BadgePatch,
  BadgePatchSchema,
} from "./dto";
import { badgeService } from "./service";

export const createBadgeRouter = (
  service: CrudService<BadgeCreate, BadgePatch> = badgeService,
) =>
  createCrudRouter({
    name: "Badge",
    createSchema: BadgeCreateSchema,
    patchSchema: BadgePatchSchema,
    readAccess: "public",
    writeAccess: "admin",
    service,
  });

export const badgeRouter = createBadgeRouter();
