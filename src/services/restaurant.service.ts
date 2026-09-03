import {
  EnumWalletTypes,
  type IOrchestrationResult,
  type IRestaurantEntity,
  type IRestaurantWallet,
  type UpdateRestaurantDto,
  type AdminUpdateRestaurantDto,
  type CreateRestaurantDto,
  type Pagination,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const RestaurantService = {
  findAllForAdmin: (params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    deleted?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    return axiosBaseClient.get<
      IOrchestrationResult<Pagination<IRestaurantEntity>>
    >(`/restaurants/admin`, { params });
  },

  findOnePrivate: (idOrSlug: string) => {
    return axiosBaseClient.get<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/member/${idOrSlug}`,
    );
  },

  findOne: (idOrSlug: string) => {
    return axiosBaseClient.get<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/admin/${idOrSlug}`,
    );
  },

  update: (id: string, dto: UpdateRestaurantDto) => {
    return axiosBaseClient.patch<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/${id}`,
      dto,
    );
  },

  adminUpdate: (id: string, dto: AdminUpdateRestaurantDto) => {
    return axiosBaseClient.patch<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/${id}/admin`,
      dto,
    );
  },

  toggleClosed: (id: string) => {
    return axiosBaseClient.patch<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/${id}/toggle-closed`,
    );
  },

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosBaseClient.post<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/admin/${id}/upload-image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  uploadCoverImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosBaseClient.post<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/admin/${id}/upload-cover-image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  deleteImage: (id: string, key: string) => {
    return axiosBaseClient.delete<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/admin/${id}/images`,
      { params: { key } },
    );
  },

  deleteCoverImage: (id: string) => {
    return axiosBaseClient.delete<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/admin/${id}/cover-image`,
    );
  },

  getWallet: (id: string) => {
    return axiosBaseClient.get<IOrchestrationResult<IRestaurantWallet>>(
      `/restaurants/${id}/wallet`,
    );
  },

  addWallet: (id: string, dto: { type: EnumWalletTypes; number?: string }) => {
    return axiosBaseClient.post<IOrchestrationResult<IRestaurantWallet>>(
      `/restaurants/${id}/wallet`,
      dto,
    );
  },

  deleteWallet: (id: string) => {
    return axiosBaseClient.delete<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/${id}/wallet`,
    );
  },

  delete: (id: string) => {
    return axiosBaseClient.delete<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/${id}`,
    );
  },

  restore: (id: string) => {
    return axiosBaseClient.patch<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/${id}/restore`,
    );
  },

  create: (dto: Omit<CreateRestaurantDto, "confirmPassword">) => {
    return axiosBaseClient.post<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants`,
      dto,
    );
  },

  checkName: (name: string) => {
    return axiosBaseClient.get<IOrchestrationResult<{ available: boolean }>>(
      `/restaurants/check-name`,
      { params: { name } },
    );
  },
};
