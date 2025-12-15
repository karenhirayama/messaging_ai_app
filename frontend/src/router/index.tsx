import { createBrowserRouter, redirect } from "react-router-dom"; 

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
    children: [
      {
        index: true,
        element: <Home />,
        loader: protectedLoader,
      },
      {
        path: "conversation/:conversationId",
        element: <Conversation />,
        loader: protectedLoader,
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
