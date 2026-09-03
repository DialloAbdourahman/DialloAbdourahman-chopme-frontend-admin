import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  adminUpdateRestaurantSchema,
  type AdminUpdateRestaurantDto,
  EnumStatusResponse,
  type IOrchestrationResult,
  type IRestaurantEntity,
} from "chopme-frontend-common";
import { RestaurantService } from "../services/restaurant.service";
import AddressLocationSection from "./AddressLocationSection";
import { showErrorToast, showSuccessToast } from "../utils/toasts";

interface RestaurantAddressLocationFormProps {
  restaurant: IRestaurantEntity;
  onUpdate: (restaurant: IRestaurantEntity) => void;
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
const errorClass = "mt-1 text-xs text-red-600";

const RestaurantAddressLocationForm = ({
  restaurant,
  onUpdate,
}: RestaurantAddressLocationFormProps) => {
  const {
    register,
    setValue,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Pick<AdminUpdateRestaurantDto, "address" | "location">>({
    resolver: zodResolver(
      adminUpdateRestaurantSchema.pick({ address: true, location: true }),
    ),
    defaultValues: {
      address: restaurant.address,
      location: restaurant.location,
    },
  });

  const onSubmit = async (
    values: Pick<AdminUpdateRestaurantDto, "address" | "location">,
  ) => {
    try {
      const { data } = await RestaurantService.adminUpdate(restaurant.id, {
        address: values.address,
        location: values.location,
      });

      if (data.code === EnumStatusResponse.SUCCESS && data.data) {
        onUpdate(data.data);
        reset({
          address: data.data.address,
          location: data.data.location,
        });
        showSuccessToast("Address & location updated successfully");
      } else {
        showErrorToast(data.message || "Update failed");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      showErrorToast(err.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    reset({
      address: restaurant.address,
      location: restaurant.location,
    });
  }, [restaurant, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AddressLocationSection
        register={register}
        setValue={setValue}
        control={control}
        errors={errors}
        context="update"
        onUpdate={handleSubmit(onSubmit)}
        isUpdating={isSubmitting}
        isDirty={isDirty}
        onCancel={() =>
          reset({
            address: restaurant.address,
            location: restaurant.location,
          })
        }
        inputClass={inputClass}
        errorClass={errorClass}
      />
    </form>
  );
};

export default RestaurantAddressLocationForm;
