import { useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { AxiosError } from "axios";
import {
  type IOrchestrationResult,
  type IRestaurantEntity,
} from "chopme-frontend-common";
import { RestaurantService } from "../services/restaurant.service";
import ConfirmModal from "./ConfirmModal";
import { showErrorToast, showSuccessToast } from "../utils/toasts";

interface RestaurantDeleteRestoreSectionProps {
  restaurant: IRestaurantEntity;
  onUpdate: (restaurant: IRestaurantEntity | null) => void;
}

const RestaurantDeleteRestoreSection = ({
  restaurant,
  onUpdate,
}: RestaurantDeleteRestoreSectionProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteOrRestore = async () => {
    setDeleting(true);
    try {
      if (restaurant.deleted) {
        const { data } = await RestaurantService.restore(restaurant.id);
        if (data.data) {
          onUpdate(data.data);
          showSuccessToast("Restaurant restored");
        }
      } else {
        await RestaurantService.delete(restaurant.id);
        onUpdate({
          ...restaurant,
          deleted: new Date(),
          deletedAt: new Date(),
        });
        showSuccessToast("Restaurant deleted");
      }
      setDeleteModalOpen(false);
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      showErrorToast(
        err.response?.data?.message ||
          `Failed to ${restaurant.deleted ? "restore" : "delete"} restaurant`,
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-red-200 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-red-800" />
          <h2 className="text-sm font-semibold text-red-800">
            Delete / restore
          </h2>
        </div>
        <p className="text-sm text-red-700 mb-3">
          {restaurant.deleted
            ? "Restore this restaurant to make it available again."
            : "Delete this restaurant. This action can be undone by restoring it later."}
        </p>
        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          disabled={deleting}
          className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
            restaurant.deleted
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {deleting && <Loader2 size={16} className="animate-spin" />}
          {restaurant.deleted ? <RefreshCw size={16} /> : <Trash2 size={16} />}
          {restaurant.deleted ? "Restore restaurant" : "Delete restaurant"}
        </button>
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        title={restaurant.deleted ? "Restore Restaurant" : "Delete Restaurant"}
        description={
          restaurant.deleted
            ? `Are you sure you want to restore "${restaurant.name}"?`
            : `Are you sure you want to delete "${restaurant.name}"? This action can be undone.`
        }
        confirmText={restaurant.deleted ? "Restore" : "Delete"}
        variant={restaurant.deleted ? "success" : "danger"}
        loading={deleting}
        onConfirm={handleDeleteOrRestore}
      />
    </>
  );
};

export default RestaurantDeleteRestoreSection;
