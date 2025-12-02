import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Badge, EmptyState, LoadingSpinner, Input, Select } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';
import { formatDistanceToNow, fr } from '../../utils/dateUtils';

export default function OffersPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [offers, setOffers] = useState([]);
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedOffers, setSavedOffers] = useState([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedSector, setSelectedSector] = useState('all');
    const [showOnlySaved, setShowOnlySaved] = useState(false);

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [offers, searchQuery, selectedType, selectedSector, showOnlySaved, savedOffers]);

    const loadData = async () => {
        try {
            const allOffers = await db.getCollection('offers');

            // Sort by creation date (newest first)
            const sortedOffers = allOffers.sort((a, b) => b.createdAt - a.createdAt);
            setOffers(sortedOffers);

            // Load saved offers for current user
            if (user.role === 'startuper') {
                const saved = await db.getSavedOffers(user.uid);
                setSavedOffers(saved.map(s => s.offerId));
            }
        } catch (error) {
            console.error('Error loading offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...offers];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(offer =>
                offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                offer.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Type filter
        if (selectedType !== 'all') {
            filtered = filtered.filter(offer => offer.type === selectedType);
        }

        // Sector filter
        if (selectedSector !== 'all') {
            filtered = filtered.filter(offer => offer.sector === selectedSector);
        }

        // Saved offers filter
        if (showOnlySaved) {
            filtered = filtered.filter(offer => savedOffers.includes(offer.id));
        }

        setFilteredOffers(filtered);
    };

    const handleSaveOffer = async (offerId) => {
        try {
            if (savedOffers.includes(offerId)) {
                await db.unsaveOffer(user.uid, offerId);
                setSavedOffers(savedOffers.filter(id => id !== offerId));
            } else {
                await db.saveOffer(user.uid, offerId);
                setSavedOffers([...savedOffers, offerId]);
            }
        } catch (error) {
            console.error('Error saving offer:', error);
        }
    };

    const handleViewOffer = (offerId) => {
        navigate(`/offers/${offerId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const sectors = ['Tech', 'Agri', 'Finance', 'Santé', 'Éducation', 'Commerce'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Opportunités</h1>
                    <p className="text-gray-500 mt-1">
                        {filteredOffers.length} opportunité{filteredOffers.length > 1 ? 's' : ''} disponible{filteredOffers.length > 1 ? 's' : ''}
                    </p>
                </div>

                {(user.role === 'partner' || user.role === 'admin') && (
                    <Link to="/offers/create">
                        <Button size="lg">
                            <Icon name="PlusCircle" size={18} />
                            Publier une opportunité
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une opportunité..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Type Filter */}
                    <Select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="all">Tous les types</option>
                        <option value="offer">Appels à projets</option>
                        <option value="event">Événements</option>
                    </Select>

                    {/* Sector Filter */}
                    <Select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                    >
                        <option value="all">Tous les secteurs</option>
                        {sectors.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                        ))}
                    </Select>
                </div>

                {/* Additional Filters */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                    {user.role === 'startuper' && (
                        <button
                            onClick={() => setShowOnlySaved(!showOnlySaved)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${showOnlySaved
                                    ? 'bg-theme text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Icon name="Bookmark" size={14} className="inline mr-1" />
                            Sauvegardées ({savedOffers.length})
                        </button>
                    )}

                    {(searchQuery || selectedType !== 'all' || selectedSector !== 'all' || showOnlySaved) && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedType('all');
                                setSelectedSector('all');
                                setShowOnlySaved(false);
                            }}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            <Icon name="X" size={14} className="inline mr-1" />
                            Réinitialiser
                        </button>
                    )}
                </div>
            </Card>

            {/* Offers Grid */}
            {filteredOffers.length === 0 ? (
                <EmptyState
                    icon={<Icon name="Briefcase" size={48} />}
                    title="Aucune opportunité trouvée"
                    description={
                        searchQuery || selectedType !== 'all' || selectedSector !== 'all'
                            ? "Essayez de modifier vos filtres"
                            : "Les nouvelles opportunités apparaîtront ici"
                    }
                    action={
                        (user.role === 'partner' || user.role === 'admin') && (
                            <Link to="/offers/create">
                                <Button>
                                    <Icon name="PlusCircle" size={16} />
                                    Publier une opportunité
                                </Button>
                            </Link>
                        )
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOffers.map(offer => (
                        <Card
                            key={offer.id}
                            className="flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer group"
                            onClick={() => handleViewOffer(offer.id)}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge color={offer.type === 'offer' ? 'theme' : 'yellow'}>
                                        {offer.type === 'offer' ? 'Appel' : 'Événement'}
                                    </Badge>
                                    <Badge color="gray">{offer.sector}</Badge>
                                </div>

                                {user.role === 'startuper' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveOffer(offer.id);
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        <Icon
                                            name={savedOffers.includes(offer.id) ? 'Heart' : 'Heart'}
                                            size={18}
                                            className={savedOffers.includes(offer.id) ? 'text-red-500 fill-current' : 'text-gray-400'}
                                        />
                                    </button>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-theme transition line-clamp-2">
                                {offer.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
                                {offer.description}
                            </p>

                            {/* Footer */}
                            <div className="pt-4 border-t border-gray-100 space-y-2">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Icon name="User" size={12} />
                                        <span className="truncate">{offer.creatorName}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Icon name="Eye" size={12} />
                                            {offer.views || 0}
                                        </span>
                                        {offer.applications && (
                                            <span className="flex items-center gap-1">
                                                <Icon name="FileText" size={12} />
                                                {offer.applications}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(offer.createdAt, { addSuffix: true, locale: fr })}
                                    </span>

                                    {offer.deadline && (
                                        <span className={`text-xs font-medium ${offer.deadline < Date.now() ? 'text-red-500' : 'text-green-600'
                                            }`}>
                                            {offer.deadline < Date.now() ? 'Expiré' : 'Actif'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Load More (if needed in the future) */}
            {filteredOffers.length > 0 && filteredOffers.length % 12 === 0 && (
                <div className="text-center">
                    <Button variant="outline">
                        Charger plus d'opportunités
                    </Button>
                </div>
            )}
        </div>
    );
}
