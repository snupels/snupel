import { createCrudRouter, CrudService } from "../crud-router";
import {
  ActivityCreate,
  ActivityCreateSchema,
  ActivityPatch,
  ActivityPatchSchema,
} from "./dto";
import { activityService } from "./service";

export const createActivityRouter = (
  service: CrudService<ActivityCreate, ActivityPatch> = activityService,
) =>
  createCrudRouter({
    name: "Activity",
    createSchema: ActivityCreateSchema,
    patchSchema: ActivityPatchSchema,
    readAccess: "public",
    writeAccess: "admin",
    service,
  });

export const activityRouter = createActivityRouter();
