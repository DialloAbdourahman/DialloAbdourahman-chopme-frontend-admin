import { io, type Socket } from "socket.io-client";
import { KEYS } from "../utils/keys";
import { TokensService } from "../services/tokens.service";
import type { RootState } from "../store";
import {
  EnumNotificationType,
  EnumTransferStatuses,
  EnumWebSocketEventType,
  playNotificationSound,
  type INotification,
  type ITransferEntity,
} from "chopme-frontend-common";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setNewNotification } from "../store/notification.slice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "../utils/toasts";

const WebSocket = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleReceivedNotification = (newNotification: INotification<any>) => {
    dispatch(setNewNotification(newNotification));
    playNotificationSound();

    // if (newNotification.type === EnumNotificationType.ORDER_STATUS_CHANGED) {
    //   const notification = newNotification as INotification<IOrderEntity>;
    //   switch (notification.data.status) {
    //     case EnumOrderStatus.PAID:
    //       showSuccessToast(t("notification.newOrder"), {
    //         onClick: () => {
    //           navigate(`/orders/${notification.data.id}`);
    //         },
    //       });
    //       break;
    //     default:
    //       break;
    //   }
    // }

    if (newNotification.type === EnumNotificationType.TRANSFER_STATUS_CHANGED) {
      const notification = newNotification as INotification<ITransferEntity>;
      switch (notification.data.status) {
        case EnumTransferStatuses.CREATED:
          showInfoToast("Transfer created", {
            onClick: () => {
              navigate("/transfers");
            },
          });
          break;
        case EnumTransferStatuses.INITIATED:
          showInfoToast("Transfer is being processed", {
            onClick: () => {
              navigate("/transfers");
            },
          });
          break;
        case EnumTransferStatuses.FAILED_TO_INITIATE:
          showErrorToast("Transfer could not be initiated", {
            onClick: () => {
              navigate("/transfers");
            },
          });
          break;
        case EnumTransferStatuses.COMPLETED:
          showSuccessToast("Transfer completed", {
            onClick: () => {
              navigate("/transfers");
            },
          });
          break;
        case EnumTransferStatuses.FAILED:
          showErrorToast("Transfer failed", {
            onClick: () => {
              navigate("/transfers");
            },
          });
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    const token = TokensService.getToken(KEYS.ACCESS_TOKEN_KEY);

    if (!token || !user) {
      return;
    }

    const socket: Socket = io(KEYS.WEB_SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on(
      EnumWebSocketEventType.ADMIN_APPLICATION,
      (data: INotification<any>) => {
        handleReceivedNotification(data);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return <></>;
};

export default WebSocket;
