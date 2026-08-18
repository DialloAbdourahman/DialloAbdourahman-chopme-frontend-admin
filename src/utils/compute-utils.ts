import {
  EnumOrderCancelledReason,
  EnumOrderStatus,
  EnumRefundStatus,
  EnumRestaurantMemberRole,
  EnumTransferStatuses,
  type IMenuEntity,
  type IRestaurantEntity,
} from "chopme-frontend-common";
import { KEYS } from "./keys";

export class ComputeUtils {
  static isRestaurantClosed(
    restaurant: Pick<IRestaurantEntity, "isClosed" | "availability">,
    date: Date = new Date(),
  ): boolean {
    // Manually closed
    if (restaurant.isClosed) {
      return true;
    }

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const today = days[date.getDay()];

    const schedule = restaurant.availability.find((a) => a.day === today);

    // No opening hours for today
    if (!schedule) {
      return true;
    }

    const currentMinutes = date.getHours() * 60 + date.getMinutes();

    const [openHour, openMinute] = schedule.openTime.split(":").map(Number);

    const [closeHour, closeMinute] = schedule.closeTime.split(":").map(Number);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    return currentMinutes < openMinutes || currentMinutes >= closeMinutes;
  }

  static getMenuImageUrl = (menu: IMenuEntity | undefined) => {
    if (!menu) return null;
    const img = menu.coverImage ?? menu.pictures?.[0];
    return img ? `${KEYS.PUBLIC_S3_PREFIX}/${img}` : null;
  };

  static formatStatus(status: EnumOrderStatus) {
    switch (status) {
      case EnumOrderStatus.CREATED:
        return "Created";
      case EnumOrderStatus.PAYMENT_INITIATED:
        return "Payment initiated";
      case EnumOrderStatus.PAYMENT_FAILED:
        return "Payment failed";
      case EnumOrderStatus.PAID:
        return "Paid";
      case EnumOrderStatus.CANCELLED_BY_CUSTOMER:
        return "Cancelled by you";
      case EnumOrderStatus.CANCELLED_BY_RESTAURANT:
        return "Cancelled by restaurant";
      case EnumOrderStatus.PREPARING_ORDER:
        return "Preparing order";
      case EnumOrderStatus.IN_DELIVERY:
        return "In delivery";
      case EnumOrderStatus.DELIVERED:
        return "Delivered";
      case EnumOrderStatus.DISBURSED:
        return "Disbursed";
      default:
        return status;
    }
  }

  static formatDate(date: Date | string | null | undefined) {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  }

  static formatCancelledReason(reason: EnumOrderCancelledReason) {
    switch (reason) {
      case EnumOrderCancelledReason.TOO_LATE:
        return "Order was too late";
      case EnumOrderCancelledReason.OUT_OF_STOCK:
        return "Item out of stock";
      default:
        return reason;
    }
  }

  static formatRefundStatus(status: EnumRefundStatus) {
    switch (status) {
      case EnumRefundStatus.SUCCESSFUL:
        return "Successful";
      case EnumRefundStatus.INITIATED:
        return "Initiated";
      case EnumRefundStatus.FAILED:
        return "Failed";
      case EnumRefundStatus.FAILED_TO_INITIATE:
        return "Failed to initiate";
      default:
        return status;
    }
  }

  static formatTransferStatus(status: EnumTransferStatuses) {
    switch (status) {
      case EnumTransferStatuses.CREATED:
        return "Created";
      case EnumTransferStatuses.INITIATED:
        return "In progress";
      case EnumTransferStatuses.FAILED_TO_INITIATE:
        return "Failed to initiate";
      case EnumTransferStatuses.COMPLETED:
        return "Completed";
      case EnumTransferStatuses.FAILED:
        return "Failed";
      default:
        return status;
    }
  }

  static formatRestaurantMemberRole(role: EnumRestaurantMemberRole) {
    switch (role) {
      case EnumRestaurantMemberRole.OWNER:
        return "Owner";
      case EnumRestaurantMemberRole.MANAGER:
        return "Manager";
      default:
        return role;
    }
  }
}
