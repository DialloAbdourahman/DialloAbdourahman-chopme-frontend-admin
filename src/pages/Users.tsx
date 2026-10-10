import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Check,
  Copy,
  Power,
  RefreshCw,
  Search,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import {
  EnumAuthType,
  EnumUserRole,
  type AdminUsersQueryDto,
  type IUserEntity,
} from "chopme-frontend-common";
import Pagination from "../components/Pagination";
import { UserService } from "../services/user.service";

const formatDateForInput = (date?: Date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseFilters = (value: string | null): AdminUsersQueryDto => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as AdminUsersQueryDto;
    if (parsed.dateFrom) parsed.dateFrom = new Date(parsed.dateFrom);
    if (parsed.dateTo) parsed.dateTo = new Date(parsed.dateTo);
    return parsed;
  } catch {
    return {};
  }
};

const formatEnumLabel = (value?: string) => {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (value?: string | Date) => {
  if (!value) return "";
  const d = new Date(value);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState<IUserEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 10);
  const [filters, setFilters] = useState<AdminUsersQueryDto>(
    parseFilters(searchParams.get("filter")),
  );
  const [search, setSearch] = useState(filters.search ?? "");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIdInitials = (id: string) => {
    return id.slice(0, 8);
  };

  const handleDelete = (user: IUserEntity) => {
    if (!window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      return;
    }
    console.log("Delete user:", user.id);
  };

  const handleDeactivate = (user: IUserEntity) => {
    const action = user.active ? "deactivate" : "activate";
    if (
      !window.confirm(`Are you sure you want to ${action} ${user.fullName}?`)
    ) {
      return;
    }
    console.log(`${action} user:`, user.id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      search: search.trim() || undefined,
    }));
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilters({});
    setLimit(10);
    setPage(1);
  };

  const handleFilterChange = <K extends keyof AdminUsersQueryDto>(
    key: K,
    value: AdminUsersQueryDto[K],
  ) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await UserService.findAllForAdmin({
        page,
        limit,
        filters,
      });
      if (result.data.data) {
        setUsers(result.data.data.items);
        setTotalPages(result.data.data.totalPages);
        setTotalUsers(result.data.data.totalItems);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (filters && Object.keys(filters).length > 0) {
      params.filter = JSON.stringify(filters);
    }
    setSearchParams(params, { replace: true });

    fetchUsers();
  }, [page, limit, filters, setSearchParams]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Users</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            {totalUsers.toLocaleString()} users
          </span>
          <button
            onClick={fetchUsers}
            className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-end">
            <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
              <label className="text-xs text-gray-500 font-medium">
                Search
              </label>
              <form
                onSubmit={handleSearchSubmit}
                className="w-full flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
            <div className="hidden sm:block w-px bg-border self-stretch mx-2" />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">
                Status
              </label>
              <select
                value={
                  filters.active === undefined ? "" : String(filters.active)
                }
                onChange={(e) =>
                  handleFilterChange(
                    "active",
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                  )
                }
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">
                Deleted
              </label>
              <select
                value={
                  filters.deleted === undefined ? "" : String(filters.deleted)
                }
                onChange={(e) =>
                  handleFilterChange(
                    "deleted",
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                  )
                }
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Deletion</option>
                <option value="true">Deleted</option>
                <option value="false">Not Deleted</option>
              </select>
            </div>
          </div>

          <div className="border-t border-border/50" />

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Role</label>
              <select
                value={filters.role ?? ""}
                onChange={(e) =>
                  handleFilterChange(
                    "role",
                    e.target.value
                      ? (e.target.value as EnumUserRole)
                      : undefined,
                  )
                }
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Roles</option>
                {Object.values(EnumUserRole).map((r) => (
                  <option key={r} value={r}>
                    {formatEnumLabel(r)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">
                Auth Type
              </label>
              <select
                value={filters.authType ?? ""}
                onChange={(e) =>
                  handleFilterChange(
                    "authType",
                    e.target.value
                      ? (e.target.value as EnumAuthType)
                      : undefined,
                  )
                }
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Auth Types</option>
                {Object.values(EnumAuthType).map((t) => (
                  <option key={t} value={t}>
                    {formatEnumLabel(t)}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block w-px bg-border self-stretch mx-2" />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">From</label>
              <input
                type="date"
                value={formatDateForInput(filters.dateFrom)}
                onChange={(e) =>
                  handleFilterChange(
                    "dateFrom",
                    e.target.value ? new Date(e.target.value) : undefined,
                  )
                }
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">To</label>
              <input
                type="date"
                value={formatDateForInput(filters.dateTo)}
                onChange={(e) =>
                  handleFilterChange(
                    "dateTo",
                    e.target.value ? new Date(e.target.value) : undefined,
                  )
                }
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="hidden sm:block w-px bg-border self-stretch mx-2" />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">
                Sort By
              </label>
              <select
                value={filters.sortBy ?? "createdAt"}
                onChange={(e) =>
                  handleFilterChange(
                    "sortBy",
                    e.target.value as
                      | "createdAt"
                      | "lastLoginAt"
                      | "lastTokenRefreshedAt",
                  )
                }
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="createdAt">Created At</option>
                <option value="lastLoginAt">Last Login</option>
                <option value="lastTokenRefreshedAt">
                  Last Token Refreshed
                </option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Order</label>
              <select
                value={filters.sort ?? "desc"}
                onChange={(e) =>
                  handleFilterChange("sort", e.target.value as "asc" | "desc")
                }
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">
                Per Page
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium opacity-0">
                Actions
              </label>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl border border-border bg-background text-sm text-text font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 text-gray-400">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm">Loading users...</span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <UsersIcon size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No users found</p>
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
                    Full Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Auth Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Active
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Created At
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Deleted
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-text">
                      <div
                        className="group relative inline-flex items-center gap-1 cursor-pointer"
                        onClick={() => handleCopyId(user.id)}
                        title="Click to copy ID"
                      >
                        <span className="font-mono text-xs">
                          {getIdInitials(user.id)}
                        </span>
                        {copiedId === user.id ? (
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
                      {user.fullName}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {formatEnumLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {formatEnumLabel(user.authType)}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {user.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {user.deleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 animate-bounce">
                          <X size={12} />
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">
                      {user.role !== EnumUserRole.ADMIN && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeactivate(user)}
                            title={user.active ? "Deactivate" : "Activate"}
                            className="p-1.5 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                          >
                            <Power size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
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
    </div>
  );
};

export default Users;
