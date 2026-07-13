import { createCrudRouter, CrudService } from "../crud-router";
import {
  CollectedBadgeCreate,
  CollectedBadgeCreateSchema,
  CollectedBadgePatch,
  CollectedBadgePatchSchema,
} from "./dto";
import { collectedBadgeService } from "./service";

export const createCollectedBadgeRouter = (
  service: CrudService<CollectedBadgeCreate, CollectedBadgePatch> =
    collectedBadgeService,
) =>
  createCrudRouter({
    name: "Collected badge",
    createSchema: CollectedBadgeCreateSchema,
    patchSchema: CollectedBadgePatchSchema,
    readAccess: "user",
    writeAccess: "user",
    service,
  });

export const collectedBadgeRouter = createCollectedBadgeRouter();
