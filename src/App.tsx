
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Outlet,
} from "react-router-dom";

import Index from "./pages/Index";
import { AssinaturaCompleta as Pricing } from "./pages/AssinaturaCompleta";
import Login from "./pages/Login";
import { Register } from "./pages/Register";
import { Integracoes } from "./pages/Integracoes";
import { AssinaturaCompleta as Subscription } from "./pages/AssinaturaCompleta";
import { Dashboard } from "./pages/Dashboard";
import { SystemMonitoring } from "@/pages/SystemMonitoring";

// For now, using Dashboard for missing pages until they're created
const Settings = Dashboard;
const Restaurant = Dashboard;
const Restaurants = Dashboard;
const ForgotPassword = Login;
const ResetPassword = Login;
const Logout = Login;

// Simple layout components
const AuthLayout = () => <Outlet />;
const MainLayout = () => <Outlet />;
const RestaurantLayout = () => <Outlet />;

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Index />} />
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
