import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSignupMutation } from "../features/auth/authApi"; 

import { type SignupForm, defaultSignupForm } from "../interfaces/auth";

export const useSignup = () => {
  const navigate = useNavigate();

  const [signupForm, setSignupForm] = useState<SignupForm>(defaultSignupForm);
  
  const [signup, { isLoading, error }] = useSignupMutation();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        nickname: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
      }

      await signup(data).unwrap(); 

      alert('Signup successful! Please log in.');
      navigate("/login"); 
      
    } catch (err) {
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
    onSignupSubmit: handleSignupSubmit, 
    isLoading,
    error,
  };
};