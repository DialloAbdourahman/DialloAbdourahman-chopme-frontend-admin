import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Store } from "lucide-react";
import { AxiosError } from "axios";
import {
  adminUpdateRestaurantSchema,
  type AdminUpdateRestaurantDto,
  EnumStatusResponse,
  type IOrchestrationResult,
  type IRestaurantEntity,
} from "chopme-frontend-common";
import { RestaurantService } from "../services/restaurant.service";
import { showErrorToast, showSuccessToast } from "../utils/toasts";
import { getRestaurantTypes } from "../utils/constants";

interface RestaurantGeneralInfoFormProps {
  restaurant: IRestaurantEntity;
  onUpdate: (restaurant: IRestaurantEntity) => void;
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
const errorClass = "mt-1 text-xs text-red-600";

const RestaurantGeneralInfoForm = ({
  restaurant,
  onUpdate,
}: RestaurantGeneralInfoFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Pick<AdminUpdateRestaurantDto, "name" | "type">>({
    resolver: zodResolver(
      adminUpdateRestaurantSchema.pick({ name: true, type: true }),
    ),
    defaultValues: {
      name: restaurant.name,
      type: restaurant.type,
    },
  });

  useEffect(() => {
    reset({
      name: restaurant.name,
      type: restaurant.type,
    });
  }, [restaurant, reset]);

  const onSubmit = async (
    values: Pick<AdminUpdateRestaurantDto, "name" | "type">,
  ) => {
    try {
      const { data } = await RestaurantService.adminUpdate(restaurant.id, {
        name: values.name,
        type: values.type,
      });

      if (data.code === EnumStatusResponse.SUCCESS && data.data) {
        onUpdate(data.data);
        reset({
          name: data.data.name,
          type: data.data.type,
        });
        showSuccessToast("Restaurant updated successfully");
      } else {
        showErrorToast(data.message || "Update failed");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      showErrorToast(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Store size={20} />
        </div>
        <h2 className="text-lg font-semibold text-text">General information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            Name
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Restaurant name"
            className={inputClass}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">
            Type
          </label>
          <select {...register("type")} className={inputClass}>
            {getRestaurantTypes().map((rt) => (
              <option key={rt.type} value={rt.type}>
                {rt.title}
              </option>
            ))}
          </select>
          {errors.type && <p className={errorClass}>{errors.type.message}</p>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        {isDirty && (
          <button
            type="button"
            onClick={() =>
              reset({
                name: restaurant.name,
                type: restaurant.type,
              })
            }
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-text hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Update
        </button>
      </div>
    </form>
  );
};

export default RestaurantGeneralInfoForm;
