import type {
  AdminUsersQueryDto,
  IOrchestrationResult,
  IUserEntity,
  Pagination,
  UpdatePasswordDto,
  UpdateUserProfileDto,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const UserService = {
  updateMyProfile: (dto: UpdateUserProfileDto) => {
    return axiosBaseClient.patch<IOrchestrationResult<IUserEntity>>(
      "/users/me",
      dto,
    );
  },

  updatePassword: (dto: UpdatePasswordDto) => {
    return axiosBaseClient.patch<IOrchestrationResult<IUserEntity>>(
      "/users/me/password",
      dto,
    );
  },

  findAllForAdmin: ({
    page,
    limit,
    filters,
  }: {
    page: number;
    limit: number;
    filters: AdminUsersQueryDto;
  }) => {
    return axiosBaseClient.post<IOrchestrationResult<Pagination<IUserEntity>>>(
      "/users/admin",
      filters,
      {
        params: { page, limit },
      },
    );
  },
};
