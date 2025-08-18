// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/api"; // Import the pre-configured axios instance
import MobileNavPanel from "../components/MobileNavPanel";

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
  hamburger: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
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
  history:
    "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  sun: "M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.59a.75.75 0 11-1.06-1.06l1.59-1.59a.75.75 0 011.06 0zm-11.457 0a.75.75 0 011.06 0l1.59 1.59a.75.75 0 01-1.06 1.06l-1.59-1.59a.75.75 0 010-1.06zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V18.75a.75.75 0 01.75-.75zM5.106 18.894a.75.75 0 010-1.06l1.59-1.59a.75.75 0 111.06 1.06l-1.59 1.59a.75.75 0 01-1.06 0zM18.894 18.894a.75.75 0 01-1.06 0l-1.59-1.59a.75.75 0 011.06-1.06l1.59 1.59a.75.75 0 010 1.06zM3.75 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75zM17.25 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75z",
  moon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
  trash:
    "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
};

// --- Main Dashboard Component ---
const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

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
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

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

  const handleMarkAsPurchased = async (product) => {
    try {
      // 1. Optimistically find the product to move
      const productToMove = trackedProducts.find((p) => p.id === product.id);
      if (!productToMove) return;

      // 2. Update the UI instantly for a snappy user experience
      setTrackedProducts((prev) => prev.filter((p) => p.id !== product.id));
      setPurchaseHistory((prev) => [
        { ...productToMove, status: "purchased" },
        ...prev,
      ]);

      // 3. Invalidate the history tab cache so it refetches next time
      setFetchedTabs((prev) => ({ ...prev, history: false }));

      // 4. Send the request to the backend to persist the change
      await api.patch(`/products/${product.id}`, { status: "purchased" });
    } catch (err) {
      console.error("Failed to mark product as purchased:", err);
      alert("Could not update the product. Please try again.");
      // If the API call fails, revert the optimistic UI update to maintain consistency
      setFetchedTabs({ dashboard: false, watchlist: false, history: false });
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
      await api.delete(`/products/${productToDelete.id}`);

      // Instant UI update: filter the product out of the state
      setTrackedProducts((prev) =>
        prev.filter((p) => p.id !== productToDelete.id)
      );
      setPurchaseHistory((prev) =>
        prev.filter((p) => p.id !== productToDelete.id)
      );
      setWatchlist((prev) => prev.filter((p) => p.id !== productToDelete.id));
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
        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50 rounded-full">
          Purchased
        </span>
      );
    }
    if (currentPrice > 0 && currentPrice <= desiredPrice) {
      return (
        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/50 rounded-full">
          Price Alert!
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50 rounded-full">
        Tracking
      </span>
    );
  };

  const getStoreDisplayName = (product) => {
    // Check if site_name is valid and not the placeholder "N/A"
    if (product.site_name && product.site_name !== "N/A") {
      return product.site_name;
    }
    // Fallback to "Store" if site_name is missing or a placeholder
    return "Store";
  };

  const getFilteredList = (list) => {
    const trimmedQuery = debouncedQuery.trim().toLowerCase();
    if (!trimmedQuery) {
      return list;
    }
    return list.filter((product) =>
      product.name.toLowerCase().includes(trimmedQuery)
    );
  };

  const filteredTrackedProducts = getFilteredList(trackedProducts);
  const filteredWatchlist = getFilteredList(watchlist);
  const filteredPurchaseHistory = getFilteredList(purchaseHistory);

  const renderSearchResultsList = () => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    // Don't show anything if the query is empty
    if (!trimmedQuery) {
      return (
        <div className="text-center text-gray-400 p-8">
          Start typing to search your products.
        </div>
      );
    }

    // Combine all products from different tabs into one array
    const allProducts = [...trackedProducts, ...watchlist, ...purchaseHistory];
    // Create a unique list of products by ID, in case an item exists in multiple lists
    const uniqueProducts = Array.from(
      new Map(allProducts.map((item) => [item["id"], item])).values()
    );
    // Filter the unique list based on the search query
    const searchResults = uniqueProducts.filter((product) =>
      product.name.toLowerCase().includes(trimmedQuery)
    );

    if (searchResults.length === 0) {
      return (
        <div className="text-center text-gray-400 p-8">
          No products found for "{searchQuery}".
        </div>
      );
    }

    return (
      <div className="p-2 space-y-2">
        {searchResults.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            onClick={() => {
              setIsSearchOpen(false); // Close overlay on selection
              setSearchQuery(""); // Clear search query
            }}
            className="flex items-center gap-3 p-2 w-full bg-white dark:bg-slate-700/50 rounded-lg transition hover:bg-purple-50 dark:hover:bg-slate-600"
          >
            <img
              src={
                product.image_url ||
                "https://placehold.co/100x100/F3E8FF/4C1D95?text=Img"
              }
              alt={product.name}
              className="w-12 h-12 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                {product.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getStoreDisplayName(product)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading your products...
        </div>
      );
    }
    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }
    if (activeTab === "dashboard") {
      if (filteredTrackedProducts.length === 0) {
        if (debouncedQuery.trim()) {
          return (
            <div className="text-center text-gray-500">
              No products found. Please check your spelling or try a different
              search term.
            </div>
          );
        }
        return (
          <div className="text-center text-gray-500">
            You are not tracking any products yet. Click "Track New Product" to
            get started!
          </div>
        );
      }
      return (
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start p-1 pr-2">
           {" "}
          {filteredTrackedProducts.map((product) => (
            // MODIFIED -> Wrap the card div with a Link component
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="block"
            >
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col justify-between transition hover:shadow-lg h-full">
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
                      <p className="font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                        {product.name || "Product Name"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getStoreDisplayName(product)}
                      </p>
                    </div>
                    <div
                      className="relative"
                      ref={openMenuId === product.id ? menuRef : null}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === product.id ? null : product.id
                          );
                        }}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full"
                      >
                        <Icon path={icons.options} className="w-5 h-5" />
                      </button>
                      {openMenuId === product.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-md shadow-lg z-10 border border-gray-100 dark:border-slate-700">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSaveForLater(product.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                              Save for later?
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setProductToDelete(product);
                                setOpenMenuId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50"
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Current Price
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        ₹{(product.current_price || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Desired
                      </p>
                      <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                        ₹{(product.desired_price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                  {getStatusPill(product)}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMarkAsPurchased(product);
                      }}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-400 hover:underline"
                    >
                      Mark as Purchased
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      );
    }
    // Placeholder for Watchlist
    if (activeTab === "watchlist") {
      if (filteredWatchlist.length === 0) {
        if (debouncedQuery.trim()) {
          return (
            <div className="text-center text-gray-500">
              {" "}
              No products found...{" "}
            </div>
          );
        }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 md:flex-none min-h-0 overflow-y-auto md:overflow-visible pr-2 content-start">
           {" "}
          {filteredWatchlist.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col justify-between transition hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                {/* ... image ... */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getStoreDisplayName(product)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Current Price:{" "}
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      ₹{(product.current_price || 0).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center gap-2">
                <button
                  onClick={() => handleStartTracking(product.id)}
                  className="flex-grow bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 font-semibold py-2 px-4 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/80 transition"
                >
                  Start Tracking
                </button>
                <button
                  onClick={() => setProductToDelete(product)}
                  title="Delete Product"
                  className="flex-shrink-0 p-2 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-500 rounded-full transition"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 md:flex-none min-h-0 overflow-y-auto md:overflow-visible pr-2 content-start">
           {" "}
          {purchaseHistory.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col justify-between transition hover:shadow-lg"
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
                    <p className="font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getStoreDisplayName(product)}
                    </p>
                  </div>
                  <button
                    onClick={() => setProductToDelete(product)}
                    title="Delete Product"
                    className="flex-shrink-0 p-2 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-500 rounded-full transition"
                  >
                    <Icon path={icons.trash} className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex justify-between items-baseline">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Purchased at
                    </p>
                    {/* ✅ Added dark mode text color */}
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                      ₹{(product.current_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Purchased on
                    </p>
                    {/* ✅ Added dark mode text color */}
                    <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                      {new Date(
                        product.purchased_date || product.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                {getStatusPill(product)}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 font-sans">
      <MobileNavPanel
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        setActiveTab={setActiveTab}
        logout={logout}
        activeTab={activeTab}
        Icon={Icon}
        icons={icons}
      />
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
        <button
          onClick={() => setIsNavOpen(true)}
          className="text-gray-700 dark:text-gray-300"
          aria-label="Open navigation menu"
        >
          <Icon path={icons.hamburger} className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-purple-700 dark:text-purple-400">
          EcomPriceTracker
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-gray-700 dark:text-gray-300"
            aria-label="Search products"
          >
            <Icon path={icons.search} className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 bg-purple-700 dark:bg-purple-600 text-white rounded-full"
            aria-label="Track new product"
          >
            <Icon path={icons.add} className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* --- Sidebar --- */}
      <aside className="hidden md:flex md:w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex-col">
        <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
            EcomPriceTracker
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a
            href="#"
            onClick={() => setActiveTab("dashboard")}
            className={`group flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === "dashboard"
                ? "bg-purple-100 text-purple-700 dark:bg-slate-700 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-slate-700 hover:text-purple-700 dark:hover:text-gray-100"
            }`}
          >
            <Icon
              path={icons.dashboard}
              className={`w-6 h-6 transition-colors ${
                activeTab === "dashboard"
                  ? "text-purple-700 dark:text-gray-100" // Active state colors
                  : "text-gray-500 dark:text-gray-400 group-hover:text-purple-700 dark:group-hover:text-gray-100" // Inactive + hover state colors
              }`}
            />
            <span className="ml-3">My Watchlist</span>
          </a>
          <a
            href="#"
            onClick={() => setActiveTab("watchlist")}
            className={`group flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === "watchlist"
                ? "bg-purple-100 text-purple-700 dark:bg-slate-700 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-slate-700 hover:text-purple-700 dark:hover:text-gray-100"
            }`}
          >
            <Icon
              path={icons.watchlist}
              className={`w-6 h-6 transition-colors ${
                activeTab === "watchlist"
                  ? "text-purple-700 dark:text-gray-100" // Active state colors
                  : "text-gray-500 dark:text-gray-400 group-hover:text-purple-700 dark:group-hover:text-gray-100" // Inactive + hover state colors
              }`}
            />
            <span className="ml-3">Saved for Later</span>
          </a>
        </nav>
        <div
          className="relative px-4 py-4 border-t border-gray-200 dark:border-slate-700"
          ref={profileMenuRef}
        >
          {isProfileMenuOpen && (
            <div className="absolute left-4 right-4 bottom-full mb-2 w-auto bg-white dark:bg-slate-900 rounded-md shadow-lg z-20 border border-gray-100 dark:border-slate-700">
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab("history");
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-slate-700 hover:text-purple-700 dark:hover:text-gray-100"
                >
                  <Icon path={icons.history} className="w-5 h-5 mr-3" />
                  Purchase History
                </button>
                <button
                  onClick={() => {
                    logout();
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50"
                >
                  <Icon path={icons.logout} className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Icon
              path={icons.user}
              className="w-6 h-6 text-gray-500 dark:text-gray-400"
            />
            <span className="ml-3 font-semibold truncate">
              {user?.username || "My Account"}
            </span>
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex flex-col flex-1 overflow-hidden p-4 pt-6 md:p-8 md:pt-8 md:overflow-y-auto">
        <header className="hidden md:flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Welcome back!
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Here's your product tracking overview.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Icon
                path={icons.search}
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border dark:border-slate-600 rounded-lg w-64 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition"
            >
              {theme === "light" ? (
                <Icon path={icons.moon} className="w-5 h-5" />
              ) : (
                <Icon path={icons.sun} className="w-5 h-5 text-yellow-500" />
              )}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-purple-700 dark:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-800 dark:hover:bg-purple-700 transition"
            >
              <Icon path={icons.add} className="w-5 h-5" />
              Track New Product
            </button>
          </div>
        </header>

        {/* Content Area */}
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {activeTab === "dashboard"
            ? `My Watchlist (${filteredTrackedProducts.length})`
            : activeTab === "watchlist"
            ? `Saved for Later (${filteredWatchlist.length})`
            : `Purchase History (${filteredPurchaseHistory.length})`}
        </h3>
        {renderContent()}
      </main>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-sm md:hidden">
          <div className="bg-white dark:bg-slate-800 h-full flex flex-col">
            {/* Search Input Header */}
            <div className="flex items-center gap-2 p-4 border-b dark:border-slate-700">
              <Icon
                path={icons.search}
                className="w-5 h-5 text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all products..."
                className="flex-grow bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-500 dark:text-gray-400"
                aria-label="Close search"
              >
                Close
              </button>
            </div>
            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {renderSearchResultsList()}
            </div>
          </div>
        </div>
      )}

      {/* --- Track New Product Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md mx-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Track a New Product
            </h3>
            <form onSubmit={handleTrackNewProduct}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g., Sony WH-1000XM5 Headphones"
                  className="w-full px-4 py-2 border dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="w-full px-4 py-2 border dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="w-full px-4 py-2 border dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 dark:bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-800 dark:hover:bg-purple-700"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md mx-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete '{productToDelete.name}'? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition"
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
