import { createCrudRouter, CrudService } from "../crud-router";
import {
  CollectedStampCreate,
  CollectedStampCreateSchema,
  CollectedStampPatch,
  CollectedStampPatchSchema,
} from "./dto";
import { collectedStampService } from "./service";

export const createCollectedStampRouter = (
  service: CrudService<CollectedStampCreate, CollectedStampPatch> =
    collectedStampService,
) =>
  createCrudRouter({
    name: "Collected stamp",
    createSchema: CollectedStampCreateSchema,
    patchSchema: CollectedStampPatchSchema,
    readAccess: "user",
    writeAccess: "user",
    service,
  });

export const collectedStampRouter = createCollectedStampRouter();
