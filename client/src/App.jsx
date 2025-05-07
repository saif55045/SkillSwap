import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/ClientDashboard';
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';
import FreelancerVerificationPage from './pages/freelancer/FreelancerVerificationPage';
import ProjectDetails from './pages/client/ProjectDetails';
import ClientProjectDetails from './components/client/ClientProjectDetails';
import MessagesPage from './pages/messages/MessagesPage';
import ChatPage from './pages/messages/ChatPage';
import PublicFreelancerProfile from './components/public/PublicFreelancerProfile';
import FreelancerReviewsPage from './pages/reviews/FreelancerReviewsPage';
import ClientAnalytics from './pages/client/ClientAnalytics';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerificationPage from './pages/admin/AdminVerificationPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/freelancers/:id" element={<PublicFreelancerProfile />} />

            {/* Review Routes */}
            <Route path="/reviews/freelancers/:freelancerId" element={
              <ProtectedRoute allowedRoles={['client', 'freelancer']}>
                <FreelancerReviewsPage />
              </ProtectedRoute>
            } />

            {/* Messaging Routes */}
            <Route path="/messages" element={
              <ProtectedRoute allowedRoles={['client', 'freelancer']}>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/messages/:userId" element={
              <ProtectedRoute allowedRoles={['client', 'freelancer']}>
                <ChatPage />
              </ProtectedRoute>
            } />

            {/* Client Analytics Dashboard */}
            <Route path="/client/analytics" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientAnalytics />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/verification" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminVerificationPage />
              </ProtectedRoute>
            } />

            {/* Client Project Details - Specific route comes before the wildcard */}
            <Route path="/client/projects/:id" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientProjectDetails />
              </ProtectedRoute>
            } />

            {/* Protected Client Routes */}
            <Route path="/client/*" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            } />

            {/* Protected Freelancer Routes */}
            <Route path="/freelancer/verification" element={
              <ProtectedRoute allowedRoles={['freelancer']}>
                <FreelancerVerificationPage />
              </ProtectedRoute>
            } />
            <Route path="/freelancer/*" element={
              <ProtectedRoute allowedRoles={['freelancer']}>
                <FreelancerDashboard />
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
