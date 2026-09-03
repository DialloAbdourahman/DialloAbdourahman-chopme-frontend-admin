import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import {
  EnumStatusResponse,
  type IOrchestrationResult,
  type IRestaurantEntity,
} from "chopme-frontend-common";
import { RestaurantService } from "../services/restaurant.service";
import { KEYS } from "../utils/keys";
import RestaurantGeneralInfoForm from "../components/RestaurantGeneralInfoForm";
import RestaurantAddressLocationForm from "../components/RestaurantAddressLocationForm";
import RestaurantCoverSection from "../components/RestaurantCoverSection";
import RestaurantGallerySection from "../components/RestaurantGallerySection";
import DeleteModal from "../components/DeleteModal";
import { showErrorToast, showSuccessToast } from "../utils/toasts";

const MAX_RESTAURANT_IMAGES = Number(KEYS.MAX_RESTAURANT_IMAGES) || 5;
const MAX_RESTAURANT_IMAGE_SIZE_IN_MB =
  Number(KEYS.MAX_RESTAURANT_IMAGE_SIZE_IN_MB) || 5;
const MAX_IMAGE_SIZE_BYTES = MAX_RESTAURANT_IMAGE_SIZE_IN_MB * 1024 * 1024;

const RestaurantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<IRestaurantEntity | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deletingCover, setDeletingCover] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [coverDeleteModalOpen, setCoverDeleteModalOpen] = useState(false);
  const [imageDeleteModalOpen, setImageDeleteModalOpen] = useState(false);
  const [imageKeyToDelete, setImageKeyToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchRestaurant = async () => {
      setLoading(true);
      try {
        const res = await RestaurantService.findOne(id);
        if (res.data.code === EnumStatusResponse.SUCCESS && res.data.data) {
          setRestaurant(res.data.data);
        } else {
          showErrorToast(res.data.message || "Restaurant not found");
          navigate("/restaurants");
        }
      } catch (error) {
        const err = error as AxiosError<IOrchestrationResult<string>>;
        showErrorToast(
          err.response?.data?.message || "Failed to load restaurant",
        );
        navigate("/restaurants");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRestaurant();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const validateImageFile = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showErrorToast(
        `Image too large. Max size is ${MAX_RESTAURANT_IMAGE_SIZE_IN_MB}MB.`,
      );
      return false;
    }
    return true;
  };

  const onUploadCover = async (file: File) => {
    if (!restaurant || !validateImageFile(file)) return;
    setUploadingCover(true);
    try {
      const { data } = await RestaurantService.uploadCoverImage(
        restaurant.id,
        file,
      );
      if (data.data) {
        setRestaurant(data.data);
        showSuccessToast("Cover image updated");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      showErrorToast(
        err.response?.data?.message || "Failed to upload cover image",
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const onDeleteCover = async () => {
    if (!restaurant) return;
    setDeletingCover(true);
    try {
      const { data } = await RestaurantService.deleteCoverImage(restaurant.id);
      if (data.data) {
        setRestaurant(data.data);
        showSuccessToast("Cover image removed");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      showErrorToast(
        err.response?.data?.message || "Failed to delete cover image",
      );
    } finally {
      setDeletingCover(false);
      setCoverDeleteModalOpen(false);
    }
  };

  const onUploadImage = async (file: File) => {
    if (!restaurant || !validateImageFile(file)) return;
    if (restaurant.pictures.length >= MAX_RESTAURANT_IMAGES) {
      showErrorToast(`Maximum ${MAX_RESTAURANT_IMAGES} images allowed.`);
      return;
    }
    setUploadingImage(true);
    try {
      const { data } = await RestaurantService.uploadImage(restaurant.id, file);
      if (data.data) {
        setRestaurant(data.data);
        showSuccessToast("Image uploaded");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      showErrorToast(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const openImageDeleteModal = (key: string) => {
    setImageKeyToDelete(key);
    setImageDeleteModalOpen(true);
  };

  const onDeleteImage = async () => {
    if (!restaurant || !imageKeyToDelete) return;
    setDeletingKey(imageKeyToDelete);
    try {
      const { data } = await RestaurantService.deleteImage(
        restaurant.id,
        imageKeyToDelete,
      );
      if (data.data) {
        setRestaurant(data.data);
        showSuccessToast("Image removed");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      showErrorToast(err.response?.data?.message || "Failed to delete image");
    } finally {
      setDeletingKey(null);
      setImageDeleteModalOpen(false);
      setImageKeyToDelete(null);
    }
  };

  if (loading || !restaurant) {
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
          <h1 className="text-2xl font-bold text-text">Restaurant details</h1>
        </div>

        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-text">Restaurant details</h1>
      </div>

      <div className="space-y-6">
        <RestaurantCoverSection
          coverImage={restaurant.coverImage}
          name={restaurant.name}
          uploadingCover={uploadingCover}
          deletingCover={deletingCover}
          onUpload={onUploadCover}
          onDelete={() => setCoverDeleteModalOpen(true)}
        />
        <RestaurantGallerySection
          pictures={restaurant.pictures}
          name={restaurant.name}
          uploadingImage={uploadingImage}
          deletingKey={deletingKey}
          onUpload={onUploadImage}
          onDelete={openImageDeleteModal}
        />
        <RestaurantGeneralInfoForm
          restaurant={restaurant}
          onUpdate={setRestaurant}
        />
        <RestaurantAddressLocationForm
          restaurant={restaurant}
          onUpdate={setRestaurant}
        />
      </div>

      <DeleteModal
        open={coverDeleteModalOpen}
        setOpen={setCoverDeleteModalOpen}
        title="Remove cover image"
        description="Are you sure you want to remove the cover image?"
        confirmText="Remove"
        loading={deletingCover}
        onConfirm={onDeleteCover}
      />
      <DeleteModal
        open={imageDeleteModalOpen}
        setOpen={setImageDeleteModalOpen}
        title="Remove image"
        description="Are you sure you want to remove this image?"
        confirmText="Remove"
        loading={deletingKey !== null}
        onConfirm={onDeleteImage}
      />
    </div>
  );
};

export default RestaurantDetails;
