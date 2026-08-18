import type {
  EnumOrderStatus,
  IOrchestrationResult,
  IOrderEntity,
  Pagination,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const OrderService = {
  getRestaurantOrders: (params: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set("status", params.status);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));

    return axiosBaseClient.get<IOrchestrationResult<Pagination<IOrderEntity>>>(
      `/orders/restaurant-orders?${searchParams.toString()}`,
    );
  },

  countRestaurantOrders: (status: EnumOrderStatus) => {
    return axiosBaseClient.get<IOrchestrationResult<{ total: number }>>(
      `/orders/restaurant-orders/count?status=${status}`,
    );
  },

  sumRestaurantOrdersAmount: (
    statuses: EnumOrderStatus[],
    excludeTransferred?: boolean,
  ) => {
    const searchParams = new URLSearchParams();
    searchParams.set("statuses", statuses.join(","));
    if (excludeTransferred) searchParams.set("excludeTransferred", "true");

    return axiosBaseClient.get<IOrchestrationResult<{ total: number }>>(
      `/orders/restaurant-orders/sum-amount?${searchParams.toString()}`,
    );
  },

  getRestaurantOrder: (orderId: string) => {
    return axiosBaseClient.get<IOrchestrationResult<IOrderEntity>>(
      `/orders/${orderId}/restaurant`,
    );
  },
};
