import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRightLeft,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import {
  EnumNotificationType,
  EnumStatusCode,
  EnumStatusResponse,
  EnumTransferDirection,
  EnumTransferStatuses,
  EnumTranzakTopupStatus,
  type ITransferEntity,
  type ITransferGroupEntity,
} from "chopme-frontend-common";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import { TransferService } from "../services/transfer.service";
import { ComputeUtils } from "../utils/compute-utils";
import { showErrorToast, showSuccessToast } from "../utils/toasts";

const LIMIT = 20;

const STATUS_CONFIG: Record<
  EnumTransferStatuses,
  { badgeClass: string; dotClass: string }
> = {
  [EnumTransferStatuses.CREATED]: {
    badgeClass: "bg-gray-100 text-gray-700",
    dotClass: "bg-gray-500",
  },
  [EnumTransferStatuses.INITIATED]: {
    badgeClass: "bg-blue-100 text-blue-700",
    dotClass: "bg-blue-500",
  },
  [EnumTransferStatuses.FAILED_TO_INITIATE]: {
    badgeClass: "bg-red-100 text-red-700",
    dotClass: "bg-red-500",
  },
  [EnumTransferStatuses.COMPLETED]: {
    badgeClass: "bg-green-100 text-green-700",
    dotClass: "bg-green-500",
  },
  [EnumTransferStatuses.FAILED]: {
    badgeClass: "bg-red-100 text-red-700",
    dotClass: "bg-red-500",
  },
};

const DIRECTION_CONFIG: Record<EnumTransferDirection, string> = {
  [EnumTransferDirection.RESTAURANT]: "bg-primary/10 text-primary",
  [EnumTransferDirection.PLATFORM]: "bg-purple-100 text-purple-700",
};

