import { ApiError } from "../api";
import { ActivityCreate, ActivityPatch } from "./dto";
import { activityRepository } from "./repository";

const found = async (id: number) => {
  const row = await activityRepository.get(id);
  if (!row) throw new ApiError(404, "not_found", "Activity not found.");
  return row;
};

export const activityService = {
  list: () => activityRepository.list(),
  create: (input: ActivityCreate) => activityRepository.create(input),
  get: (id: number) => found(id),
  async update(id: number, input: ActivityPatch) {
    await found(id);
    return activityRepository.update(id, input);
  },
  async remove(id: number) {
    await found(id);
    await activityRepository.remove(id);
  },
};
