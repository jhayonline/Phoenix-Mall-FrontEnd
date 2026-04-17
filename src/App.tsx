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
import Messages from "./pages/Messaging";
import Notifications from "./pages/Notifications";
import Contact from "./pages/Contact";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SellPage from "./pages/SellPage";
import WishlistPage from "./pages/WishlistPage";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import SellerDashboard from "./pages/SellerDashboard";
import EditProduct from "./pages/EditProduct";
import MyListings from "./pages/MyListings";

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
              <Route path="/messaging" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/sell" element={<SellPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/edit-product/:pid" element={<EditProduct />} />
              <Route path="/my-listings" element={<MyListings />} />

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
