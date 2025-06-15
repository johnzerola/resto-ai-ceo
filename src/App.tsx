import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";

import { Home } from "./pages/Home";
import { Pricing } from "./pages/Pricing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Logout } from "./pages/Logout";
import { Settings } from "./pages/Settings";
import { Restaurant } from "./pages/Restaurant";
import { Restaurants } from "./pages/Restaurants";
import { Integracoes } from "./pages/Integracoes";
import { Subscription } from "./pages/Subscription";
import { Dashboard } from "./pages/Dashboard";
import { SystemMonitoring } from "@/pages/SystemMonitoring";

import { AuthLayout } from "./layouts/AuthLayout";
import { MainLayout } from "./layouts/MainLayout";
import { RestaurantLayout } from "./layouts/RestaurantLayout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/logout" element={<Logout />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/settings" element={<Settings />} />
        <Route path="/integracoes" element={<Integracoes />} />
        <Route path="/assinatura" element={<Subscription />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/system-monitoring" element={<SystemMonitoring />} />
      </Route>

      <Route element={<RestaurantLayout />}>
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:id" element={<Restaurant />} />
      </Route>
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
