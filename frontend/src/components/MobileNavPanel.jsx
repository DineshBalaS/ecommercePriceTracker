import React from "react";

const MobileNavPanel = ({
  isOpen,
  onClose,
  setActiveTab,
  logout,
  activeTab,
  Icon,
  icons,
}) => {
  const handleNavClick = (tabName) => {
    setActiveTab(tabName);
    onClose();
  };

  const handleLogoutClick = () => {
    logout();
    onClose();
  };

  // This outer div handles the visibility and fade-in/out of the whole overlay
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sliding Panel */}
      <div
        className={`relative flex flex-col w-64 h-full bg-white dark:bg-slate-800 shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
            EcomPriceTracker
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a
            href="#"
            onClick={() => handleNavClick("dashboard")}
            className={`group flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === "dashboard"
                ? "bg-purple-100 text-purple-700 dark:bg-slate-700 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-slate-700"
            }`}
          >
            <Icon path={icons.dashboard} />
            <span className="ml-3">My Watchlist</span>
          </a>
          <a
            href="#"
            onClick={() => handleNavClick("watchlist")}
            className={`group flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === "watchlist"
                ? "bg-purple-100 text-purple-700 dark:bg-slate-700 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-slate-700"
            }`}
          >
            <Icon path={icons.watchlist} />
            <span className="ml-3">Saved for Later</span>
          </a>
          <a
            href="#"
            onClick={() => handleNavClick("history")}
            className={`group flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === "history"
                ? "bg-purple-100 text-purple-700 dark:bg-slate-700 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-slate-700"
            }`}
          >
            <Icon path={icons.history} />
            <span className="ml-3">Purchase History</span>
          </a>
        </nav>

        {/* Footer actions */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleLogoutClick}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
          >
            <Icon path={icons.logout} className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileNavPanel;