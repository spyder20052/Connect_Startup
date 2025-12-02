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

// Messages Page
import MessagesPage from './pages/messages/MessagesPage';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

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

// Placeholder pages (to be implemented)
function AdminPage() {
    return (
        <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Administration</h1>
            <p className="text-gray-600">Page en cours de développement</p>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

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
