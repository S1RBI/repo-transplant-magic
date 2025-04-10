
import React, { useEffect } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import Chatbot from '@/components/Chatbot';
import Header from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthPage from '@/pages/AuthPage';
import Index from '@/pages/Index';
import CalendarPage from '@/pages/CalendarPage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import StatsPage from '@/pages/StatsPage';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";

function App() {
  // Set security-related meta tags dynamically
  useEffect(() => {
    // Set Content Security Policy
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co https://static.cloudflareinsights.com; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline';";
    document.head.appendChild(cspMeta);
    
    // Set X-Frame-Options
    const xfoMeta = document.createElement('meta');
    xfoMeta.httpEquiv = 'X-Frame-Options';
    xfoMeta.content = 'DENY';
    document.head.appendChild(xfoMeta);
    
    // Set X-Content-Type-Options
    const xctoMeta = document.createElement('meta');
    xctoMeta.httpEquiv = 'X-Content-Type-Options';
    xctoMeta.content = 'nosniff';
    document.head.appendChild(xctoMeta);
    
    // Set Referrer-Policy
    const referrerMeta = document.createElement('meta');
    referrerMeta.name = 'referrer';
    referrerMeta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerMeta);
    
    // Remove Cloudflare script if it exists to avoid integrity errors
    const scripts = document.querySelectorAll('script[src*="cloudflareinsights.com"]');
    scripts.forEach(script => {
      script.parentNode?.removeChild(script);
    });
    
    return () => {
      document.head.removeChild(cspMeta);
      document.head.removeChild(xfoMeta);
      document.head.removeChild(xctoMeta);
      document.head.removeChild(referrerMeta);
    };
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/*"
              element={
                <>
                  <Header />
                  <div className="content-container">
                    <Routes>
                      <Route path="/home" element={<Index />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/events/:id" element={<EventDetailPage />} />
                      <Route path="/stats" element={<StatsPage />} />
                      <Route path="/profile" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Chatbot />
                  <Toaster />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
