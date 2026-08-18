import type {
  EnumRestaurantMemberRole,
  IOrchestrationResult,
  IRestaurantMemberEntity,
  Pagination,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const RestaurantMemberService = {
  search: (params: {
    search?: string;
    page?: number;
    limit?: number;
    role?: EnumRestaurantMemberRole;
    deleted?: boolean;
  }) => {
    return axiosBaseClient.get<
      IOrchestrationResult<Pagination<IRestaurantMemberEntity>>
    >("/restaurant-members/search", { params });
  },

  remove: (id: string) => {
    return axiosBaseClient.delete<
      IOrchestrationResult<IRestaurantMemberEntity>
    >(`/restaurant-members/${id}`);
  },

  restore: (id: string) => {
    return axiosBaseClient.patch<IOrchestrationResult<IRestaurantMemberEntity>>(
      `/restaurant-members/${id}/restore`,
    );
  },
};