const formatEnumLabel = (value?: string) => {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const Transfers = () => {
  const [searchParams] = useSearchParams();

  const [transfers, setTransfers] = useState<ITransferEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [statusFilter, setStatusFilter] = useState<EnumTransferStatuses | "">(
    (searchParams.get("status") as EnumTransferStatuses) || "",
  );
  const [directionFilter, setDirectionFilter] = useState<
    EnumTransferDirection | ""
  >((searchParams.get("transferDirection") as EnumTransferDirection) || "");

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await TransferService.getAdminTransfers({
        page,
        limit: LIMIT,
        status: statusFilter || undefined,
        transferDirection: directionFilter || undefined,
      });

      if (
        data.code === EnumStatusResponse.SUCCESS &&
        data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
        data.data
      ) {
        setTransfers(data.data.items);
        setTotalPages(data.data.totalPages);
        setTotalItems(data.data.totalItems);
      } else {
        showErrorToast(data.message ?? "Unable to load transfers");
      }
    } catch {
      showErrorToast("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, directionFilter]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const { newNotification } = useSelector(
    (state: RootState) => state.notification,
  );

  const applyTransferUpdate = useCallback(
    (updated: ITransferEntity) => {
      setTransfers((prev) => {
        const matchesFilters =
          (!statusFilter || updated.status === statusFilter) &&
          (!directionFilter || updated.transferDirection === directionFilter);
        const existed = prev.some((item) => item.id === updated.id);
        const next = prev
          .filter((item) => item.id !== updated.retriedFromTransferId)
          .flatMap((item) =>
            item.id === updated.id ? (matchesFilters ? [updated] : []) : [item],
          );
        if (!existed && matchesFilters) {
          next.unshift(updated);
        }
        return next;
      });
    },
    [statusFilter, directionFilter],
  );

  useEffect(() => {
    if (
      newNotification?.type === EnumNotificationType.TRANSFER_STATUS_CHANGED
    ) {
      applyTransferUpdate(newNotification.data as ITransferEntity);
    }
  }, [newNotification, applyTransferUpdate]);

  const applyTransferGroupUpdate = useCallback(
    (group: ITransferGroupEntity) => {
      setTransfers((prev) =>
        prev.map((item) =>
          item.transferGroupId === group.id ||
          item.transferGroup?.id === group.id
            ? { ...item, transferGroup: group }
            : item,
        ),
      );
    },
    [],
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "start" | "retry" | "topup";
    transfer: ITransferEntity;
  } | null>(null);

  const handleStart = async (transfer: ITransferEntity) => {
    setActionLoading(transfer.id);
    try {
      const { data } = await TransferService.startTransfer(transfer.id);
      if (data.code === EnumStatusResponse.SUCCESS) {
        showSuccessToast(data.message ?? "Transfer started");
        if (data.data) {
          applyTransferUpdate(data.data);
        }
      } else {
        showErrorToast(data.message ?? "Unable to start transfer");
      }
    } catch {
      showErrorToast("Something went wrong");
    } finally {
      setActionLoading(null);
      setConfirmOpen(false);
      setPendingAction(null);
    }
  };

  const handleEnsureTopup = async (transfer: ITransferEntity) => {
    const transferGroupId =
      transfer.transferGroup?.id ?? transfer.transferGroupId;
    if (!transferGroupId) {
      showErrorToast("No transfer group on this transfer");
      setConfirmOpen(false);
      setPendingAction(null);
      return;
    }

    setActionLoading(transferGroupId);
    try {
      const { data } = await TransferService.ensureTopup(transferGroupId);
      if (data.code === EnumStatusResponse.SUCCESS) {
        showSuccessToast(data.message ?? "Topup ensured");
        if (data.data) {
          applyTransferGroupUpdate(data.data);
        }
      } else {
        showErrorToast(data.message ?? "Unable to ensure topup");
      }
    } catch {
      showErrorToast("Something went wrong");
    } finally {
      setActionLoading(null);
      setConfirmOpen(false);
      setPendingAction(null);
    }
  };

  const handleRetry = async (transfer: ITransferEntity) => {
    setActionLoading(transfer.id);
    try {
      const { data } = await TransferService.retryTransfer(transfer.id);
      if (data.code === EnumStatusResponse.SUCCESS) {
        showSuccessToast(data.message ?? "Transfer retried");
        if (data.data) {
          applyTransferUpdate(data.data);
        }
      } else {
        showErrorToast(data.message ?? "Unable to retry transfer");
      }
    } catch {
      showErrorToast("Something went wrong");
    } finally {
      setActionLoading(null);
      setConfirmOpen(false);
      setPendingAction(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <ArrowRightLeft size={22} className="text-primary" />
          Transfers
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            {totalItems.toLocaleString()} transfers
          </span>
          <button
            onClick={fetchTransfers}
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
                setStatusFilter(e.target.value as EnumTransferStatuses | "");
              }}
              className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Statuses</option>
              {Object.values(EnumTransferStatuses).map((status) => (
                <option key={status} value={status}>
                  {ComputeUtils.formatTransferStatus(status)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Direction
            </label>
            <select
              value={directionFilter}
              onChange={(e) => {
                setPage(1);
                setDirectionFilter(
                  e.target.value as EnumTransferDirection | "",
                );
              }}
              className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Directions</option>
              {Object.values(EnumTransferDirection).map((direction) => (
                <option key={direction} value={direction}>
                  {formatEnumLabel(direction)}
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
              <span className="text-sm">Loading transfers...</span>
            </div>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-16">
            <ArrowRightLeft size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No transfers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Restaurant
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Direction
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Topup
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
                {transfers.map((transfer) => {
                  const statusConfig = STATUS_CONFIG[transfer.status];
                  const topupStatus = transfer.transferGroup?.topupStatus;
                  const topupOk =
                    topupStatus === EnumTranzakTopupStatus.SUCCESSFUL;
                  const topupInProgress =
                    topupStatus === EnumTranzakTopupStatus.PROCESSING ||
                    topupStatus === EnumTranzakTopupStatus.PENDING;
                  const canStart =
                    topupOk && transfer.status === EnumTransferStatuses.CREATED;
                  const canRetry =
                    topupOk &&
                    (transfer.status === EnumTransferStatuses.FAILED ||
                      transfer.status ===
                        EnumTransferStatuses.FAILED_TO_INITIATE);
                  const transferGroupId =
                    transfer.transferGroup?.id ?? transfer.transferGroupId;
                  const canEnsureTopup = !!transferGroupId && !topupInProgress;
                  const busy = actionLoading === transfer.id;
                  const topupBusy = actionLoading === transferGroupId;
                  return (
                    <tr
                      key={transfer.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-text font-semibold">
                        {transfer.restaurant?.name ?? (
                          <span
                            className="font-mono text-xs text-gray-500"
                            title={transfer.restaurantId}
                          >
                            {transfer.restaurantId?.slice(-8)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="font-extrabold text-text tabular-nums">
                          {transfer.amount?.toLocaleString()}
                        </span>{" "}
                        <span className="text-xs font-semibold text-primary">
                          FCFA
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DIRECTION_CONFIG[transfer.transferDirection]}`}
                        >
                          {formatEnumLabel(transfer.transferDirection)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.badgeClass} ${
                            transfer.status !== EnumTransferStatuses.COMPLETED
                              ? "animate-bounce"
                              : ""
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`}
                          />
                          {ComputeUtils.formatTransferStatus(transfer.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {transfer.transferGroup?.topupStatus ? (
                          <span className="text-xs text-gray-500">
                            {formatEnumLabel(
                              transfer.transferGroup.topupStatus,
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                        {ComputeUtils.formatDate(transfer.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {!topupOk ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                topupInProgress
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                              title="Transfer group topup"
                            >
                              {topupInProgress && (
                                <Loader2 size={11} className="animate-spin" />
                              )}
                              {topupStatus
                                ? `Topup ${formatEnumLabel(topupStatus).toLowerCase()}`
                                : "No topup"}
                            </span>
                            {canEnsureTopup && (
                              <button
                                onClick={() => {
                                  setPendingAction({
                                    type: "topup",
                                    transfer,
                                  });
                                  setConfirmOpen(true);
                                }}
                                disabled={topupBusy}
                                title="Ensure topup"
                                className="p-1.5 rounded-lg transition-colors disabled:opacity-50 bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                {topupBusy ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <RefreshCw size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        ) : (
                          (canStart || canRetry) && (
                            <button
                              onClick={() => {
                                setPendingAction({
                                  type: canStart ? "start" : "retry",
                                  transfer,
                                });
                                setConfirmOpen(true);
                              }}
                              disabled={busy}
                              title={
                                canStart ? "Start transfer" : "Retry transfer"
                              }
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                canStart
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              }`}
                            >
                              {busy ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : canStart ? (
                                <Play size={16} />
                              ) : (
                                <RotateCcw size={16} />
                              )}
                            </button>
                          )
                        )}
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

      <ConfirmModal
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title={
          pendingAction?.type === "topup"
            ? "Ensure topup?"
            : pendingAction?.type === "start"
              ? "Start transfer?"
              : "Retry transfer?"
        }
        description={
          pendingAction?.type === "topup"
            ? `Ensure the transfer group topup${
                pendingAction.transfer.transferGroup?.totalTopupAmount
                  ? ` of ${pendingAction.transfer.transferGroup.totalTopupAmount.toLocaleString()} FCFA`
                  : ""
              }.`
            : pendingAction
              ? `${pendingAction.type === "start" ? "Start" : "Retry"} a ${pendingAction.transfer.amount?.toLocaleString()} FCFA transfer${
                  pendingAction.transfer.restaurant?.name
                    ? ` to ${pendingAction.transfer.restaurant.name}`
                    : ""
                }.`
              : undefined
        }
        confirmText={
          pendingAction?.type === "topup"
            ? "Ensure"
            : pendingAction?.type === "start"
              ? "Start"
              : "Retry"
        }
        loading={
          !!pendingAction &&
          actionLoading ===
            (pendingAction.type === "topup"
              ? (pendingAction.transfer.transferGroup?.id ??
                pendingAction.transfer.transferGroupId)
              : pendingAction.transfer.id)
        }
        onConfirm={() => {
          if (pendingAction?.type === "start") {
            handleStart(pendingAction.transfer);
          } else if (pendingAction?.type === "retry") {
            handleRetry(pendingAction.transfer);
          } else if (pendingAction?.type === "topup") {
            handleEnsureTopup(pendingAction.transfer);
          }
        }}
      />
    </div>
  );
};

export default Transfers;
