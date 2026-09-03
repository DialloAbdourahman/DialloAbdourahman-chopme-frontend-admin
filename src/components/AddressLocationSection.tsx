import { useEffect, useMemo, useRef } from "react";
import {
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { Loader2, MapPin, MapPinned } from "lucide-react";
import { KEYS } from "../utils/keys";
import { showErrorToast } from "../utils/toasts";

interface AddressLocationSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  control: any;
  errors: FieldErrors<any>;
  context: "create" | "update";
  onUpdate?: () => void | Promise<void>;
  isUpdating?: boolean;
  isDirty?: boolean;
  onCancel?: () => void;
  inputClass?: string;
  errorClass?: string;
}

const libraries: "places"[] = ["places"];
const DEFAULT_CENTER = { lat: 4.0619, lng: 9.7681 };

const defaultInputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
const defaultErrorClass = "mt-1 text-xs text-red-600";

const AddressLocationSection: React.FC<AddressLocationSectionProps> = ({
  setValue,
  control,
  errors,
  context,
  onUpdate,
  isUpdating,
  isDirty,
  onCancel,
  inputClass = defaultInputClass,
  errorClass = defaultErrorClass,
}) => {
  const formErrors = errors as any;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const address = useWatch({
    control,
    name: "address",
    defaultValue: {},
  }) as {
    country?: string;
    city?: string;
    state?: string;
    countryCode?: string;
    longName?: string;
  };

  const location = useWatch({
    control,
    name: "location",
    defaultValue: { type: "Point", coordinates: [0, 0] },
  }) as { type: string; coordinates: [number, number] };

  const coordinates = location?.coordinates ?? [0, 0];

  const mapCenter = useMemo(() => {
    const lng = Number(coordinates?.[0]);
    const lat = Number(coordinates?.[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return { lat, lng };
    }
    return DEFAULT_CENTER;
  }, [coordinates]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: KEYS.GOOGLE_PLACE_API_KEY || "",
    libraries,
  });

  const fillFromPlace = (
    place: google.maps.GeocoderResult | google.maps.places.PlaceResult,
  ) => {
    let country = "";
    let countryCode = "";
    let city = "";
    let state = "";
    let streetName = "";
    let streetNumber = "";

    place.address_components?.forEach((component) => {
      const types = component.types;

      if (types.includes("country")) {
        country = component.long_name;
        countryCode = component.short_name;
      }

      if (types.includes("locality")) {
        city = component.long_name;
      } else if (!city && types.includes("administrative_area_level_2")) {
        city = component.long_name;
      } else if (!city && types.includes("sublocality_level_1")) {
        city = component.long_name;
      } else if (!city && types.includes("sublocality")) {
        city = component.long_name;
      }

      if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }

      if (types.includes("route")) {
        streetName = component.long_name;
      }

      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      }
    });

    const longName =
      place.formatted_address ||
      `${streetNumber} ${streetName}, ${city}, ${country}`.trim();

    setValue(
      "address",
      {
        country,
        city,
        state,
        countryCode,
        longName,
      },
      { shouldDirty: true },
    );
    setValue(
      "location",
      {
        type: "Point",
        coordinates: [
          place.geometry!.location!.lng(),
          place.geometry!.location!.lat(),
        ],
      },
      { shouldDirty: true },
    );
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (lat == null || lng == null) return;

    const newPosition = { lat, lng };
    setValue(
      "location",
      { type: "Point", coordinates: [lng, lat] },
      { shouldDirty: true },
    );

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: newPosition }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        fillFromPlace(results[0]);
      } else {
        showErrorToast("Could not fetch address for the selected location");
      }
    });
  };

  const displayedAddress = useMemo(() => {
    if (address?.longName?.trim()) return address.longName.trim();
    const parts = [address?.city, address?.country].filter(Boolean);
    return parts.length
      ? parts.join(", ")
      : "Search or drag the marker to set the address";
  }, [address]);

  useEffect(() => {
    if (!isLoaded || !searchInputRef.current || autocompleteRef.current) {
      return;
    }

    autocompleteRef.current = new google.maps.places.Autocomplete(
      searchInputRef.current,
      {
        fields: ["address_components", "geometry", "formatted_address"],
      },
    );

    const listener = autocompleteRef.current.addListener(
      "place_changed",
      () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          fillFromPlace(place);
        }
      },
    );

    return () => {
      if (autocompleteRef.current && listener) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded]);

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <MapPinned size={20} />
        </div>
        <h2 className="text-lg font-semibold text-text">Address & location</h2>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text mb-1">
          Search address
        </label>
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Start typing an address..."
            disabled={!isLoaded || Boolean(loadError)}
            className={`${inputClass} pr-10`}
          />
          {!isLoaded && !loadError && (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
            />
          )}
        </div>
        {loadError && (
          <p className={errorClass}>
            Could not load address search. Please fill the fields manually.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            Country
          </label>
          <input
            type="text"
            placeholder="Cameroon"
            value={address?.country ?? ""}
            onChange={(e) =>
              setValue(
                "address",
                { ...address, country: e.target.value },
                { shouldDirty: true },
              )
            }
            className={inputClass}
          />
          {formErrors.address?.country && (
            <p className={errorClass}>
              {formErrors.address.country.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            City
          </label>
          <input
            type="text"
            placeholder="Douala"
            value={address?.city ?? ""}
            onChange={(e) =>
              setValue(
                "address",
                { ...address, city: e.target.value },
                { shouldDirty: true },
              )
            }
            className={inputClass}
          />
          {formErrors.address?.city && (
            <p className={errorClass}>
              {formErrors.address.city.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            State / Region
          </label>
          <input
            type="text"
            placeholder="Littoral"
            value={address?.state ?? ""}
            onChange={(e) =>
              setValue(
                "address",
                { ...address, state: e.target.value },
                { shouldDirty: true },
              )
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            Country code
          </label>
          <input
            type="text"
            placeholder="CM"
            value={address?.countryCode ?? ""}
            onChange={(e) =>
              setValue(
                "address",
                { ...address, countryCode: e.target.value },
                { shouldDirty: true },
              )
            }
            className={inputClass}
          />
          {formErrors.address?.countryCode && (
            <p className={errorClass}>
              {formErrors.address.countryCode.message as string}
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text mb-1">
            Full address
          </label>
          <input
            type="text"
            placeholder="123 Main Street"
            value={address?.longName ?? ""}
            onChange={(e) =>
              setValue(
                "address",
                { ...address, longName: e.target.value },
                { shouldDirty: true },
              )
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-text mb-3">Coordinates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="9.7681"
              value={coordinates?.[0] ?? ""}
              onChange={(e) =>
                setValue(
                  "location",
                  {
                    ...location,
                    coordinates: [Number(e.target.value), coordinates[1]],
                  },
                  { shouldDirty: true },
                )
              }
              className={inputClass}
            />
            {formErrors.location?.coordinates && (
              <p className={errorClass}>
                {formErrors.location.coordinates.message as string}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="4.0619"
              value={coordinates?.[1] ?? ""}
              onChange={(e) =>
                setValue(
                  "location",
                  {
                    ...location,
                    coordinates: [coordinates[0], Number(e.target.value)],
                  },
                  { shouldDirty: true },
                )
              }
              className={inputClass}
            />
          </div>
        </div>

        {isLoaded && mapCenter && (
          <>
            <div className="flex items-start gap-2 text-sm text-text mt-4">
              <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
              <span>{displayedAddress}</span>
            </div>
            <div className="h-48 sm:h-64 rounded-2xl overflow-hidden mt-2">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={15}
              >
                <MarkerF
                  position={mapCenter}
                  onDragEnd={handleMarkerDragEnd}
                  draggable
                />
              </GoogleMap>
            </div>
          </>
        )}
        {!isLoaded && !loadError && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            Loading map...
          </div>
        )}
        {loadError && (
          <p className={`${errorClass} mt-4`}>
            Could not load the map. Please use the search or coordinates fields.
          </p>
        )}

        <div className="mt-4 flex items-center justify-end gap-3">
          {context === "update" && onCancel && isDirty && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-text hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          )}
          {context === "update" && onUpdate && (
            <button
              type="button"
              onClick={onUpdate}
              disabled={isUpdating || isDirty === false}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isUpdating && <Loader2 size={16} className="animate-spin" />}
              Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressLocationSection;
