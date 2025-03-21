
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Courses from '@/pages/Courses';
import VideoPlayer from '@/pages/VideoPlayer';
import NotFound from '@/pages/NotFound';
import { Navbar } from '@/components/Navbar';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import './App.css';
import { AuthProvider } from '@/context/AuthContext';
import { Login } from '@/pages/Login';
import { SignIn } from '@/pages/SignIn';
import { SignUp } from '@/pages/SignUp';
import ProtectedRoute from '@/components/ProtectedRoute';
import Account from '@/pages/Account';
import PremiumContent from '@/pages/PremiumContent';
import Pricing from '@/pages/Pricing';
import PlanProtectedRoute from '@/components/PlanProtectedRoute';

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/video/:id" element={<VideoPlayer />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/premium" element={<PremiumContent />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/feedback" 
                  element={
                    <PlanProtectedRoute requiredPlan="feedback">
                      <div className="container py-10">
                        <h1 className="text-2xl font-bold mb-4">フィードバックコンテンツ</h1>
                        <p>こちらはフィードバックプラン専用のコンテンツです。</p>
                      </div>
                    </PlanProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          <Toaster position="top-center" richColors />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
