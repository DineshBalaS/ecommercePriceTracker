import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, updateProductDetails } from "../api/api"; // <-- ADDED updateProductDetails
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"; // <-- ADDED recharts
import { format, subDays } from "date-fns"; // <-- ADDED date-fns
import { useTheme } from "../context/ThemeContext";

const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError("Product not found or you are not authorized to view it.");
        } else {
          setError("An error occurred while fetching product details.");
        }
        console.error("Failed to fetch product:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const getPriceTrend = () => {
    const history = product?.price_history;
    if (!history || history.length < 2) return { trend: "neutral" };
    const lastValidEntry = history
      .slice()
      .reverse()
      .find((p) => p.price !== null);
    const secondLastValidEntry = history
      .slice(0, -1)
      .reverse()
      .find((p) => p.price !== null);
    if (!lastValidEntry || !secondLastValidEntry) return { trend: "neutral" };
    const lastPrice = lastValidEntry.price;
    const previousPrice = secondLastValidEntry.price;
    if (lastPrice < previousPrice)
      return { trend: "down", icon: "M12 19.5l-6.75-6.75h13.5L12 19.5z" };
    if (lastPrice > previousPrice)
      return { trend: "up", icon: "M12 4.5l6.75 6.75H5.25L12 4.5z" };
    return { trend: "neutral" };
  };

  const trendInfo = getPriceTrend();

  // --- Chart Logic ---
  const [timeRange, setTimeRange] = useState("All");
  const filterHistory = () => {
    if (!product?.price_history) return [];
    const validHistory = product.price_history.filter((p) => p.price !== null);
    if (timeRange === "All") return validHistory;
    let startDate;
    const today = new Date();
    if (timeRange === "1W") startDate = subDays(today, 7);
    if (timeRange === "1M") startDate = subDays(today, 30);
    if (timeRange === "6M") startDate = subDays(today, 180);
    return validHistory.filter((p) => new Date(p.timestamp) >= startDate);
  };
  const chartData = filterHistory();
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg">
          <p
            className={`font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >{`Price: ₹${payload[0].value.toFixed(2)}`}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{`Date: ${format(
            new Date(label),
            "MMM d, yyyy"
          )}`}</p>
        </div>
      );
    }
    return null;
  };

  // --- Form Logic ---
  const [formValues, setFormValues] = useState({
    desired_price: "",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  useEffect(() => {
    if (product) {
      setFormValues({
        desired_price: product.desired_price || "",
        notes: product.notes || "",
      });
    }
  }, [product]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    try {
      const updatedProduct = await updateProductDetails(id, {
        ...formValues,
        desired_price: parseFloat(formValues.desired_price) || 0,
      });
      setProduct(updatedProduct);
      setSaveMessage("Changes saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save changes:", err);
      setSaveMessage("Error saving changes. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Loading Product...
        </h1>
        <Loader />
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block bg-purple-700 dark:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-800 dark:hover:bg-purple-700 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  if (!product) return null;

  const VitalsPanel = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Current Price
        </p>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            ₹{(product.current_price || 0).toFixed(2)}
          </p>
          {trendInfo.trend !== "neutral" && (
            <span
              className={`flex items-center text-sm font-semibold ${
                trendInfo.trend === "up" ? "text-red-500" : "text-green-500"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d={trendInfo.icon}
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Desired Price
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          ₹{(product.desired_price || 0).toFixed(2)}
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Historical Low
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          ₹{(product.historical_low_price || 0).toFixed(2)}
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {" "}
          Historical High
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          ₹{(product.historical_high_price || 0).toFixed(2)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-8 font-sans bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <Link
            to="/dashboard"
            className="text-purple-700 dark:text-purple-400 hover:underline mb-4 block"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {product.name}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Tracking analysis for your product.
          </p>
        </header>
        <VitalsPanel />
      </div>
      <div className="max-w-7xl mx-auto mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Price History
          </h2>
          <div className="flex items-center gap-2">
            {["1W", "1M", "6M", "All"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition ${
                  timeRange === range
                    ? "bg-purple-700 dark:bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: "100%", height: "33vh" }}>
          <ResponsiveContainer>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === "dark" ? "#4A5568" : "#e0e0e0"}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => format(new Date(time), "MMM d")}
                tick={{
                  fill: theme === "dark" ? "#A0AEC0" : "#6B7280",
                  fontSize: 12,
                }}
                stroke={theme === "dark" ? "#718096" : "#9CA3AF"}
              />
              <YAxis
                domain={["dataMin - 100", "dataMax + 100"]}
                tickFormatter={(price) => `₹${price}`}
                tick={{
                  fill: theme === "dark" ? "#A0AEC0" : "#6B7280",
                  fontSize: 12,
                }}
                stroke={theme === "dark" ? "#718096" : "#9CA3AF"}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Area
                type="monotone"
                dataKey="price"
                stroke={false}
                fill="url(#priceGradient)"
                legendType="none"
              />

              <Line
                type="monotone"
                dataKey="price"
                stroke={theme === "dark" ? "#a78bfa" : "#8884d8"}
                strokeWidth={2}
                dot={false}
                name="Price (₹)"
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  fill: "#ffffff", // light-gray for dark mode
                  stroke: theme === "dark" ? "#a78bfa" : "#8884d8", // Also update the dot's border
                }} // <-- hover effect
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          User Settings
        </h2>
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="desired_price"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Desired Price (₹)
              </label>
              <input
                type="number"
                id="desired_price"
                name="desired_price"
                value={formValues.desired_price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                step="0.01"
              />
            </div>
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formValues.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="e.g., Considering for travel, wait for sale..."
                className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-4">
            {saveMessage && (
              <p
                className={`text-sm ${
                  saveMessage.includes("Error")
                    ? "text-red-600 dark:text-red-500"
                    : "text-green-600 dark:text-green-500"
                }`}
              >
                {saveMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-purple-700 dark:bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-800 dark:hover:bg-purple-700 transition disabled:bg-purple-300 disabled:dark:bg-purple-900/50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductDetailPage;
