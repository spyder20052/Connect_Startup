import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Badge, EmptyState, LoadingSpinner } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';
import { formatDistanceToNow, fr } from '../../utils/dateUtils';

export default function StartuperHomePage() {
    const { user } = useAuth();
    const [startup, setStartup] = useState(null);
    const [offers, setOffers] = useState([]);
    const [candidacies, setCandidacies] = useState([]);
    const [savedOffers, setSavedOffers] = useState([]);
    const [groupMessages, setGroupMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            // Load startup info
            if (user.startupId) {
                const startupData = await db.getDoc('startups', user.startupId);
                setStartup(startupData);

                // Load offers matching startup sector
                const allOffers = await db.getCollection('offers');
                const sectorOffers = allOffers
                    .filter(o => o.sector === startupData.sector)
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 5);
                setOffers(sectorOffers);
            }

            // Load user's candidacies
            const allCandidacies = await db.getCollection('candidacies');
            const userCandidacies = allCandidacies
                .filter(c => c.userId === user.uid)
                .sort((a, b) => b.submittedAt - a.submittedAt)
                .slice(0, 5);
            setCandidacies(userCandidacies);

            // Load saved offers
            const saved = await db.getSavedOffers(user.uid);
            setSavedOffers(saved);

            // Load recent group messages
            const allMessages = await db.getCollection('messages');
            const allGroups = await db.getCollection('groups');
            const userGroups = allGroups.filter(g => g.members.includes(user.uid));
            const recentMessages = allMessages
                .filter(m => userGroups.some(g => g.id === m.groupId))
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 5);
            setGroupMessages(recentMessages);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const stats = {
        candidacies: candidacies.length,
        savedOffers: savedOffers.length,
        connections: startup?.members?.length || 0
    };

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-theme to-theme-hover rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Bienvenue, {user.displayName} !
                        </h1>
                        {startup && (
                            <div className="flex items-center gap-3 text-white/90">
                                <Icon name="Building2" size={20} />
                                <span className="text-lg font-semibold">{startup.name}</span>
                                {startup.verified && (
                                    <Icon name="CheckCircle" size={18} className="text-green-300" />
                                )}
                                <Badge color="gray" className="!bg-white/20 !text-white !border-white/30">
                                    {startup.sector}
                                </Badge>
                            </div>
                        )}
                    </div>
                    <Link to="/startups/profile">
                        <Button variant="outline" className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
                            <Icon name="User" size={16} />
                            Voir mon profil
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Candidatures</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.candidacies}</p>
                        </div>
                        <div className="w-12 h-12 bg-theme-light rounded-lg flex items-center justify-center">
                            <Icon name="FileText" size={24} className="text-theme" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Offres sauvegardées</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.savedOffers}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                            <Icon name="Bookmark" size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Membres équipe</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.connections}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Icon name="Users" size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Opportunities Feed */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Icon name="Briefcase" className="text-theme" />
                                Opportunités pour vous
                            </h2>
                            <Link to="/offers">
                                <Button variant="ghost" size="sm">
                                    Voir tout
                                    <Icon name="ChevronRight" size={14} />
                                </Button>
                            </Link>
                        </div>

                        {offers.length === 0 ? (
                            <EmptyState
                                icon={<Icon name="Briefcase" size={48} />}
                                title="Aucune opportunité disponible"
                                description="Les nouvelles opportunités apparaîtront ici"
                            />
                        ) : (
                            <div className="space-y-3">
                                {offers.map(offer => (
                                    <Link key={offer.id} to={`/offers/${offer.id}`}>
                                        <div className="p-4 border border-gray-200 rounded-lg hover:border-theme hover:shadow-sm transition cursor-pointer">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge color={offer.type === 'offer' ? 'theme' : 'yellow'}>
                                                        {offer.type === 'offer' ? 'Appel' : 'Événement'}
                                                    </Badge>
                                                    <Badge color="gray">{offer.sector}</Badge>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Icon name="Eye" size={12} />
                                                    {offer.views}
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">{offer.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{offer.description}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>{offer.creatorName}</span>
                                                <span className="flex items-center gap-1">
                                                    <Icon name="Calendar" size={12} />
                                                    {formatDistanceToNow(offer.createdAt, { addSuffix: true, locale: fr })}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Recent Applications */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Icon name="FileText" className="text-theme" />
                                Mes candidatures récentes
                            </h2>
                        </div>

                        {candidacies.length === 0 ? (
                            <EmptyState
                                icon={<Icon name="FileText" size={48} />}
                                title="Aucune candidature"
                                description="Postulez aux opportunités pour les voir ici"
                                action={
                                    <Link to="/offers">
                                        <Button size="sm">
                                            <Icon name="Search" size={14} />
                                            Explorer les opportunités
                                        </Button>
                                    </Link>
                                }
                            />
                        ) : (
                            <div className="space-y-2">
                                {candidacies.map(candidacy => (
                                    <div key={candidacy.id} className="p-3 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{candidacy.offerTitle}</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDistanceToNow(candidacy.submittedAt, { addSuffix: true, locale: fr })}
                                                </p>
                                            </div>
                                            <Badge color={
                                                candidacy.status === 'accepted' ? 'green' :
                                                    candidacy.status === 'rejected' ? 'red' : 'yellow'
                                            }>
                                                {candidacy.status === 'pending' ? 'En attente' :
                                                    candidacy.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Startup Profile Card */}
                    {startup && (
                        <Card>
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-theme-light rounded-full flex items-center justify-center text-2xl font-bold text-theme mb-3">
                                    {startup.name[0]}
                                </div>
                                <h3 className="font-bold text-lg">{startup.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{startup.sector} • {startup.location}</p>
                                <Link to="/startups/edit">
                                    <Button variant="outline" size="sm" className="w-full">
                                        Modifier le profil
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                        <h3 className="font-bold mb-3">Actions rapides</h3>
                        <div className="space-y-2">
                            <Link to="/offers">
                                <Button variant="outline" className="w-full justify-start">
                                    <Icon name="Search" size={16} />
                                    Explorer les opportunités
                                </Button>
                            </Link>
                            <Link to="/messages">
                                <Button variant="outline" className="w-full justify-start">
                                    <Icon name="MessageSquare" size={16} />
                                    Messagerie
                                </Button>
                            </Link>
                            <Link to="/startups">
                                <Button variant="outline" className="w-full justify-start">
                                    <Icon name="Building2" size={16} />
                                    Découvrir des startups
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Sector Group Activity */}
                    <Card>
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Icon name="MessageSquare" size={16} className="text-theme" />
                            Groupe {startup?.sector}
                        </h3>
                        {groupMessages.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucun message récent</p>
                        ) : (
                            <div className="space-y-3">
                                {groupMessages.slice(0, 3).map(msg => (
                                    <div key={msg.id} className="text-sm">
                                        <p className="font-semibold text-gray-900">{msg.senderName}</p>
                                        <p className="text-gray-600 line-clamp-2">{msg.text}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDistanceToNow(msg.createdAt, { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                ))}
                                <Link to="/messages">
                                    <Button variant="ghost" size="sm" className="w-full">
                                        Voir toutes les discussions
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
