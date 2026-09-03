import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Search,
  Trash2,
  Star,
  Copy,
  Check,
  X,
  ArrowUpDown,
  RefreshCw,
  Utensils,
  Plus,
} from "lucide-react";
import { RestaurantService } from "../services/restaurant.service";
import type { IRestaurantEntity } from "chopme-frontend-common";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import { getRestaurantTypes } from "../utils/constants";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<IRestaurantEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleted, setDeleted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRestaurant, setDeletingRestaurant] =
    useState<IRestaurantEntity | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIdInitials = (id: string) => {
    return id.slice(0, 8);
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data } = await RestaurantService.findAllForAdmin({
        page,
        limit: 10,
        search: search || undefined,
        type: type || undefined,
        deleted,
        sortBy: sortBy || undefined,
        sortOrder: sortBy ? sortOrder : undefined,
      });
      if (data.code === "SUCCESS" && data.data) {
        setRestaurants(data.data.items);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchRestaurants();
  };

  const handleClearFilters = () => {
    setSearch("");
    setType("");
    setSortBy("");
    setSortOrder("desc");
    setDeleted(false);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deletingRestaurant) return;
    setDeleting(true);
    try {
      await RestaurantService.delete(deletingRestaurant.id);
      setRestaurants((prev) =>
        prev.filter((r) => r.id !== deletingRestaurant.id),
      );
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete restaurant:", error);
    } finally {
      setDeleting(false);
      setDeletingRestaurant(null);
    }
  };

  const handleRestore = async () => {
    if (!deletingRestaurant) return;
    setDeleting(true);
    try {
      await RestaurantService.restore(deletingRestaurant.id);
      setRestaurants((prev) =>
        prev.filter((r) => r.id !== deletingRestaurant.id),
      );
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to restore restaurant:", error);
    } finally {
      setDeleting(false);
      setDeletingRestaurant(null);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [page, deleted, sortBy, sortOrder, type]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Restaurants</h1>
        <Link
          to="/restaurants/create"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Create restaurant
        </Link>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Types</option>
            {getRestaurantTypes().map((rt) => (
              <option key={rt.type} value={rt.type}>
                {rt.title}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Sort By</option>
            <option value="rating.average">Rating</option>
            <option value="totalViews">Views</option>
            <option value="createdAt">Created Date</option>
          </select>
          {sortBy && (
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary flex items-center gap-2"
            >
              <ArrowUpDown size={16} />
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          )}
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background text-sm text-text cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={deleted}
              onChange={(e) => {
                setDeleted(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm">Show Deleted</span>
          </label>
          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-xl border border-border bg-background text-sm text-text font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Clear
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 text-gray-400">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm">Loading restaurants...</span>
            </div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-16">
            <Utensils size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No restaurants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Rating
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Deleted
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-text">
                      <div
                        className="group relative inline-flex items-center gap-1 cursor-pointer"
                        onClick={() => handleCopyId(restaurant.id)}
                        title="Click to copy ID"
                      >
                        <span className="font-mono text-xs">
                          {getIdInitials(restaurant.id)}
                        </span>

                        {copiedId === restaurant.id ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <Copy
                            size={12}
                            className="text-gray-400 group-hover:text-primary"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      <Link
                        to={`/restaurants/${restaurant.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {restaurant.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {restaurant.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {restaurant.phone}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {getRestaurantTypes().find(
                          (t) => t.type === restaurant.type,
                        )?.title || restaurant.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        <span>
                          {restaurant.rating?.average?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {restaurant.totalViews ?? 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {restaurant.isClosed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                          <X size={12} />
                          Closed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                          <Check size={12} />
                          Open
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {restaurant.deleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 animate-bounce">
                          <X size={12} />
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/restaurants/${restaurant.id}`}
                          className="p-2 rounded-lg bg-background hover:bg-gray-100 text-text transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        {restaurant.deleted ? (
                          <button
                            onClick={() => {
                              setDeletingRestaurant(restaurant);
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                            title="Restore"
                          >
                            <RefreshCw size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setDeletingRestaurant(restaurant);
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        title={
          deletingRestaurant?.deleted
            ? "Restore Restaurant"
            : "Delete Restaurant"
        }
        description={
          deletingRestaurant?.deleted
            ? `Are you sure you want to restore "${deletingRestaurant?.name}"?`
            : `Are you sure you want to delete "${deletingRestaurant?.name}"? This action cannot be undone.`
        }
        confirmText={deletingRestaurant?.deleted ? "Restore" : "Delete"}
        variant={deletingRestaurant?.deleted ? "success" : "danger"}
        loading={deleting}
        onConfirm={deletingRestaurant?.deleted ? handleRestore : handleDelete}
      />
    </div>
  );
};

export default Restaurants;
