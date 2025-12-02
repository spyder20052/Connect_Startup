import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/ui';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Home Pages (Profile-specific)
import StartuperHomePage from './pages/home/StartuperHomePage';
import PartnerHomePage from './pages/home/PartnerHomePage';
import AdminHomePage from './pages/home/AdminHomePage';

// Offer Pages
import OffersPage from './pages/offers/OffersPage';
import CreateOfferPage from './pages/offers/CreateOfferPage';
import OfferDetailPage from './pages/offers/OfferDetailPage';

// Startup Pages
import StartupsPage from './pages/startups/StartupsPage';
import StartupDetailPage from './pages/startups/StartupDetailPage';
import ConnectionRequestsPage from './pages/startups/ConnectionRequestsPage';

// Messages Page
import MessagesPage from './pages/messages/MessagesPage';

// Admin Page
import AdminPage from './pages/admin/AdminPage';

// Protected Route Wrapper - Now allows public access for development
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Allow access even without user for development/testing
    // Routes are now publicly accessible
    return <MainLayout>{children}</MainLayout>;
}

// Home Page Router (redirects to role-specific home)
function HomePage() {
    const { user } = useAuth();

    if (user?.role === 'startuper') {
        return <StartuperHomePage />;
    } else if (user?.role === 'partner') {
        return <PartnerHomePage />;
    } else if (user?.role === 'admin') {
        return <AdminHomePage />;
    }

    return <StartuperHomePage />;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Shortcut routes for quick access to profile pages */}
                    <Route
                        path="/startup"
                        element={
                            <ProtectedRoute>
                                <StartuperHomePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/partner"
                        element={
                            <ProtectedRoute>
                                <PartnerHomePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/startups"
                        element={
                            <ProtectedRoute>
                                <StartupsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/startups/:id"
                        element={
                            <ProtectedRoute>
                                <StartupDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/connections"
                        element={
                            <ProtectedRoute>
                                <ConnectionRequestsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/offers"
                        element={
                            <ProtectedRoute>
                                <OffersPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/offers/create"
                        element={
                            <ProtectedRoute>
                                <CreateOfferPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/offers/:id"
                        element={
                            <ProtectedRoute>
                                <OfferDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/messages"
                        element={
                            <ProtectedRoute>
                                <MessagesPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
