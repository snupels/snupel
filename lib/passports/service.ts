import { ApiError, hasDatabaseCode, LoginUser } from "../api";
import { PassportCreate, PassportPatch } from "./dto";
import { passportRepository } from "./repository";

const userId = (user: LoginUser | null) => {
  if (!user) throw new ApiError(401, "unauthorized", "Login is required.");
  return user.id;
};

const self = (input: PassportCreate | PassportPatch, user: LoginUser | null) => {
  const id = userId(user);
  if (input.user_id !== id) {
    throw new ApiError(403, "forbidden", "A passport can only belong to you.");
  }
  return id;
};

const found = async (id: number, ownerId: number) => {
  const row = await passportRepository.get(id, ownerId);
  if (!row) throw new ApiError(404, "not_found", "Passport not found.");
  return row;
};

export const passportService = {
  list: (user: LoginUser | null) => passportRepository.list(userId(user)),
  async create(input: PassportCreate, user: LoginUser | null) {
    const ownerId = self(input, user);
    if (await passportRepository.getByUser(ownerId)) {
      throw new ApiError(409, "conflict", "Passport already exists.");
    }
    try {
      return await passportRepository.create(ownerId);
    } catch (error) {
      if (hasDatabaseCode(error, "ER_DUP_ENTRY")) {
        throw new ApiError(409, "conflict", "Passport already exists.");
      }
      throw error;
    }
  },
  get: (id: number, user: LoginUser | null) => found(id, userId(user)),
  async update(id: number, input: PassportPatch, user: LoginUser | null) {
    const ownerId = self(input, user);
    return found(id, ownerId);
  },
  async remove(id: number, user: LoginUser | null) {
    const ownerId = userId(user);
    await found(id, ownerId);
    await passportRepository.remove(id, ownerId);
  },
};
