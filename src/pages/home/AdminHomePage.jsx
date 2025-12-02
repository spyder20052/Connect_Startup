import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Badge, EmptyState, LoadingSpinner } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';
import { formatDistanceToNow, fr } from '../../utils/dateUtils';

export default function AdminHomePage() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [pendingStartups, setPendingStartups] = useState([]);
    const [users, setUsers] = useState([]);
    const [startups, setStartups] = useState([]);
    const [offers, setOffers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load all data for admin overview
            const [
                allReports,
                allStartups,
                allUsers,
                allOffers,
                allGroups
            ] = await Promise.all([
                db.getCollection('reports'),
                db.getCollection('startups'),
                db.getCollection('users'),
                db.getCollection('offers'),
                db.getCollection('groups')
            ]);

            setReports(allReports.filter(r => r.status === 'pending'));
            setPendingStartups(allStartups.filter(s => !s.verified));
            setUsers(allUsers);
            setStartups(allStartups);
            setOffers(allOffers);
            setGroups(allGroups);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidateStartup = async (startupId) => {
        try {
            await db.updateDoc('startups', startupId, { verified: true });
            loadData();
        } catch (error) {
            console.error('Error validating startup:', error);
        }
    };

    const handleResolveReport = async (reportId, action) => {
        try {
            await db.updateDoc('reports', reportId, {
                status: 'resolved',
                resolvedAt: Date.now(),
                resolvedBy: user.uid,
                action: action
            });
            loadData();
        } catch (error) {
            console.error('Error resolving report:', error);
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
        totalUsers: users.length,
        totalStartups: startups.length,
        totalOffers: offers.length,
        totalGroups: groups.length,
        pendingReports: reports.length,
        pendingValidations: pendingStartups.length,
        activeUsers: users.filter(u => u.emailVerified).length
    };

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Icon name="ShieldAlert" size={32} />
                            Administration ADPME
                        </h1>
                        <p className="text-red-100">
                            Gérez la plateforme, modérez le contenu et validez les startups
                        </p>
                    </div>
                    {(stats.pendingReports > 0 || stats.pendingValidations > 0) && (
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <p className="text-sm font-semibold">
                                {stats.pendingReports + stats.pendingValidations} actions en attente
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Alert Cards */}
            {(stats.pendingReports > 0 || stats.pendingValidations > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.pendingReports > 0 && (
                        <Card className="border-l-4 border-l-red-500 bg-red-50">
                            <div className="flex items-center gap-3">
                                <Icon name="AlertCircle" size={24} className="text-red-600" />
                                <div>
                                    <p className="font-bold text-red-900">
                                        {stats.pendingReports} signalement{stats.pendingReports > 1 ? 's' : ''} en attente
                                    </p>
                                    <p className="text-sm text-red-700">Action requise</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {stats.pendingValidations > 0 && (
                        <Card className="border-l-4 border-l-orange-500 bg-orange-50">
                            <div className="flex items-center gap-3">
                                <Icon name="FileText" size={24} className="text-orange-600" />
                                <div>
                                    <p className="font-bold text-orange-900">
                                        {stats.pendingValidations} RCCM à valider
                                    </p>
                                    <p className="text-sm text-orange-700">Vérification nécessaire</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Platform Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Utilisateurs</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                            <p className="text-xs text-gray-400 mt-1">{stats.activeUsers} actifs</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Icon name="Users" size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Startups</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStartups}</p>
                            <p className="text-xs text-gray-400 mt-1">{stats.pendingValidations} non vérifiées</p>
                        </div>
                        <div className="w-12 h-12 bg-theme-light rounded-lg flex items-center justify-center">
                            <Icon name="Building2" size={24} className="text-theme" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Opportunités</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOffers}</p>
                            <p className="text-xs text-gray-400 mt-1">publiées</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                            <Icon name="Briefcase" size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Groupes</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalGroups}</p>
                            <p className="text-xs text-gray-400 mt-1">de discussion</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <Icon name="MessageSquare" size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Moderation Queue */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Icon name="AlertCircle" className="text-red-600" />
                                File de modération
                            </h2>
                            <Badge color="red">{reports.length}</Badge>
                        </div>

                        {reports.length === 0 ? (
                            <EmptyState
                                icon={<Icon name="CheckCircle" size={48} className="text-green-500" />}
                                title="Aucun signalement en attente"
                                description="Tous les signalements ont été traités"
                            />
                        ) : (
                            <div className="space-y-3">
                                {reports.map(report => (
                                    <div key={report.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <Badge color="red">{report.type}</Badge>
                                                <p className="font-semibold text-sm mt-2">{report.reason}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Signalé {formatDistanceToNow(report.createdAt, { addSuffix: true, locale: fr })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleResolveReport(report.id, 'deleted')}
                                            >
                                                <Icon name="X" size={14} />
                                                Supprimer
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleResolveReport(report.id, 'dismissed')}
                                            >
                                                Ignorer
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* RCCM Validation Queue */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Icon name="FileText" className="text-orange-600" />
                                Validation RCCM
                            </h2>
                            <Badge color="yellow">{pendingStartups.length}</Badge>
                        </div>

                        {pendingStartups.length === 0 ? (
                            <EmptyState
                                icon={<Icon name="CheckCircle" size={48} className="text-green-500" />}
                                title="Aucune validation en attente"
                                description="Toutes les startups ont été vérifiées"
                            />
                        ) : (
                            <div className="space-y-3">
                                {pendingStartups.map(startup => (
                                    <div key={startup.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-bold">{startup.name}</p>
                                                <p className="text-sm text-gray-600">{startup.sector} • {startup.location}</p>
                                                <p className="text-sm font-mono text-gray-700 mt-1">RCCM: {startup.rccm}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Créé {formatDistanceToNow(startup.createdAt, { addSuffix: true, locale: fr })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                onClick={() => handleValidateStartup(startup.id)}
                                            >
                                                <Icon name="CheckCircle" size={14} />
                                                Valider
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Icon name="Eye" size={14} />
                                                Voir le PDF
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                            >
                                                <Icon name="X" size={14} />
                                                Rejeter
                                            </Button>
                                        </div>
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
                            <Link to="/admin/users">
                                <Button variant="outline" className="w-full justify-start">
                                    <Icon name="Users" size={16} />
                                    Gérer les utilisateurs
                                </Button>
                            </Link>
                            <Link to="/admin/startups">
                                <Button variant="outline" className="w-full justify-start">
                                    <Icon name="Building2" size={16} />
                                    Gérer les startups
                                </Button>
                            </Link>
                            <Link to="/admin/offers">
                                <Button variant="outline" className="w-full justify-start">
                                    <Icon name="Briefcase" size={16} />
                                    Gérer les offres
                                </Button>
                            </Link>
                            <Link to="/admin/logs">
                                <Button variant="outline" className="w-full justify-start">
                                    <Icon name="FileText" size={16} />
                                    Logs d'activité
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Icon name="TrendingUp" size={16} className="text-theme" />
                            Activité récente
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                <div>
                                    <p className="text-gray-900">Nouvelle startup inscrite</p>
                                    <p className="text-xs text-gray-500">Il y a 2 heures</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                <div>
                                    <p className="text-gray-900">Offre publiée par un partenaire</p>
                                    <p className="text-xs text-gray-500">Il y a 5 heures</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                                <div>
                                    <p className="text-gray-900">Nouveau signalement reçu</p>
                                    <p className="text-xs text-gray-500">Il y a 1 jour</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
