import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error } = useAuth(); // ✅ Correct usage

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password); // ✅ Let context handle everything
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 md:px-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-purple-700">
            EcomPriceTracker
          </h1>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please enter your details
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-purple-600" />
                Remember for 30 days
              </label>
              <a href="#" className="text-purple-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800 transition"
            >
              Sign in
            </button>
            {error && <p className="text-red-500">{error}</p>}

            <button
              type="button"
              className="w-full border flex justify-center items-center gap-2 py-2 rounded-md hover:bg-gray-100 transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
                className="w-5 h-5"
              />
              Sign in with Google
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-purple-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

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

export default Login;

