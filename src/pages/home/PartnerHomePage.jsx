import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Badge, EmptyState, LoadingSpinner } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';
import { formatDistanceToNow, fr } from '../../utils/dateUtils';

export default function PartnerHomePage() {
    const { user } = useAuth();
    const [myOffers, setMyOffers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            // Load partner's published offers
            const allOffers = await db.getCollection('offers');
            const partnerOffers = allOffers
                .filter(o => o.creatorId === user.uid)
                .sort((a, b) => b.createdAt - a.createdAt);
            setMyOffers(partnerOffers);

            // Load applications to partner's offers
            const allCandidacies = await db.getCollection('candidacies');
            const offerIds = partnerOffers.map(o => o.id);
            const partnerApplications = allCandidacies
                .filter(c => offerIds.includes(c.offerId))
                .sort((a, b) => b.submittedAt - a.submittedAt)
                .slice(0, 10);
            setApplications(partnerApplications);

            // Load recommended startups (all for now, can be filtered by sector later)
            const allStartups = await db.getCollection('startups');
            setStartups(allStartups.slice(0, 6));

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
        totalOffers: myOffers.length,
        activeOffers: myOffers.filter(o => o.deadline > Date.now()).length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(a => a.status === 'pending').length,
        totalViews: myOffers.reduce((sum, o) => sum + (o.views || 0), 0),
        avgApplications: myOffers.length > 0 ? Math.round(applications.length / myOffers.length) : 0
    };

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Bienvenue, {user.companyName || user.displayName} !
                        </h1>
                        <p className="text-blue-100">
                            Gérez vos opportunités et connectez-vous avec les startups
                        </p>
                    </div>
                    <Link to="/offers/create">
                        <Button variant="outline" className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
                            <Icon name="PlusCircle" size={16} />
                            Publier une opportunité
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Offres actives</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeOffers}</p>
                            <p className="text-xs text-gray-400 mt-1">sur {stats.totalOffers} total</p>
                        </div>
                        <div className="w-12 h-12 bg-theme-light rounded-lg flex items-center justify-center">
                            <Icon name="Briefcase" size={24} className="text-theme" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Candidatures reçues</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
                            <p className="text-xs text-gray-400 mt-1">{stats.pendingApplications} en attente</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                            <Icon name="FileText" size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Vues totales</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalViews}</p>
                            <p className="text-xs text-gray-400 mt-1">sur toutes les offres</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Icon name="Eye" size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Taux de réponse</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgApplications}</p>
                            <p className="text-xs text-gray-400 mt-1">candidatures/offre</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <Icon name="TrendingUp" size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Published Offers */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Icon name="Briefcase" className="text-theme" />
                                Mes opportunités publiées
                            </h2>
                            <Link to="/offers/create">
                                <Button size="sm">
                                    <Icon name="PlusCircle" size={14} />
                                    Nouvelle offre
                                </Button>
                            </Link>
                        </div>

                        {myOffers.length === 0 ? (
                            <EmptyState
                                icon={<Icon name="Briefcase" size={48} />}
                                title="Aucune opportunité publiée"
                                description="Créez votre première offre pour attirer les startups"
                                action={
                                    <Link to="/offers/create">
                                        <Button>
                                            <Icon name="PlusCircle" size={16} />
                                            Publier une opportunité
                                        </Button>
                                    </Link>
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                {myOffers.slice(0, 5).map(offer => (
                                    <Link key={offer.id} to={`/offers/${offer.id}`}>
                                        <div className="p-4 border border-gray-200 rounded-lg hover:border-theme hover:shadow-sm transition">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge color={offer.type === 'offer' ? 'theme' : 'yellow'}>
                                                        {offer.type === 'offer' ? 'Appel' : 'Événement'}
                                                    </Badge>
                                                    <Badge color="gray">{offer.sector}</Badge>
                                                    {offer.deadline < Date.now() && (
                                                        <Badge color="red">Expiré</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Icon name="Eye" size={12} />
                                                        {offer.views || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Icon name="FileText" size={12} />
                                                        {offer.applications || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">{offer.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{offer.description}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    {formatDistanceToNow(offer.createdAt, { addSuffix: true, locale: fr })}
                                                </span>
                                                {offer.deadline && (
                                                    <span className="flex items-center gap-1">
                                                        <Icon name="Calendar" size={12} />
                                                        Expire {formatDistanceToNow(offer.deadline, { addSuffix: true, locale: fr })}
                                                    </span>
                                                )}
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
                                Candidatures récentes
                            </h2>
                            <Link to="/applications">
                                <Button variant="ghost" size="sm">
                                    Voir tout
                                    <Icon name="ChevronRight" size={14} />
                                </Button>
                            </Link>
                        </div>

                        {applications.length === 0 ? (
                            <EmptyState
                                icon={<Icon name="FileText" size={48} />}
                                title="Aucune candidature"
                                description="Les candidatures à vos offres apparaîtront ici"
                            />
                        ) : (
                            <div className="space-y-2">
                                {applications.slice(0, 5).map(app => (
                                    <div key={app.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{app.startupName}</p>
                                                <p className="text-xs text-gray-500">{app.offerTitle}</p>
                                            </div>
                                            <Badge color={
                                                app.status === 'accepted' ? 'green' :
                                                    app.status === 'rejected' ? 'red' : 'yellow'
                                            }>
                                                {app.status === 'pending' ? 'À traiter' :
                                                    app.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {formatDistanceToNow(app.submittedAt, { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <h3 className="font-bold mb-3">Actions rapides</h3>
                        <div className="space-y-2">
                            <Link to="/offers/create">
                                <Button variant="outline" className="w-full justify-start">
                                    <Icon name="PlusCircle" size={16} />
                                    Publier une opportunité
                                </Button>
                            </Link>
                            <Link to="/groups/create">
                                <Button variant="outline" className="w-full justify-start">
                                    <Icon name="Users" size={16} />
                                    Créer un groupe
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

                    {/* Recommended Startups */}
                    <Card>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold flex items-center gap-2">
                                <Icon name="Building2" size={16} className="text-theme" />
                                Startups recommandées
                            </h3>
                            <Link to="/startups">
                                <Button variant="ghost" size="sm">
                                    <Icon name="ChevronRight" size={14} />
                                </Button>
                            </Link>
                        </div>

                        {startups.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucune startup disponible</p>
                        ) : (
                            <div className="space-y-3">
                                {startups.slice(0, 4).map(startup => (
                                    <Link key={startup.id} to={`/startups/${startup.id}`}>
                                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                                            <div className="w-10 h-10 bg-theme-light rounded-lg flex items-center justify-center font-bold text-theme">
                                                {startup.name[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{startup.name}</p>
                                                <p className="text-xs text-gray-500">{startup.sector} • {startup.location}</p>
                                            </div>
                                            {startup.verified && (
                                                <Icon name="CheckCircle" size={14} className="text-blue-500" />
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
