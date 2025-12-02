import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Alert } from '../../components/ui';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-theme-light to-white">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-theme rounded-full mb-4">
                            <span className="text-2xl font-bold text-white">S</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Startup<span className="text-theme">Connect</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-2">Plateforme de l'écosystème béninois</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert type="error" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <Input
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-2 rounded" />
                                <span className="text-gray-600">Se souvenir de moi</span>
                            </label>
                            <Link to="/reset-password" className="text-theme hover:text-theme-hover">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </form>

                    {/* Test Accounts */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Comptes de test :</p>
                        <div className="space-y-1 text-xs text-gray-600">
                            <p>• admin@adpme.bj (Admin)</p>
                            <p>• invest@partner.com (Partenaire)</p>
                            <p>• ceo@matech.com (Startuper)</p>
                        </div>
                    </div>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="text-theme hover:text-theme-hover font-semibold">
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
