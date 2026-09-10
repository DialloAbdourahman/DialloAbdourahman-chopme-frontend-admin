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
  { title: "Restaurant", type: EnumRestaurantType.RESTAURANT },
  { title: "Fast Food", type: EnumRestaurantType.FAST_FOOD },
  { title: "Snack", type: EnumRestaurantType.SNACK },
  { title: "Café", type: EnumRestaurantType.CAFE },
  { title: "Cameroonian", type: EnumRestaurantType.CAMEROONIAN },
  { title: "African", type: EnumRestaurantType.AFRICAN },
  { title: "Maquis", type: EnumRestaurantType.MAQUIS },
  { title: "Gargote", type: EnumRestaurantType.GARGOTE },
  { title: "Grill", type: EnumRestaurantType.GRILL },
  { title: "Rotisserie", type: EnumRestaurantType.ROTISSERIE },
  { title: "Pizzeria", type: EnumRestaurantType.PIZZERIA },
  { title: "Burger", type: EnumRestaurantType.BURGER },
  { title: "Shawarma", type: EnumRestaurantType.SHAWARMA },
  { title: "Chinese", type: EnumRestaurantType.CHINESE },
  { title: "Indian", type: EnumRestaurantType.INDIAN },
  { title: "Lebanese", type: EnumRestaurantType.LEBANESE },
  { title: "French", type: EnumRestaurantType.FRENCH },
  { title: "Italian", type: EnumRestaurantType.ITALIAN },
  { title: "Bakery", type: EnumRestaurantType.BAKERY },
  { title: "Dessert", type: EnumRestaurantType.DESSERT },
  { title: "Juice Bar", type: EnumRestaurantType.JUICE_BAR },
  { title: "Bar", type: EnumRestaurantType.BAR },
  { title: "Lounge", type: EnumRestaurantType.LOUNGE },
  { title: "Fine Dining", type: EnumRestaurantType.FINE_DINING },
  { title: "Hotel Restaurant", type: EnumRestaurantType.HOTEL_RESTAURANT },
  { title: "Home Cook", type: EnumRestaurantType.HOME_COOK },
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
