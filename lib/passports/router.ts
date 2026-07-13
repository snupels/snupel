import { createCrudRouter, CrudService } from "../crud-router";
import {
  PassportCreate,
  PassportCreateSchema,
  PassportPatch,
  PassportPatchSchema,
} from "./dto";
import { passportService } from "./service";

export const createPassportRouter = (
  service: CrudService<PassportCreate, PassportPatch> = passportService,
) =>
  createCrudRouter({
    name: "Passport",
    createSchema: PassportCreateSchema,
    patchSchema: PassportPatchSchema,
    readAccess: "user",
    writeAccess: "user",
    service,
  });

export const passportRouter = createPassportRouter();
