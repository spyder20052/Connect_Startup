import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Input, Select, Textarea, Alert } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';

export default function CreateOfferPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'offer',
        sector: 'Tech',
        deadline: '',
        requirements: '',
        benefits: '',
        contactEmail: user.email,
        contactPhone: '',
        location: 'Cotonou',
        budget: '',
        targetAudience: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const sectors = ['Tech', 'Agri', 'Finance', 'Santé', 'Éducation', 'Commerce'];
    const locations = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Autre'];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Le titre est requis';
        } else if (formData.title.length < 10) {
            newErrors.title = 'Le titre doit contenir au moins 10 caractères';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La description est requise';
        } else if (formData.description.length < 50) {
            newErrors.description = 'La description doit contenir au moins 50 caractères';
        }

        if (formData.deadline && new Date(formData.deadline) < new Date()) {
            newErrors.deadline = 'La date limite doit être dans le futur';
        }

        if (!formData.contactEmail.trim()) {
            newErrors.contactEmail = 'L\'email de contact est requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const newOffer = {
                ...formData,
                creatorId: user.uid,
                creatorName: user.companyName || user.displayName,
                createdAt: Date.now(),
                deadline: formData.deadline ? new Date(formData.deadline).getTime() : null,
                views: 0,
                applications: 0,
                status: 'active'
            };

            await db.addDoc('offers', newOffer);

            setSuccess(true);

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/offers');
            }, 2000);

        } catch (error) {
            console.error('Error creating offer:', error);
            setErrors({ submit: 'Une erreur est survenue lors de la création de l\'opportunité' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        // Clear error for this field
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    if (user.role !== 'partner' && user.role !== 'admin') {
        return (
            <div className="max-w-2xl mx-auto">
                <Alert type="error">
                    Vous n'avez pas les permissions nécessaires pour publier une opportunité.
                </Alert>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/offers')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <Icon name="ChevronLeft" size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Publier une opportunité</h1>
                    <p className="text-gray-500 mt-1">Créez une nouvelle offre pour les startups</p>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <Alert type="success">
                    Opportunité créée avec succès ! Redirection en cours...
                </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Icon name="FileText" className="text-theme" />
                        Informations de base
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Type d'opportunité"
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                required
                            >
                                <option value="offer">Appel à projets</option>
                                <option value="event">Événement</option>
                            </Select>

                            <Select
                                label="Secteur cible"
                                value={formData.sector}
                                onChange={(e) => handleChange('sector', e.target.value)}
                                required
                            >
                                {sectors.map(sector => (
                                    <option key={sector} value={sector}>{sector}</option>
                                ))}
                            </Select>
                        </div>

                        <Input
                            label="Titre de l'opportunité"
                            placeholder="Ex: Programme d'accélération Tech 2025"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            error={errors.title}
                            required
                        />

                        <Textarea
                            label="Description détaillée"
                            placeholder="Décrivez l'opportunité, les objectifs, le contexte..."
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            error={errors.description}
                            rows={6}
                            required
                        />

                        <Textarea
                            label="Critères d'éligibilité"
                            placeholder="Quels sont les critères pour postuler ?"
                            value={formData.requirements}
                            onChange={(e) => handleChange('requirements', e.target.value)}
                            rows={4}
                        />

                        <Textarea
                            label="Avantages offerts"
                            placeholder="Financement, mentorat, formation, etc."
                            value={formData.benefits}
                            onChange={(e) => handleChange('benefits', e.target.value)}
                            rows={4}
                        />
                    </div>
                </Card>

                {/* Details */}
                <Card>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Icon name="Calendar" className="text-theme" />
                        Détails pratiques
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Date limite de candidature"
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => handleChange('deadline', e.target.value)}
                            error={errors.deadline}
                            min={new Date().toISOString().split('T')[0]}
                        />

                        <Select
                            label="Localisation"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                        >
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </Select>

                        <Input
                            label="Budget / Montant (optionnel)"
                            placeholder="Ex: 10 000 000 FCFA"
                            value={formData.budget}
                            onChange={(e) => handleChange('budget', e.target.value)}
                        />

                        <Input
                            label="Public cible"
                            placeholder="Ex: Startups en phase seed"
                            value={formData.targetAudience}
                            onChange={(e) => handleChange('targetAudience', e.target.value)}
                        />
                    </div>
                </Card>

                {/* Contact Information */}
                <Card>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Icon name="Mail" className="text-theme" />
                        Informations de contact
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Email de contact"
                            type="email"
                            placeholder="contact@exemple.com"
                            value={formData.contactEmail}
                            onChange={(e) => handleChange('contactEmail', e.target.value)}
                            error={errors.contactEmail}
                            required
                        />

                        <Input
                            label="Téléphone (optionnel)"
                            type="tel"
                            placeholder="+229 XX XX XX XX"
                            value={formData.contactPhone}
                            onChange={(e) => handleChange('contactPhone', e.target.value)}
                        />
                    </div>
                </Card>

                {/* Error Message */}
                {errors.submit && (
                    <Alert type="error">
                        {errors.submit}
                    </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-4 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/offers')}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                    >
                        {loading ? 'Publication...' : 'Publier l\'opportunité'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
