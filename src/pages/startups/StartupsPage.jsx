import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Badge, EmptyState, LoadingSpinner, Input, Select } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';

export default function StartupsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [startups, setStartups] = useState([]);
    const [filteredStartups, setFilteredStartups] = useState([]);
    const [loading, setLoading] = useState(true);

    // View mode
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSector, setSelectedSector] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [showOnlyVerified, setShowOnlyVerified] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [startups, searchQuery, selectedSector, selectedLocation, showOnlyVerified]);

    const loadData = async () => {
        try {
            const allStartups = await db.getCollection('startups');

            // Sort by creation date (newest first)
            const sortedStartups = allStartups.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setStartups(sortedStartups);
        } catch (error) {
            console.error('Error loading startups:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...startups];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(startup =>
                startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (startup.description && startup.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                startup.sector.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sector filter
        if (selectedSector !== 'all') {
            filtered = filtered.filter(startup => startup.sector === selectedSector);
        }

        // Location filter
        if (selectedLocation !== 'all') {
            filtered = filtered.filter(startup => startup.location === selectedLocation);
        }

        // Verified filter
        if (showOnlyVerified) {
            filtered = filtered.filter(startup => startup.verified);
        }

        setFilteredStartups(filtered);
    };

    const handleViewStartup = (startupId) => {
        navigate(`/startups/${startupId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const sectors = ['Tech', 'Agri', 'Finance', 'Santé', 'Éducation', 'Commerce'];
    const locations = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Annuaire des Startups</h1>
                    <p className="text-gray-500 mt-1">
                        {filteredStartups.length} startup{filteredStartups.length > 1 ? 's' : ''} dans l'écosystème
                    </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'grid'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Icon name="LayoutGrid" size={16} className="inline mr-1" />
                        Grille
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'list'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Icon name="List" size={16} className="inline mr-1" />
                        Liste
                    </button>
                </div>
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
                                placeholder="Rechercher une startup..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
                            />
                        </div>
                    </div>

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

                    {/* Location Filter */}
                    <Select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                        <option value="all">Toutes les villes</option>
                        {locations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </Select>
                </div>

                {/* Additional Filters */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => setShowOnlyVerified(!showOnlyVerified)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${showOnlyVerified
                                ? 'bg-theme text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Icon name="CheckCircle" size={14} className="inline mr-1" />
                        Vérifiées uniquement
                    </button>

                    {(searchQuery || selectedSector !== 'all' || selectedLocation !== 'all' || showOnlyVerified) && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedSector('all');
                                setSelectedLocation('all');
                                setShowOnlyVerified(false);
                            }}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            <Icon name="X" size={14} className="inline mr-1" />
                            Réinitialiser
                        </button>
                    )}
                </div>
            </Card>

            {/* Startups Display */}
            {filteredStartups.length === 0 ? (
                <EmptyState
                    icon={<Icon name="Building2" size={48} />}
                    title="Aucune startup trouvée"
                    description={
                        searchQuery || selectedSector !== 'all' || selectedLocation !== 'all'
                            ? "Essayez de modifier vos filtres"
                            : "Les startups apparaîtront ici"
                    }
                />
            ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStartups.map(startup => (
                        <Card
                            key={startup.id}
                            className="flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
                            onClick={() => handleViewStartup(startup.id)}
                        >
                            {/* Cover Image */}
                            <div className="h-32 bg-gradient-to-br from-theme to-theme-hover relative">
                                <div className="absolute -bottom-8 left-4 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
                                    <span className="text-2xl font-bold text-theme">
                                        {startup.name[0]}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pt-10 px-4 pb-4 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-theme transition line-clamp-1">
                                        {startup.name}
                                    </h3>
                                    {startup.verified && (
                                        <Icon name="CheckCircle" size={18} className="text-blue-500 flex-shrink-0" />
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <Badge color="theme">{startup.sector}</Badge>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Icon name="MapPin" size={12} />
                                        {startup.location}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
                                    {startup.description || 'Aucune description disponible'}
                                </p>

                                {/* Footer */}
                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Icon name="Users" size={12} />
                                        {startup.members?.length || 0} membre{(startup.members?.length || 0) > 1 ? 's' : ''}
                                    </span>
                                    {startup.rccm && (
                                        <span className="font-mono text-[10px]">
                                            {startup.rccm}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="space-y-4">
                    {filteredStartups.map(startup => (
                        <Card
                            key={startup.id}
                            className="hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => handleViewStartup(startup.id)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Logo */}
                                <div className="w-16 h-16 bg-theme-light rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl font-bold text-theme">
                                        {startup.name[0]}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-gray-900 hover:text-theme transition">
                                                {startup.name}
                                            </h3>
                                            {startup.verified && (
                                                <Icon name="CheckCircle" size={18} className="text-blue-500" />
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewStartup(startup.id);
                                        }}>
                                            Voir le profil
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge color="theme">{startup.sector}</Badge>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Icon name="MapPin" size={14} />
                                            {startup.location}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Icon name="Users" size={14} />
                                            {startup.members?.length || 0} membre{(startup.members?.length || 0) > 1 ? 's' : ''}
                                        </span>
                                        {startup.rccm && (
                                            <span className="text-xs text-gray-400 font-mono">
                                                RCCM: {startup.rccm}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {startup.description || 'Aucune description disponible'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Stats Footer */}
            {filteredStartups.length > 0 && (
                <Card className="bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-theme">{filteredStartups.length}</p>
                            <p className="text-xs text-gray-500">Startups</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">
                                {filteredStartups.filter(s => s.verified).length}
                            </p>
                            <p className="text-xs text-gray-500">Vérifiées</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                {[...new Set(filteredStartups.map(s => s.sector))].length}
                            </p>
                            <p className="text-xs text-gray-500">Secteurs</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">
                                {filteredStartups.reduce((sum, s) => sum + (s.members?.length || 0), 0)}
                            </p>
                            <p className="text-xs text-gray-500">Membres</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
