// src/components/Signup.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/Authcontext";

const Signup = () => {
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState(""); // For client-side errors
  const { signup, error: authError } = useAuth(); // 👈 Get signup function and any auth errors

  // --- FORM SUBMISSION HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLocalError(""); // Reset local errors
    

    // 1. Check if passwords match
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return; // Stop the submission
    }

    // 2. Call the signup function from the context
    await signup(email, password);
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 md:px-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-purple-700">
            EcomPriceTracker
          </h1>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold">Create an account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please fill in the details below
          </p>

          {/* 👇 Attach the submit handler to the form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Email address</label>
              <input
                type="email"
                value={email} // 👈 Bind value to state
                onChange={(e) => setEmail(e.target.value)} // 👈 Update state on change
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="you@example.com"
                required // 👈 Add required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password} // 👈 Bind value to state
                onChange={(e) => setPassword(e.target.value)} // 👈 Update state on change
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Create a password (min 6 chars)"
                required // 👈 Add required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword} // 👈 Bind value to state
                onChange={(e) => setConfirmPassword(e.target.value)} // 👈 Update state on change
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Re-enter password"
                required // 👈 Add required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800 transition"
            >
              Sign up
            </button>
            
            {/* 👇 Display errors from either client-side validation or the backend */}
            {(localError || authError) && (
              <p className="text-red-500 text-sm text-center mt-2">{localError || authError}</p>
            )}

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

          <p className="text-sm text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 hover:underline">
              Log in
            </Link>
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
