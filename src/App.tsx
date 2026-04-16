import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ShopPage from "./pages/ShopPage";
import DetailPage from "./pages/DetailPage";
import ShoppingPage from "./pages/ShoppingBag";
import Messaging from "./pages/Messaging";
import Notifications from "./pages/Notifications";
import WishList from "./pages/WishList";
import Contact from "./pages/Contact";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SellPage from "./pages/SellPage";
import CategoriesManagement from "./pages/admin/CategoriesManagement";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";

// Context
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:pid" element={<DetailPage />} />
              <Route path="/shopping-bag" element={<ShoppingPage />} />
              <Route path="/messaging" element={<Messaging />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/wish-list" element={<WishList />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/sell" element={<SellPage />} />

              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<CategoriesManagement />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
