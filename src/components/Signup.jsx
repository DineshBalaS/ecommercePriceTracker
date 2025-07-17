import React from "react";

const Signup = () => {
  return (
    <div className="flex h-screen font-sans">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 md:px-20">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-purple-700">EcomPriceTracker</h1>
        </div>

        {/* Signup Header */}
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold">Create an account</h2>
          <p className="text-sm text-gray-500 mb-6">Please fill in the details below</p>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email address</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Create a password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Re-enter password"
              />
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800 transition"
            >
              Sign up
            </button>

            {/* Google Signup */}
            <button
              type="button"
              className="w-full border flex justify-center items-center gap-2 py-2 rounded-md hover:bg-gray-100 transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
                className="w-5 h-5"
              />
              Sign up with Google
            </button>
          </form>

          {/* Already have an account? */}
          <p className="text-sm text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <a href="#" className="text-purple-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-purple-700 items-center justify-center">
        <img
          src="/illustration.png"
          alt="Illustration"
          className="w-3/4 max-w-md"
        />
      </div>
    </div>
  );
};

export default Signup;
