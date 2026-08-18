import { EnumOrderStatus } from "chopme-frontend-common";

type Props = {
  status: EnumOrderStatus;
};

const OrderStatusBadge = ({ status }: Props) => {
  const label = (() => {
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
  })();

  const colorClass =
    status === EnumOrderStatus.CREATED
      ? "bg-yellow-100 text-yellow-700"
      : status === EnumOrderStatus.PAID || status === EnumOrderStatus.DISBURSED
        ? "bg-green-100 text-green-700"
        : status === EnumOrderStatus.CANCELLED_BY_CUSTOMER ||
            status === EnumOrderStatus.CANCELLED_BY_RESTAURANT ||
            status === EnumOrderStatus.PAYMENT_FAILED
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}
    >
      {label}
    </span>
  );
};

export default OrderStatusBadge;
