import OAuthErrorPage from './pages/auth/OAuthErrorPage';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, GuardianRoute, PublicRoute } from './routes/ProtectedRoute';

// Layouts
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ResendVerificationPage } from './pages/auth/ResendVerificationPage';

// App pages
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { SearchPage } from './pages/SearchPage';
import EditProfile from './pages/EditProfile';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { HomeFeedPage } from './pages/HomeFeedPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChallengesExplorerPage } from './pages/challenges/ChallengesExplorerPage';
import { ChallengeDetailsPage } from './pages/challenges/ChallengeDetailsPage';
import { CreateChallengePage } from './pages/challenges/CreateChallengePage';
import { MessagingPage } from './pages/MessagingPage';

// Guardian pages
import { GuardianDashboard } from './pages/guardian/GuardianDashboard';
import { ChildActivityPage } from './pages/guardian/ChildActivityPage';
import { GuardianApprovePage } from './pages/guardian/GuardianApprovePage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';
import OnboardingPage from './pages/auth/onboarding';
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public Auth Routes ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/resend-verification" element={<ResendVerificationPage />} />
        </Route>
        {/* ── OAuth Error Route ── */}
        <Route path="/auth/error" element={<OAuthErrorPage />} />
        <Route path="/onboarding" element={<OnboardingPage/>}/>
        {/* ── Token-based routes (no layout) ── */}
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/guardian/approve/:token" element={<GuardianApprovePage />} />

        {/* ── Protected App Routes ── */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<HomeFeedPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/challenges" element={<ChallengesExplorerPage />} />
          <Route path="/challenges/create" element={<CreateChallengePage />} />
          <Route path="/challenges/:id" element={<ChallengeDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<PublicProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          
          {/* Guardian Routes */}
          <Route path="/guardian" element={<GuardianRoute><GuardianDashboard /></GuardianRoute>} />
          <Route path="/guardian/children/:childId/activity" element={<GuardianRoute><ChildActivityPage /></GuardianRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
        </Route>

        {/* ── Redirects ── */}
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="*" element={
          <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="text-center">
              <p className="font-display font-800 text-6xl text-spark-500 mb-4">404</p>
              <p className="text-gray-400 mb-6">Page not found</p>
              <a href="/feed" className="spark-btn-primary inline-flex">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}
