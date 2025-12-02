import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Select, Alert } from '../../components/ui';
import { db } from '../../services/fakeDB';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, login } = useAuth();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        role: 'startuper',
        // Startuper fields
        startupChoice: 'new', // 'existing' or 'new'
        existingStartupId: '',
        startupName: '',
        sector: 'Tech',
        location: 'Cotonou',
        rccm: '',
        rccmFile: null,
        jobTitle: 'CEO', // Default role
        isFounder: false,
        // Partner fields
        companyName: '',
        companyType: 'incubateur'
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const handleSearchStartup = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        const startups = await db.getCollection('startups');
        const results = startups.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.sector.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Step 1: Basic info validation
        if (step === 1) {
            if (formData.password.length < 8) {
                setError('Le mot de passe doit contenir au moins 8 caractères');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Les mots de passe ne correspondent pas');
                return;
            }
            setStep(2);
            return;
        }

        // Step 2: Role-specific info
        if (step === 2) {
            if (formData.role === 'startuper' && formData.startupChoice === 'new') {
                if (!formData.startupName || !formData.rccm) {
                    setError('Veuillez remplir tous les champs obligatoires');
                    return;
                }

                if (!db.validateRCCM(formData.rccm)) {
                    setError('Format RCCM invalide. Format attendu: RB/VILLE/ANNÉE/LETTRE/NUMÉRO (ex: RB/COT/2024/A/001)');
                    return;
                }
            }

            setLoading(true);

            try {
                let startupId = null;

                // Create startup if needed
                if (formData.role === 'startuper' && formData.startupChoice === 'new') {
                    const startup = await db.addDoc('startups', {
                        name: formData.startupName,
                        sector: formData.sector,
                        location: formData.location,
                        rccm: formData.rccm,
                        rccmPdf: 'uploaded-' + Date.now() + '.pdf',
                        members: [],
                        description: '',
                        verified: false,
                        createdAt: Date.now()
                    });
                    startupId = startup.id;
                } else if (formData.role === 'startuper' && formData.startupChoice === 'existing') {
                    startupId = formData.existingStartupId;

                    // Create join request
                    await db.addDoc('joinRequests', {
                        userId: 'pending',
                        startupId: startupId,
                        status: 'pending',
                        createdAt: Date.now()
                    });
                }

                // Register user
                const profile = {
                    email: formData.email,
                    password: formData.password,
                    displayName: formData.displayName,
                    role: formData.role,
                    startupId: startupId,
                    sector: formData.sector,
                    jobTitle: formData.role === 'startuper' ? formData.jobTitle : undefined,
                    isFounder: formData.role === 'startuper' ? formData.isFounder : undefined,
                    companyName: formData.role === 'partner' ? formData.companyName : undefined,
                    companyType: formData.role === 'partner' ? formData.companyType : undefined
                };

                await register(profile);

                // Auto-login after registration (no email verification needed)
                await login(formData.email, formData.password);

                // Redirect to home
                navigate('/');

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-theme-light to-white">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-theme rounded-full mb-4">
                            <span className="text-2xl font-bold text-white">S</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Créer un compte
                        </h1>
                        <p className="text-gray-500 text-sm mt-2">
                            Étape {step} sur 2
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold ${step >= 1 ? 'text-theme' : 'text-gray-400'}`}>
                                Informations de base
                            </span>
                            <span className={`text-xs font-semibold ${step >= 2 ? 'text-theme' : 'text-gray-400'}`}>
                                Profil professionnel
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-theme transition-all duration-300"
                                style={{ width: `${(step / 2) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert type="error" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 && (
                            <>
                                <Input
                                    label="Nom complet"
                                    placeholder="Jean Dupont"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    required
                                />

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
                                    placeholder="Minimum 8 caractères"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />

                                <Input
                                    label="Confirmer le mot de passe"
                                    type="password"
                                    placeholder="Retapez votre mot de passe"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Je suis...
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { value: 'startuper', label: 'Startuper' },
                                            { value: 'partner', label: 'Partenaire' },
                                            { value: 'admin', label: 'Admin' }
                                        ].map(role => (
                                            <button
                                                key={role.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: role.value })}
                                                className={`py-3 px-4 text-sm font-bold uppercase rounded-lg border-2 transition ${formData.role === role.value
                                                    ? 'bg-theme text-white border-theme'
                                                    : 'bg-white text-gray-500 border-gray-300 hover:border-theme'
                                                    }`}
                                            >
                                                {role.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 2 && formData.role === 'startuper' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ma startup...
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, startupChoice: 'new' })}
                                            className={`py-3 px-4 text-sm font-semibold rounded-lg border-2 transition ${formData.startupChoice === 'new'
                                                ? 'bg-theme text-white border-theme'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-theme'
                                                }`}
                                        >
                                            Créer une nouvelle startup
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, startupChoice: 'existing' })}
                                            className={`py-3 px-4 text-sm font-semibold rounded-lg border-2 transition ${formData.startupChoice === 'existing'
                                                ? 'bg-theme text-white border-theme'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-theme'
                                                }`}
                                        >
                                            Rejoindre une startup existante
                                        </button>
                                    </div>
                                </div>

                                {formData.startupChoice === 'new' ? (
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                        <Input
                                            label="Nom de la startup"
                                            placeholder="MaTech"
                                            value={formData.startupName}
                                            onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                                            required
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Select
                                                label="Secteur"
                                                value={formData.sector}
                                                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                                required
                                            >
                                                <option value="Tech">Tech</option>
                                                <option value="Agri">Agri</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Santé">Santé</option>
                                                <option value="Éducation">Éducation</option>
                                                <option value="Commerce">Commerce</option>
                                            </Select>

                                            <Select
                                                label="Localisation"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                required
                                            >
                                                <option value="Cotonou">Cotonou</option>
                                                <option value="Porto-Novo">Porto-Novo</option>
                                                <option value="Parakou">Parakou</option>
                                                <option value="Abomey-Calavi">Abomey-Calavi</option>
                                            </Select>
                                        </div>

                                        <Input
                                            label="Numéro RCCM"
                                            placeholder="RB/COT/2024/A/001"
                                            value={formData.rccm}
                                            onChange={(e) => setFormData({ ...formData, rccm: e.target.value.toUpperCase() })}
                                            required
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Document RCCM (PDF)
                                            </label>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => setFormData({ ...formData, rccmFile: e.target.files[0] })}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-theme file:text-white hover:file:bg-theme-hover"
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <Input
                                            label="Rechercher une startup"
                                            placeholder="Nom ou secteur..."
                                            onChange={(e) => handleSearchStartup(e.target.value)}
                                        />

                                        {searchResults.length > 0 && (
                                            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                                                {searchResults.map(startup => (
                                                    <button
                                                        key={startup.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, existingStartupId: startup.id, sector: startup.sector });
                                                            setSearchResults([]);
                                                        }}
                                                        className={`w-full text-left p-3 rounded-lg border-2 transition ${formData.existingStartupId === startup.id
                                                            ? 'border-theme bg-theme-light'
                                                            : 'border-gray-200 hover:border-theme'
                                                            }`}
                                                    >
                                                        <p className="font-semibold">{startup.name}</p>
                                                        <p className="text-xs text-gray-500">{startup.sector} • {startup.location}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {formData.existingStartupId && (
                                            <Alert type="info" className="mt-3">
                                                Une demande d'adhésion sera envoyée aux membres actuels.
                                            </Alert>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {step === 2 && formData.role === 'partner' && (
                            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                <Input
                                    label="Nom de l'organisation"
                                    placeholder="Bénin Business Angels"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />

                                <Select
                                    label="Type d'organisation"
                                    value={formData.companyType}
                                    onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                                    required
                                >
                                    <option value="incubateur">Incubateur</option>
                                    <option value="investisseur">Investisseur</option>
                                    <option value="bailleur">Bailleur de fonds</option>
                                    <option value="accelerateur">Accélérateur</option>
                                </Select>
                            </div>
                        )}

                        {step === 2 && formData.role === 'admin' && (
                            <Alert type="info">
                                Les comptes administrateurs doivent être validés par l'ADPME.
                            </Alert>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-3 pt-4">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(step - 1)}
                                    className="flex-1"
                                >
                                    Retour
                                </Button>
                            )}

                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? 'Création...' : step === 2 ? 'Créer mon compte' : 'Continuer'}
                            </Button>
                        </div>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Déjà un compte ?{' '}
                            <Link to="/login" className="text-theme hover:text-theme-hover font-semibold">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
