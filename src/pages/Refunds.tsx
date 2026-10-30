import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, RefreshCw, Undo2 } from "lucide-react";
import {
  EnumNotificationType,
  EnumRefundStatus,
  EnumStatusCode,
  EnumStatusResponse,
  type INotification,
  type IRefundEntity,
} from "chopme-frontend-common";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import Pagination from "../components/Pagination";
import { OrderService } from "../services/order.service";
import { ComputeUtils } from "../utils/compute-utils";
import { showErrorToast } from "../utils/toasts";

const LIMIT = 20;

const STATUS_CONFIG: Record<
  EnumRefundStatus,
  { badgeClass: string; dotClass: string }
> = {
  [EnumRefundStatus.CREATED]: {
    badgeClass: "bg-gray-100 text-gray-700",
    dotClass: "bg-gray-500",
  },
  [EnumRefundStatus.FAILED_TO_INITIATE]: {
    badgeClass: "bg-red-100 text-red-700",
    dotClass: "bg-red-500",
  },
  [EnumRefundStatus.INITIATED]: {
    badgeClass: "bg-blue-100 text-blue-700",
    dotClass: "bg-blue-500",
  },
  [EnumRefundStatus.SUCCESSFUL]: {
    badgeClass: "bg-green-100 text-green-700",
    dotClass: "bg-green-500",
  },
  [EnumRefundStatus.FAILED]: {
    badgeClass: "bg-red-100 text-red-700",
    dotClass: "bg-red-500",
  },
};

const formatEnumLabel = (value?: string) => {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const Refunds = () => {
  const [searchParams] = useSearchParams();

  const [refunds, setRefunds] = useState<IRefundEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [statusFilter, setStatusFilter] = useState<EnumRefundStatus | "">(
    (searchParams.get("status") as EnumRefundStatus) || "",
  );

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await OrderService.findAllRefundsForAdmin({
        page,
        limit: LIMIT,
        status: statusFilter || undefined,
      });

      if (
        data.code === EnumStatusResponse.SUCCESS &&
        data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
        data.data
      ) {
        setRefunds(data.data.items);
        setTotalPages(data.data.totalPages);
        setTotalItems(data.data.totalItems);
      } else {
        showErrorToast(data.message ?? "Unable to load refunds");
      }
    } catch {
      showErrorToast("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const { newNotification } = useSelector(
    (state: RootState) => state.notification,
  );

  const applyRefundUpdate = useCallback(
    (updated: IRefundEntity) => {
      setRefunds((prev) => {
        const matchesFilter = !statusFilter || updated.status === statusFilter;
        const existed = prev.some((item) => item.id === updated.id);
        const next = prev.flatMap((item) =>
          item.id === updated.id ? (matchesFilter ? [updated] : []) : [item],
        );
        if (!existed && matchesFilter) {
          next.unshift(updated);
        }
        return next;
      });
    },
    [statusFilter],
  );

  useEffect(() => {
    if (newNotification?.type === EnumNotificationType.REFUND_STATUS_CHANGED) {
      applyRefundUpdate((newNotification as INotification<IRefundEntity>).data);
    }
  }, [newNotification, applyRefundUpdate]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Undo2 size={22} className="text-primary" />
          Refunds
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            {totalItems.toLocaleString()} refunds
          </span>
          <button
            onClick={fetchRefunds}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value as EnumRefundStatus | "");
              }}
              className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Statuses</option>
              {Object.values(EnumRefundStatus).map((status) => (
                <option key={status} value={status}>
                  {formatEnumLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading refunds...</span>
            </div>
          </div>
        ) : refunds.length === 0 ? (
          <div className="text-center py-16">
            <Undo2 size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No refunds found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Refund
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Order
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund) => {
                  const statusConfig = STATUS_CONFIG[refund.status];
                  const amount =
                    refund.amount ??
                    refund.refundWebhookDetails?.amount ??
                    refund.refundDetails?.amount;
                  return (
                    <tr
                      key={refund.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm">
                        <span
                          className="font-mono text-xs text-gray-500"
                          title={refund.transactionId ?? refund.id}
                        >
                          {(refund.transactionId ?? refund.id)?.slice(-8)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className="font-mono text-xs text-gray-500"
                          title={refund.orderId}
                        >
                          {refund.orderId?.slice(-8)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {amount ? (
                          <>
                            <span className="font-extrabold text-text tabular-nums">
                              {amount.toLocaleString()}
                            </span>{" "}
                            <span className="text-xs font-semibold text-primary">
                              FCFA
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusConfig?.badgeClass ??
                            "bg-gray-100 text-gray-700"
                          } ${
                            refund.status !== EnumRefundStatus.SUCCESSFUL
                              ? "animate-bounce"
                              : ""
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              statusConfig?.dotClass ?? "bg-gray-500"
                            }`}
                          />
                          {formatEnumLabel(refund.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                        {ComputeUtils.formatDate(refund.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="text-xs text-gray-300">—</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default Refunds;
