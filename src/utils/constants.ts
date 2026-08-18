import { EnumOrderStatus, EnumRestaurantType } from "chopme-frontend-common";

export const RESTAURANT_VISIBLE_ORDER_STATUSES = [
  EnumOrderStatus.PAID,
  EnumOrderStatus.CANCELLED_BY_RESTAURANT,
  EnumOrderStatus.PREPARING_ORDER,
  EnumOrderStatus.IN_DELIVERY,
  EnumOrderStatus.DELIVERED,
  EnumOrderStatus.DISBURSED,
];

export const getRestaurantTypes = () => [
  { title: "Fast Food", type: EnumRestaurantType.FAST_FOOD },
  { title: "Café", type: EnumRestaurantType.CAFE },
];

export const getOrderStatusLabels = () => [
  { value: EnumOrderStatus.CREATED, label: "Created" },
  {
    value: EnumOrderStatus.PAYMENT_INITIATED,
    label: "Payment initiated",
  },
  {
    value: EnumOrderStatus.PAYMENT_FAILED,
    label: "Payment failed",
  },
  { value: EnumOrderStatus.PAID, label: "Paid" },
  {
    value: EnumOrderStatus.CANCELLED_BY_CUSTOMER,
    label: "Cancelled by you",
  },
  {
    value: EnumOrderStatus.CANCELLED_BY_RESTAURANT,
    label: "Cancelled by restaurant",
  },
  {
    value: EnumOrderStatus.PREPARING_ORDER,
    label: "Preparing order",
  },
  { value: EnumOrderStatus.IN_DELIVERY, label: "In delivery" },
  { value: EnumOrderStatus.DELIVERED, label: "Delivered" },
  { value: EnumOrderStatus.DISBURSED, label: "Disbursed" },
];
