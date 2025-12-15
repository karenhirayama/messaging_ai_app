import { createBrowserRouter, redirect } from "react-router-dom"; // 1. Import 'redirect'

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Conversation from "../pages/Conversation";

import Layout from "../components/Layout";

import { isAuthenticated } from "../utils/auth";

const protectedLoader = async () => {
  if (!isAuthenticated()) {
    return redirect("/login");
  }

  return null;
};

const publicLoader = async () => {
  if (isAuthenticated()) {
    return redirect("/");
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: protectedLoader,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "conversation/:conversationId",
        element: <Conversation />,
      },
      {
        path: "login",
        index: false,
        element: <Login />,
        loader: publicLoader,
      },
      {
        path: "signup",
        index: false,
        element: <Signup />,
        loader: publicLoader,
      },
    ],
  },
]);

export default router;
