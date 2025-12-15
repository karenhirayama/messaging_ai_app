import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { type SignupForm, defaultSignupForm } from "../interfaces/auth";
import { useSignupMutation } from "../features/auth/authApi"; // Import the RTK Query hook

export const useSignup = () => {
  const navigate = useNavigate();

  const [signupForm, setSignupForm] = useState<SignupForm>(defaultSignupForm);
  
  // 1. Initialize the RTK Query mutation hook
  const [signup, { isLoading, error }] = useSignupMutation();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 2. Add the submission handler
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        username: signupForm.username,
        nickname: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
      }
      // Call the signup mutation with the form data
      await signup(data).unwrap(); 

      // 3. Navigate to the login page on successful signup
      alert('Signup successful! Please log in.');
      navigate("/login"); 
      
    } catch (err) {
      // Handle failed signup (e.g., display error message based on err object)
      console.error("Failed to sign up:", err);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return {
    signupForm,
    onFormChange: handleFormChange,
    onLogin: handleLogin,
    onSignupSubmit: handleSignupSubmit, // Export the new submit handler
    isLoading, // Export loading state for the button
    error, // Export error state for displaying messages
  };
};