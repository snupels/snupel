import { ApiError } from "../api";
import { CourseCreate, CoursePatch } from "./dto";
import { courseRepository } from "./repository";

const found = async (id: number) => {
  const row = await courseRepository.get(id);
  if (!row) throw new ApiError(404, "not_found", "Course not found.");
  return row;
};

export const courseService = {
  list: () => courseRepository.list(),
  create: (input: CourseCreate) => courseRepository.create(input),
  get: (id: number) => found(id),
  async update(id: number, input: CoursePatch) {
    await found(id);
    return courseRepository.update(id, input);
  },
  async remove(id: number) {
    await found(id);
    await courseRepository.remove(id);
  },
};
