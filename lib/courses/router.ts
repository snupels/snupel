import { createCrudRouter, CrudService } from "../crud-router";
import {
  CourseCreate,
  CourseCreateSchema,
  CoursePatch,
  CoursePatchSchema,
} from "./dto";
import { courseService } from "./service";

export const createCourseRouter = (
  service: CrudService<CourseCreate, CoursePatch> = courseService,
) =>
  createCrudRouter({
    name: "Course",
    createSchema: CourseCreateSchema,
    patchSchema: CoursePatchSchema,
    readAccess: "public",
    writeAccess: "admin",
    service,
  });

export const courseRouter = createCourseRouter();
