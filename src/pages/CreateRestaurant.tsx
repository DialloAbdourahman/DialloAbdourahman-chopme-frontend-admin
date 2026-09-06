import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  createRestaurantSchema,
  EnumStatusCode,
  EnumStatusResponse,
  type CreateRestaurantDto,
  type IOrchestrationResult,
} from "chopme-frontend-common";
import { AxiosError } from "axios";
import { ArrowLeft, User, Contact, Loader2, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import AddressLocationSection from "../components/AddressLocationSection";
import { RestaurantService } from "../services/restaurant.service";
import { getRestaurantTypes } from "../utils/constants";
import { showErrorToast, showSuccessToast } from "../utils/toasts";

const CreateRestaurant = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateRestaurantDto>({
    resolver: zodResolver(createRestaurantSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      slogan: "",
      description: "",
      phone: "",
      restaurantEmail: "",
      type: getRestaurantTypes()[0]?.type,
      address: {
        country: "",
        city: "",
        state: "",
        longName: "",
        countryCode: "",
      },
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      deliveryPricingKm: [
        { from: 0, to: 3, price: 800 },
        { from: 3, to: 7, price: 1500 },
        { from: 7, to: 15, price: 2500 },
      ],
      availability: [
        { day: "Monday", openTime: "10:00", closeTime: "21:30" },
        { day: "Tuesday", openTime: "10:00", closeTime: "21:30" },
        { day: "Wednesday", openTime: "10:00", closeTime: "21:30" },
        { day: "Thursday", openTime: "10:00", closeTime: "21:30" },
        { day: "Friday", openTime: "10:00", closeTime: "22:30" },
        { day: "Saturday", openTime: "09:00", closeTime: "22:30" },
        { day: "Sunday", openTime: "09:00", closeTime: "20:30" },
      ],
    },
  });

  const onSubmit = async (data: CreateRestaurantDto) => {
    const { confirmPassword, ...payload } = data;
    try {
      const res = await RestaurantService.create(payload);
      if (
        res.data.code === EnumStatusResponse.SUCCESS &&
        res.data.statusCode === EnumStatusCode.CREATED_SUCCESSFULLY &&
        res.data.data
      ) {
        showSuccessToast("Restaurant created successfully");
        navigate(`/restaurants/${res.data.data.id}`);
      } else {
        showErrorToast(res.data.message || "Failed to create restaurant");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      const statusCode = err.response?.data?.statusCode;

      switch (statusCode) {
        case EnumStatusCode.EXISTS_ALREADY:
          showErrorToast("A restaurant with this name already exists.");
          break;
        case EnumStatusCode.USER_ALREADY_EXISTS:
          showErrorToast("A user with this email already exists.");
          break;
        case EnumStatusCode.UNABLE_TO_CREATE_ACCOUNT:
          showErrorToast(
            "Unable to create the restaurant account. Please try again.",
          );
          break;
        case EnumStatusCode.VALIDATION_ERROR:
        case EnumStatusCode.INVALID_REQUEST:
          showErrorToast("Please check your input and try again.");
          break;
        case EnumStatusCode.INTERNAL_SERVER_ERROR:
          showErrorToast("Something went wrong. Please try again.");
          break;
        default:
          showErrorToast(
            err.response?.data?.message || "Failed to create restaurant",
          );
      }
    }
  };

  const name = watch("name");

  useEffect(() => {
    const value = name?.trim();
    if (!value) {
      clearErrors("name");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await RestaurantService.checkName(value);
        if (
          res.data.code === EnumStatusResponse.SUCCESS &&
          res.data.data?.available === false
        ) {
          setError("name", {
            message: res.data.message || "Restaurant name is already taken",
          });
        } else {
          clearErrors("name");
        }
      } catch {
        clearErrors("name");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [name, clearErrors, setError]);

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to restaurants
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Create restaurant</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <User size={20} />
            </div>
            <h2 className="text-lg font-semibold text-text">Owner account</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Full name
              </label>
              <input
                {...register("fullName")}
                type="text"
                placeholder="John Doe"
                className={inputClass}
              />
              {errors.fullName && (
                <p className={errorClass}>{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="owner@example.com"
                className={inputClass}
              />
              {errors.email && (
                <p className={errorClass}>{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters with uppercase, lowercase, number and symbol"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className={errorClass}>{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className={errorClass}>{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Contact size={20} />
            </div>
            <h2 className="text-lg font-semibold text-text">
              Restaurant details
            </h2>
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
              {errors.name && (
                <p className={errorClass}>{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Type
              </label>
              <select {...register("type")} className={inputClass}>
                <option value="">Select a type</option>
                {getRestaurantTypes().map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.title}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className={errorClass}>{errors.type.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Phone
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                  +237
                </span>
                <input
                  {...register("phone", {
                    setValueAs: (v: string) => (v ? `+237${v}` : ""),
                  })}
                  type="tel"
                  placeholder="620487789"
                  className={`${inputClass} pl-12`}
                />
              </div>
              {errors.phone && (
                <p className={errorClass}>{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Restaurant email
              </label>
              <input
                {...register("restaurantEmail")}
                type="email"
                placeholder="info@restaurant.com"
                className={inputClass}
              />
              {errors.restaurantEmail && (
                <p className={errorClass}>{errors.restaurantEmail.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Slogan
              </label>
              <input
                {...register("slogan")}
                type="text"
                placeholder="A short tagline"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Brief description of the restaurant"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <AddressLocationSection
          register={register}
          setValue={setValue}
          control={control}
          errors={errors}
          context="create"
          inputClass={inputClass}
          errorClass={errorClass}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/restaurants"
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-background transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Create restaurant
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRestaurant;
