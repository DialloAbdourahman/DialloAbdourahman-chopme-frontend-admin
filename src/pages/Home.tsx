import {
  Utensils,
  Users,
  ShoppingBag,
  TrendingUp,
  Activity,
  ChefHat,
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const statCards = [
    {
      label: "Total Restaurants",
      value: "—",
      icon: Utensils,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total Users",
      value: "—",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Orders",
      value: "—",
      icon: ShoppingBag,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Revenue",
      value: "—",
      icon: TrendingUp,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  const quickActions = [
    {
      label: "Manage Restaurants",
      description: "View, search, and manage all restaurants",
      href: "/restaurants",
      icon: Utensils,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-primary to-orange-600 rounded-3xl p-6 md:p-10 text-white shadow-lg relative overflow-hidden mb-8">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium mb-4">
            <ChefHat size={14} />
            <span>Admin Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
            Welcome back, Admin
          </h1>
          <p className="text-sm md:text-base text-white/90 max-w-lg">
            Monitor and manage ChopMe from one place. View restaurant
            performance, user activity, and platform analytics.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <card.icon size={20} />
              </div>
              <Activity size={16} className="text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-text">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-bold text-text mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <action.icon size={20} />
            </div>
            <h3 className="font-semibold text-text text-sm mb-1">
              {action.label}
            </h3>
            <p className="text-xs text-gray-500">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
