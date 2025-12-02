import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Badge, LoadingSpinner, EmptyState, Modal } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';
import { formatDistanceToNow, fr } from '../../utils/dateUtils';

export default function ConnectionRequestsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [startups, setStartups] = useState({});

    useEffect(() => {
        if (user.startupId) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadData = async () => {
        try {
            // Load all requests
            const pending = await db.getPendingConnectionRequests(user.startupId);
            const sent = await db.getSentConnectionRequests(user.startupId);
            const accepted = await db.getStartupConnections(user.startupId);

            // Load startup informations for all IDs
            const startupIds = [
                ...pending.map(r => r.fromStartupId),
                ...sent.map(r => r.toStartupId),
                ...accepted.map(c => c.fromStartupId === user.startupId ? c.toStartupId : c.fromStartupId)
            ];

            const allStartups = await db.getCollection('startups');
            const startupsMap = {};
            startupIds.forEach(id => {
                const startup = allStartups.find(s => s.id === id);
                if (startup) startupsMap[id] = startup;
            });

            setPendingRequests(pending);
            setSentRequests(sent);
            setConnections(accepted);
            setStartups(startupsMap);
        } catch (error) {
            console.error('Error loading connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await db.acceptConnectionRequest(requestId);
            await loadData();
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleReject = async (requestId) => {
        try {
            await db.rejectConnectionRequest(requestId);
            await loadData();
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user.startupId) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <EmptyState
                    icon={<Icon name="Building2" size={48} />}
                    title="Aucune startup"
                    description="Vous devez faire partie d'une startup pour gérer les connexions."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Connexions entre Startups</h1>
                <p className="text-gray-500 mt-1">
                    Gérez vos demandes de connexion et votre réseau de startups
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">{connections.length}</p>
                        <p className="text-sm text-gray-600">Connexions établies</p>
                    </div>
                </Card>
                <Card className="bg-yellow-50">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</p>
                        <p className="text-sm text-gray-600">Demandes reçues</p>
                    </div>
                </Card>
                <Card className="bg-gray-50">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-600">{sentRequests.length}</p>
                        <p className="text-sm text-gray-600">Demandes envoyées</p>
                    </div>
                </Card>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4">Demandes reçues</h2>
                    <div className="space-y-4">
                        {pendingRequests.map(request => {
                            const startup = startups[request.fromStartupId];
                            return (
                                <div key={request.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 bg-theme-light rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl font-bold text-theme">
                                            {startup?.name[0]}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900">{startup?.name}</h3>
                                            <span className="text-xs text-gray-400">
                                                {formatDistanceToNow(request.createdAt, { addSuffix: true, locale: fr })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{startup?.sector} • {startup?.location}</p>
                                        {request.message && (
                                            <p className="text-sm text-gray-700 bg-white p-3 rounded mb-3">
                                                {request.message}
                                            </p>
                                        )}
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleAccept(request.id)}>
                                                <Icon name="CheckCircle" size={14} />
                                                Accepter
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>
                                                <Icon name="XCircle" size={14} />
                                                Refuser
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Established Connections */}
            <Card>
                <h2 className="text-xl font-bold mb-4">Réseau ({connections.length})</h2>
                {connections.length === 0 ? (
                    <EmptyState
                        icon={<Icon name="Users" size={40} />}
                        title="Aucune connexion"
                        description="Commencez à vous connecter avec d'autres startups de l'écosystème"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {connections.map(connection => {
                            const startupId = connection.fromStartupId === user.startupId
                                ? connection.toStartupId
                                : connection.fromStartupId;
                            const startup = startups[startupId];

                            return (
                                <div key={connection.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-theme transition">
                                    <div className="w-12 h-12 bg-theme-light rounded-xl flex items-center justify-center">
                                        <span className="text-xl font-bold text-theme">
                                            {startup?.name[0]}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{startup?.name}</h3>
                                        <p className="text-xs text-gray-500">{startup?.sector} • {startup?.location}</p>
                                    </div>
                                    <Icon name="CheckCircle" size={20} className="text-green-500" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4">Demandes envoyées</h2>
                    <div className="space-y-3">
                        {sentRequests.map(request => {
                            const startup = startups[request.toStartupId];
                            return (
                                <div key={request.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-theme-light rounded-lg flex items-center justify-center">
                                        <span className="font-bold text-theme">
                                            {startup?.name[0]}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{startup?.name}</h4>
                                        <p className="text-xs text-gray-500">{startup?.sector}</p>
                                    </div>
                                    <Badge color={request.status === 'pending' ? 'yellow' : request.status === 'accepted' ? 'green' : 'red'}>
                                        {request.status === 'pending' ? 'En attente' : request.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
}
