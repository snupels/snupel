import { ApiError } from "../api";
import { BadgeCreate, BadgePatch } from "./dto";
import { badgeRepository } from "./repository";

const found = async (id: number) => {
  const row = await badgeRepository.get(id);
  if (!row) throw new ApiError(404, "not_found", "Badge not found.");
  return row;
};

export const badgeService = {
  list: () => badgeRepository.list(),
  create: (input: BadgeCreate) => badgeRepository.create(input),
  get: (id: number) => found(id),
  async update(id: number, input: BadgePatch) {
    await found(id);
    return badgeRepository.update(id, input);
  },
  async remove(id: number) {
    await found(id);
    await badgeRepository.remove(id);
  },
};
