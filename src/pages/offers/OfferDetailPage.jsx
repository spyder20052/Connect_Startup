import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Badge, LoadingSpinner, Alert, Input, Textarea } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';
import { formatDate, formatDistanceToNow, fr } from '../../utils/dateUtils';

export default function OfferDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [offer, setOffer] = useState(null);
    const [creator, setCreator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        pitch: '',
        experience: '',
        motivation: '',
        contactEmail: user?.email || '',
        contactPhone: ''
    });

    useEffect(() => {
        loadData();
        incrementViews();
    }, [id]);

    const loadData = async () => {
        try {
            const offerData = await db.getDoc('offers', id);
            if (!offerData) {
                navigate('/offers');
                return;
            }
            setOffer(offerData);

            // Load creator info
            const users = await db.getCollection('users');
            const creatorUser = users.find(u => u.uid === offerData.creatorId);
            setCreator(creatorUser);

            // Check if saved
            if (user.role === 'startuper') {
                const savedOffers = await db.getSavedOffers(user.uid);
                setIsSaved(savedOffers.some(o => o.id === id));

                // Check if already applied
                const candidacies = await db.getCollection('candidacies');
                const existingApp = candidacies.find(
                    c => c.offerId === id && c.userId === user.uid
                );
                setHasApplied(!!existingApp);
            }
        } catch (error) {
            console.error('Error loading offer:', error);
        } finally {
            setLoading(false);
        }
    };

    const incrementViews = async () => {
        try {
            await db.updateDoc('offers', id, {
                views: (offer?.views || 0) + 1
            });
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    };

    const handleSaveToggle = async () => {
        try {
            if (isSaved) {
                await db.unsaveOffer(user.uid, id);
                setIsSaved(false);
            } else {
                await db.saveOffer(user.uid, id);
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const handleSubmitApplication = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const startup = await db.getDoc('startups', user.startupId);

            await db.addDoc('candidacies', {
                offerId: id,
                offerTitle: offer.title,
                startupId: user.startupId,
                startupName: startup.name,
                userId: user.uid,
                status: 'pending',
                submittedAt: Date.now(),
                formData: formData
            });

            // Update applications count
            await db.updateDoc('offers', id, {
                applications: (offer.applications || 0) + 1
            });

            setSuccess(true);
            setHasApplied(true);
            setShowApplicationForm(false);

            // Reload offer data
            setTimeout(() => {
                loadData();
            }, 1000);
        } catch (error) {
            console.error('Error submitting application:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="max-w-4xl mx-auto mt-20">
                <Alert type="error">Opportunité non trouvée</Alert>
            </div>
        );
    }

    const isExpired = offer.deadline < Date.now();
    const canApply = user.role === 'startuper' && user.startupId && !hasApplied && !isExpired;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/offers')}
                className="flex items-center gap-2 text-gray-600 hover:text-theme transition"
            >
                <Icon name="ChevronLeft" size={20} />
                <span className="font-medium">Retour aux opportunités</span>
            </button>

            {/* Success Alert */}
            {success && (
                <Alert type="success">
                    Votre candidature a été envoyée avec succès ! Vous serez notifié de la réponse.
                </Alert>
            )}

            {/* Header Card */}
            <Card>
                <div className="space-y-4">
                    {/* Title & Type */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge color={offer.type === 'event' ? 'purple' : 'theme'}>
                                    {offer.type === 'event' ? 'Événement' : 'Appel à projets'}
                                </Badge>
                                <Badge color="gray">{offer.sector}</Badge>
                                {isExpired && <Badge color="red">Expiré</Badge>}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{offer.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Icon name="User" size={14} />
                                    {offer.creatorName}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Icon name="Calendar" size={14} />
                                    Publié {formatDistanceToNow(offer.createdAt, { addSuffix: true, locale: fr })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Icon name="Eye" size={14} />
                                    {offer.views || 0} vues
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {user.role === 'startuper' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSaveToggle}
                                >
                                    <Icon name={isSaved ? 'Heart' : 'Bookmark'} size={16} className={isSaved ? 'fill-current text-red-500' : ''} />
                                    {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
                                </Button>
                            )}
                            <Button variant="outline" size="sm">
                                <Icon name="Share" size={16} />
                                Partager
                            </Button>
                        </div>
                    </div>

                    {/* Deadline */}
                    {offer.deadline && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${isExpired ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                            <Icon name="Calendar" size={18} />
                            <span className="font-medium">
                                {isExpired ? 'Expiré le' : 'Date limite :'} {formatDate(offer.deadline)}
                            </span>
                        </div>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Icon name="FileText" className="text-theme" />
                            Description
                        </h2>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {offer.description}
                        </p>
                    </Card>

                    {/* Additional Details */}
                    {(offer.requirements || offer.benefits) && (
                        <Card>
                            <h2 className="text-xl font-bold mb-4">Détails supplémentaires</h2>

                            {offer.requirements && (
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Critères d'éligibilité</h3>
                                    <p className="text-gray-700">{offer.requirements}</p>
                                </div>
                            )}

                            {offer.benefits && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Avantages</h3>
                                    <p className="text-gray-700">{offer.benefits}</p>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Application Form */}
                    {canApply && !showApplicationForm && (
                        <Card className="bg-theme-light border-2 border-theme">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Postuler à cette opportunité
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Soumettez votre candidature et mettez en avant votre projet
                                </p>
                                <Button onClick={() => setShowApplicationForm(true)} size="lg">
                                    <Icon name="Send" size={18} />
                                    Commencer ma candidature
                                </Button>
                            </div>
                        </Card>
                    )}

                    {hasApplied && (
                        <Card className="bg-green-50 border-2 border-green-200">
                            <div className="flex items-start gap-3">
                                <Icon name="CheckCircle" size={24} className="text-green-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-green-900 mb-1">Candidature envoyée</h3>
                                    <p className="text-green-700 text-sm">
                                        Vous avez déjà postulé à cette opportunité. Vous serez notifié de la réponse.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Application Form */}
                    {showApplicationForm && (
                        <Card>
                            <h2 className="text-xl font-bold mb-4">Formulaire de candidature</h2>
                            <form onSubmit={handleSubmitApplication} className="space-y-4">
                                <Textarea
                                    label="Pitch de votre projet *"
                                    placeholder="Présentez votre startup et votre projet en quelques lignes..."
                                    value={formData.pitch}
                                    onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
                                    rows={4}
                                    required
                                />

                                <Textarea
                                    label="Expérience et réalisations"
                                    placeholder="Parlez de votre parcours et de vos réalisations..."
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    rows={3}
                                />

                                <Textarea
                                    label="Motivation *"
                                    placeholder="Pourquoi cette opportunité vous intéresse-t-elle ?"
                                    value={formData.motivation}
                                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                                    rows={3}
                                    required
                                />

                                <Input
                                    label="Email de contact *"
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    required
                                />

                                <Input
                                    label="Téléphone de contact"
                                    type="tel"
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                />

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={submitting || !formData.pitch || !formData.motivation}
                                        className="flex-1"
                                    >
                                        {submitting ? <LoadingSpinner size="sm" /> : <>
                                            <Icon name="Send" size={16} />
                                            Envoyer ma candidature
                                        </>}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowApplicationForm(false)}
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Info */}
                    <Card>
                        <h3 className="font-bold mb-4">Informations</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <Icon name="Building2" size={16} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-gray-500">Organisateur</p>
                                    <p className="font-semibold">{offer.creatorName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Icon name="Briefcase" size={16} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-gray-500">Secteur</p>
                                    <p className="font-semibold">{offer.sector}</p>
                                </div>
                            </div>

                            {offer.location && (
                                <div className="flex items-start gap-2">
                                    <Icon name="MapPin" size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-500">Localisation</p>
                                        <p className="font-semibold">{offer.location}</p>
                                    </div>
                                </div>
                            )}

                            {offer.budget && (
                                <div className="flex items-start gap-2">
                                    <Icon name="TrendingUp" size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-500">Budget</p>
                                        <p className="font-semibold">{offer.budget}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Stats */}
                    <Card className="bg-gray-50">
                        <h3 className="font-bold mb-4">Statistiques</h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-theme">{offer.views || 0}</p>
                                <p className="text-xs text-gray-500">Vues</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{offer.applications || 0}</p>
                                <p className="text-xs text-gray-500">Candidatures</p>
                            </div>
                        </div>
                    </Card>

                    {/* Contact */}
                    {offer.contactEmail && (
                        <Card>
                            <h3 className="font-bold mb-4">Contact</h3>
                            <div className="space-y-2 text-sm">
                                {offer.contactEmail && (
                                    <a href={`mailto:${offer.contactEmail}`} className="flex items-center gap-2 text-theme hover:underline">
                                        <Icon name="Mail" size={16} />
                                        {offer.contactEmail}
                                    </a>
                                )}
                                {offer.contactPhone && (
                                    <a href={`tel:${offer.contactPhone}`} className="flex items-center gap-2 text-theme hover:underline">
                                        <Icon name="Phone" size={16} />
                                        {offer.contactPhone}
                                    </a>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* External Link */}
                    {offer.externalFormUrl && (
                        <Card className="bg-blue-50">
                            <h3 className="font-bold mb-2">Candidature externe</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Cette opportunité nécessite une candidature via un formulaire externe.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.open(offer.externalFormUrl, '_blank')}
                            >
                                <Icon name="Globe" size={16} />
                                Accéder au formulaire
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
