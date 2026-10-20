import type {
  EnumTransferDirection,
  EnumTransferStatuses,
  IOrchestrationResult,
  ITransferEntity,
  ITransferGroupEntity,
  Pagination,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const TransferService = {
  getAdminTransfers: (params: {
    page?: number;
    limit?: number;
    status?: EnumTransferStatuses;
    transferDirection?: EnumTransferDirection;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.status) searchParams.set("status", params.status);
    if (params.transferDirection)
      searchParams.set("transferDirection", params.transferDirection);

    return axiosBaseClient.get<
      IOrchestrationResult<Pagination<ITransferEntity>>
    >(`/transfers/admin-transfers?${searchParams.toString()}`);
  },

  startTransfer: (transferId: string) => {
    return axiosBaseClient.post<IOrchestrationResult<ITransferEntity>>(
      `/transfers/${transferId}/start-transfer`,
    );
  },

  retryTransfer: (transferId: string) => {
    return axiosBaseClient.post<IOrchestrationResult<ITransferEntity>>(
      `/transfers/${transferId}/retry-transfer`,
    );
  },
  ensureTopup: (transferGroupId: string) => {
    return axiosBaseClient.post<IOrchestrationResult<ITransferGroupEntity>>(
      `/transfers/transfer-groups/${transferGroupId}/ensure-topup`,
    );
  },

  getRestaurantTransfers: (params: {
    page?: number;
    limit?: number;
    status?: EnumTransferStatuses;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.status) searchParams.set("status", params.status);

    return axiosBaseClient.get<
      IOrchestrationResult<Pagination<ITransferEntity>>
    >(`/transfers/restaurant-transfers?${searchParams.toString()}`);
  },

  create: () => {
    return axiosBaseClient.post<IOrchestrationResult<ITransferEntity>>(
      "/transfers",
    );
  },
};
