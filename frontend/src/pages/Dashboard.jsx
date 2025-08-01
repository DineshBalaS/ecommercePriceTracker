// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../api/api"; // Import the pre-configured axios instance

// --- SVG Icons (No changes needed) ---
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const icons = {
  dashboard:
    "M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375zM1.5 9.75v10.125c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875V9.75M8.25 12a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V12.75A.75.75 0 018.25 12zm3.75 0a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V12.75A.75.75 0 0112 12zm3.75 0a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V12.75A.75.75 0 0115.75 12z",
  watchlist:
    "M3 16.5v-11a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2zm2.5-4a.5.5 0 000 1h9a.5.5 0 000-1h-9z",
  user: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  logout:
    "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3l3-3m0 0l-3-3m3 3H9",
  add: "M12 4.5c.414 0 .75.336.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6c0-.414.336-.75.75-.75z",
  search:
    "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  options:
    "M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z",
  trash:
    "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
};

// --- Main Dashboard Component ---
const Dashboard = () => {
  const { user, logout } = useAuth();

  // --- State for API data ---
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [watchlist, setWatchlist] = useState([]); // Assuming a future /watchlist endpoint
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State for UI ---
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  const [fetchedTabs, setFetchedTabs] = useState({
    dashboard: false,
    watchlist: false,
    history: false,
  });

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const handleApiError = () => {
    alert("An error occurred. Reloading data to ensure consistency.");
    // This reset allows the useEffect hooks to re-fetch data if needed.
    setFetchedTabs({ dashboard: false, watchlist: false, history: false });
  };

  // --- State for Modal Form ---
  const [newProductName, setNewProductName] = useState("");
  const [newProductUrl, setNewProductUrl] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");

  useEffect(() => {
    // We only proceed if a user is logged in.
    if (user && !fetchedTabs[activeTab]) {
      setLoading(true);
      setError(null);

      const fetchDataForTab = async () => {
        try {
          if (activeTab === "dashboard") {
            const response = await api.get("/products/my?status=tracking");
            setTrackedProducts(response.data);
          } else if (activeTab === "watchlist") {
            const response = await api.get("/products/my?status=saved");
            setWatchlist(response.data);
          } else if (activeTab === "history") {
            // ✨ NEW
            const response = await api.get("/products/my?status=purchased");
            setPurchaseHistory(response.data);
          }
          // Mark this tab as fetched to prevent re-fetching.
          setFetchedTabs((prev) => ({ ...prev, [activeTab]: true }));
        } catch (err) {
          console.error(`Failed to fetch data for ${activeTab}:`, err);
          setError(`Could not load your items. Please try again later.`);
        } finally {
          setLoading(false);
        }
      };

      fetchDataForTab();
    }
    // The dependencies are simplified. The hook only needs to re-run when the
    // user logs in OR when the active tab changes.
  }, [user, activeTab, fetchedTabs]); // Re-run effect if the user object changes

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null); // Close the menu if click is outside
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Form Submission for New Product ---
  const handleTrackNewProduct = async (e) => {
    e.preventDefault();
    try {
      if (!newProductName || !newProductUrl || !newProductPrice) {
        alert("Please fill in all fields.");
        return;
      }

      const productData = {
        name: newProductName,
        url: newProductUrl,
        desired_price: parseFloat(newProductPrice),
        // The backend will scrape for name, store, etc.
      };

      const response = await api.post("/products/add", productData);
      const newProduct = response.data;
      setTrackedProducts((prevProducts) => [newProduct, ...prevProducts]);

      // Close modal and refresh the product list
      setShowModal(false);
      setNewProductName("");
      setNewProductUrl("");
      setNewProductPrice("");
    } catch (err) {
      console.error("Failed to add product:", err);
      alert(
        err.response?.data?.detail ||
          "Failed to add product. Please check the URL and try again."
      );
    }
  };

  const handleStartTracking = async (productId) => {
    setLoading(true);
    try {
      // ✨ 1. Update the product status in the database
      await api.patch(`/products/${productId}`, { status: "tracking" });

      // ✨ 2. Invalidate both lists to trigger a refetch from the server
      setFetchedTabs({ dashboard: false, watchlist: false, history: false });
    } catch (err) {
      console.error("Failed to start tracking product:", err);
      alert("Could not start tracking the product. Please try again.");
      setLoading(false);
    }
  };

  const handleSaveForLater = async (productId) => {
    setLoading(true);
    setOpenMenuId(null);

    try {
      // Make the API call to update the backend
      await api.patch(`/products/${productId}`, { status: "saved" });
      setFetchedTabs({ dashboard: false, watchlist: false, history: false });
    } catch (err) {
      console.error("Failed to save product for later:", err);
      alert("Could not save product. Please try again.");
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return; // Guard clause

    try {
      await api.delete(`/products/${productToDelete}`);

      // Instant UI update: filter the product out of the state
      setTrackedProducts((prev) =>
        prev.filter((p) => p.id !== productToDelete)
      );
      setPurchaseHistory((prev) =>
        prev.filter((p) => p.id !== productToDelete)
      );
      setWatchlist((prev) => prev.filter((p) => p.id !== productToDelete));

      // Close the confirmation modal
      setProductToDelete(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert(
        err.response?.data?.detail ||
          "Failed to delete product. Please try again."
      );
      // Also close the modal on error
      setProductToDelete(null);
    }
  };

  const getStatusPill = (product) => {
    // This logic assumes your backend adds a `current_price` field after scraping
    const currentPrice = product.current_price || 0;
    const desiredPrice = product.desired_price || 0;

    if (product.status === "purchased") {
      // Assuming you have a status field
      return (
        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
          Purchased
        </span>
      );
    }
    if (currentPrice > 0 && currentPrice <= desiredPrice) {
      return (
        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
          Price Alert!
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
        Tracking
      </span>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center text-gray-500">
          Loading your products...
        </div>
      );
    }
    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }
    if (activeTab === "dashboard") {
      if (trackedProducts.length === 0) {
        return (
          <div className="text-center text-gray-500">
            You are not tracking any products yet. Click "Track New Product" to
            get started!
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trackedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col justify-between transition hover:shadow-lg"
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={
                      product.image_url ||
                      "https://placehold.co/100x100/F3E8FF/4C1D95?text=Image"
                    }
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 leading-tight">
                      {product.name || "Product Name"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.store || "Store"}
                    </p>
                  </div>
                  <div
                    className="relative"
                    ref={openMenuId === product.id ? menuRef : null}
                  >
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === product.id ? null : product.id
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                    >
                      <Icon path={icons.options} className="w-5 h-5" />
                    </button>
                    {openMenuId === product.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100">
                        <div className="py-1">
                          <button
                            onClick={() => handleSaveForLater(product.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Save for later?
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(product.id); // Set ID for modal
                              setOpenMenuId(null); // Close the options menu
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete Product
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-baseline">
                  <div>
                    <p className="text-sm text-gray-500">Current Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{(product.current_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Desired</p>
                    <p className="text-lg font-semibold text-gray-600">
                      ₹{(product.desired_price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                {getStatusPill(product)}
                <div className="flex gap-2">
                  <button className="text-xs text-gray-500 hover:text-purple-700 hover:underline">
                    Mark as Purchased
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    // Placeholder for Watchlist
    if (activeTab === "watchlist") {
      if (watchlist.length === 0) {
        return (
          <div className="text-center text-gray-500">
            <p>You haven't saved any products for later yet.</p>
            <p className="text-sm mt-1">
              Use the options menu on a product in your watchlist to save it
              here.
            </p>
          </div>
        );
      }
      return (
        // --- NEW CODE: This now maps over the live 'watchlist' state ---
        <div className="grid grid-cols-1 md-grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchlist.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col justify-between transition hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <img
                  src={
                    product.image_url ||
                    "https://placehold.co/100x100/E0E7FF/3730A3?text=Saved"
                  }
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 leading-tight">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500">{product.site_name}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Current Price:{" "}
                    <span className="font-medium text-gray-600">
                      ₹{(product.current_price || 0).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => handleStartTracking(product.id)}
                  className="flex-grow bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-purple-200 transition"
                >
                  Start Tracking
                </button>
                <button
                  onClick={() => setProductToDelete(product.id)}
                  title="Delete Product"
                  className="flex-shrink-0 p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full transition"
                >
                  <Icon path={icons.trash} className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (activeTab === "history") {
      if (purchaseHistory.length === 0) {
        return (
          <div className="text-center text-gray-500">
            <p>You have no purchase history yet.</p>
            <p className="text-sm mt-1">
              Mark a product as purchased to see it here.
            </p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {purchaseHistory.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={
                      product.image_url ||
                      "https://placehold.co/100x100/EBF4FF/1E40AF?text=Bought"
                    }
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 leading-tight">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">{product.store}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-baseline">
                  <div>
                    <p className="text-sm text-gray-500">Purchased at</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{(product.current_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-base font-semibold text-gray-600">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                {getStatusPill(product)}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* --- Sidebar --- */}
      <aside className="hidden md:flex md:w-64 flex-shrink-0 bg-white border-r border-gray-200 flex-col">
        <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-purple-700">
            EcomPriceTracker
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a
            href="#"
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors ${
              activeTab === "dashboard" ? "bg-purple-100 text-purple-700" : ""
            }`}
          >
            <Icon path={icons.dashboard} />
            <span className="ml-3">My Watchlist</span>
          </a>
          <a
            href="#"
            onClick={() => setActiveTab("watchlist")}
            className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors ${
              activeTab === "watchlist" ? "bg-purple-100 text-purple-700" : ""
            }`}
          >
            <Icon path={icons.watchlist} />
            <span className="ml-3">Saved for Later</span>
          </a>
        </nav>
        <div
          className="relative px-4 py-4 border-t border-gray-200"
          ref={profileMenuRef}
        >
          {isProfileMenuOpen && (
            <div className="absolute left-4 right-4 bottom-full mb-2 w-auto bg-white rounded-md shadow-lg z-20 border border-gray-100">
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab("history");
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-700"
                >
                  <Icon path={icons.watchlist} className="w-5 h-5 mr-3" />
                  Purchase History
                </button>
                <button
                  onClick={() => {
                    logout();
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Icon path={icons.logout} className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon path={icons.user} className="w-6 h-6 text-gray-500" />
            <span className="ml-3 font-semibold truncate">
              {user?.username || "My Account"}
            </span>
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome back!</h2>
            <p className="text-gray-500">
              Here's your product tracking overview.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Icon
                path={icons.search}
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-800 transition"
            >
              <Icon path={icons.add} className="w-5 h-5" />
              Track New Product
            </button>
          </div>
        </header>

        {/* Content Area */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          {activeTab === "dashboard"
            ? `My Watchlist (${trackedProducts.length})`
            : activeTab === "watchlist"
            ? `Saved for Later (${watchlist.length})`
            : `Purchase History (${purchaseHistory.length})`}
        </h3>
        {renderContent()}
      </main>

      {/* --- Track New Product Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Track a New Product
            </h3>
            <form onSubmit={handleTrackNewProduct}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g., Sony WH-1000XM5 Headphones"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={newProductUrl}
                  onChange={(e) => setNewProductUrl(e.target.value)}
                  placeholder="https://www.amazon.com/product/..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Desired Price (₹)
                </label>
                <input
                  type="number"
                  id="price"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  placeholder="Enter a price to be notified at"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete this product? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
