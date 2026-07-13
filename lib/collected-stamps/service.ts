import { ApiError, hasDatabaseCode, LoginUser } from "../api";
import { CollectedStampCreate, CollectedStampPatch } from "./dto";
import { collectedStampRepository as repository } from "./repository";

const userId = (user: LoginUser | null) => {
  if (!user) throw new ApiError(401, "unauthorized", "Login is required.");
  return user.id;
};

const valid = async (
  passportId: number,
  stampId: number,
  ownerId: number,
  exceptId = 0,
) => {
  if (!(await repository.passportOwned(passportId, ownerId))) {
    throw new ApiError(404, "not_found", "Passport not found.");
  }
  if (!(await repository.stampExists(stampId))) {
    throw new ApiError(404, "not_found", "Stamp not found.");
  }
  if (await repository.duplicate(passportId, stampId, exceptId)) {
    throw new ApiError(409, "conflict", "Stamp already collected.");
  }
};

const found = async (id: number, ownerId: number) => {
  const row = await repository.get(id, ownerId);
  if (!row) throw new ApiError(404, "not_found", "Collected stamp not found.");
  return row;
};

const write = async <T>(action: () => Promise<T>) => {
  try {
    return await action();
  } catch (error) {
    if (hasDatabaseCode(error, "ER_DUP_ENTRY")) {
      throw new ApiError(409, "conflict", "Stamp already collected.");
    }
    if (hasDatabaseCode(error, "ER_NO_REFERENCED_ROW_2")) {
      throw new ApiError(404, "not_found", "Passport or stamp not found.");
    }
    throw error;
  }
};

export const collectedStampService = {
  list: (user: LoginUser | null) => repository.list(userId(user)),
  get: (id: number, user: LoginUser | null) => found(id, userId(user)),
  async create(input: CollectedStampCreate, user: LoginUser | null) {
    const ownerId = userId(user);
    await valid(input.passport_id, input.stamp_id, ownerId);
    return write(() => repository.create(input, ownerId));
  },
  async update(id: number, input: CollectedStampPatch, user: LoginUser | null) {
    const ownerId = userId(user);
    const current = await found(id, ownerId);
    const passportId = input.passport_id ?? current.passportId;
    const stampId = input.stamp_id ?? current.stampId;
    await valid(passportId, stampId, ownerId, id);
    return write(() => repository.update(id, input, ownerId));
  },
  async remove(id: number, user: LoginUser | null) {
    await found(id, userId(user));
    await repository.remove(id);
  },
};
