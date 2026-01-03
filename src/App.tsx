import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { GlobalLoader } from "@/components/GlobalLoader";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";
import { PageTransition } from "@/components/PageTransition";
import { createQueryClient } from "@/lib/queryConfig";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Collections from "./pages/Collections";
import About from "./pages/About";
import Account from "./pages/Account";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCollections from "./pages/admin/AdminCollections";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminHeroSlides from "./pages/admin/AdminHeroSlides";
import AdminEditorialGrid from "./pages/admin/AdminEditorialGrid";
import AdminReturns from "./pages/admin/AdminReturns";
import AdminShippingSettings from "./pages/admin/AdminShippingSettings";
import AdminPromotionalEmails from "./pages/admin/AdminPromotionalEmails";
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsConditions from "./pages/legal/TermsConditions";
import RefundPolicy from "./pages/legal/RefundPolicy";
import Contact from "./pages/legal/Contact";

const queryClient = createQueryClient();

const AppContent = () => {
  const { isLoading } = useGlobalLoader();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      <GlobalLoader isLoading={isLoading} />
      {isAdminRoute ? (
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="hero-slides" element={<AdminHeroSlides />} />
            <Route path="editorial-grid" element={<AdminEditorialGrid />} />
            <Route path="returns" element={<AdminReturns />} />
            <Route path="email-templates" element={<AdminEmailTemplates />} />
            <Route path="promotional-emails" element={<AdminPromotionalEmails />} />
            <Route path="settings" element={<AdminShippingSettings />} />
          </Route>
        </Routes>
      ) : (
        <PageTransition>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/about" element={<About />} />
            <Route path="/account" element={<Account />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/order/:orderNumber" element={<OrderTracking />} />
            
            {/* Legal Pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/contact" element={<Contact />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
