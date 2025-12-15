import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { defaultLoginForm, type LoginForm } from "../interfaces/auth";

import { useLoginMutation } from "../features/auth/authApi";

export const useLogin = () => {
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState<LoginForm>(defaultLoginForm);
  const [login, { isLoading, error }] = useLoginMutation();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm).unwrap();

      navigate("/");
    } catch (err) {
      console.error("Failed to log in:", err);
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return {
    loginForm,
    onFormChange: handleFormChange,
    onLoginSubmit: handleLoginSubmit,
    onSignUp: handleSignUp,
    isLoading,
    error,
  };
};
