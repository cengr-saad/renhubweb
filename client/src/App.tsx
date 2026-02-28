import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import HomePage from "@/pages/HomePage";
import ListingDetailPage from "@/pages/ListingDetailPage";
import PostRentalPage from "@/pages/PostRentalPage";
import EditListingPage from "@/pages/EditListingPage";
import InboxPage from "@/pages/InboxPage";
import ChatPage from "@/pages/ChatPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import OrdersPage from "@/pages/OrdersPage";
import SearchPage from "@/pages/SearchPage";
import FavoritesPage from "@/pages/FavoritesPage";
import OrderDetailsPage from "@/pages/OrderDetailsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import NotificationsPage from "@/pages/NotificationsPage";
import MapSearchPage from "@/pages/MapSearchPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import PricingPage from "@/pages/PricingPage";
import AboutPage from "@/pages/AboutPage";
import DownloadPage from "@/pages/DownloadPage";
import UnderDevelopmentPage from "@/pages/UnderDevelopmentPage";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 overflow-hidden">
          <img src="/assets/logo-white.png" alt="L" className="h-8 w-8 object-contain" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto mb-2" />
        <p className="text-gray-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

// Requires auth — redirects to login if not signed in
function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!session) return <Redirect to="/login" />;
  return <Component />;
}

// Auth pages — redirects to /home if already signed in
function AuthRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (session) return <Redirect to="/home" />;
  return <Component />;
}

// Root route: landing for guests, home for authenticated users
function RootRoute() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (session) return <Redirect to="/home" />;
  return <LandingPage />;
}

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        {/* Public info routes */}
        <Route path="/">
          <LandingPage />
        </Route>
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/pricing" component={PricingPage} />

        {/* Redirect everything else to Landing */}
        <Route path="/home">
          <Redirect to="/" />
        </Route>
        <Route path="/login">
          <Redirect to="/" />
        </Route>
        <Route path="/register">
          <Redirect to="/" />
        </Route>
        <Route path="/search">
          <Redirect to="/" />
        </Route>
        <Route path="/listing/:id">
          <Redirect to="/" />
        </Route>
        <Route path="/post">
          <Redirect to="/" />
        </Route>
        <Route path="/profile">
          <Redirect to="/" />
        </Route>
        <Route path="/settings">
          <Redirect to="/" />
        </Route>
        <Route path="/orders">
          <Redirect to="/" />
        </Route>
        <Route path="/favorites">
          <Redirect to="/" />
        </Route>
        <Route path="/notifications">
          <Redirect to="/" />
        </Route>
        <Route path="/map-search">
          <Redirect to="/" />
        </Route>

        {/* Marketing Pages */}
        <Route path="/about" component={AboutPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/download" component={DownloadPage} />

        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
