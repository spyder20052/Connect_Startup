import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Badge, LoadingSpinner, Alert } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';

export default function StartupDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [startup, setStartup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isJoinRequested, setIsJoinRequested] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const startupData = await db.getDoc('startups', id);
            if (!startupData) {
                navigate('/startups');
                return;
            }
            setStartup(startupData);

            // Load members
            const allUsers = await db.getCollection('users');
            const startupMembers = allUsers.filter(u => startupData.members?.includes(u.uid));
            setMembers(startupMembers);

            // Check if user has already requested to join
            if (user.role === 'startuper' && user.uid) {
                const joinRequests = await db.getCollection('joinRequests');
                const existingRequest = joinRequests.find(
                    r => r.userId === user.uid && r.startupId === id && r.status === 'pending'
                );
                setIsJoinRequested(!!existingRequest);
            }
        } catch (error) {
            console.error('Error loading startup:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRequest = async () => {
        try {
            await db.addDoc('joinRequests', {
                userId: user.uid,
                startupId: id,
                status: 'pending',
                createdAt: Date.now()
            });
            setIsJoinRequested(true);
        } catch (error) {
            console.error('Error sending join request:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!startup) {
        return (
            <div className="max-w-4xl mx-auto">
                <Alert type="error">Startup non trouvée</Alert>
            </div>
        );
    }

    const isOwner = user.role === 'startuper' && user.startupId === id;
    const canJoin = user.role === 'startuper' && !user.startupId && !isJoinRequested;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/startups')}
                className="flex items-center gap-2 text-gray-600 hover:text-theme transition"
            >
                <Icon name="ChevronLeft" size={20} />
                <span className="font-medium">Retour à l'annuaire</span>
            </button>

            {/* Header Card */}
            <Card className="relative overflow-hidden">
                {/* Cover */}
                <div className="h-48 bg-gradient-to-br from-theme to-theme-hover"></div>

                {/* Content */}
                <div className="px-8 pb-8">
                    {/* Logo */}
                    <div className="flex items-end justify-between -mt-16 mb-6">
                        <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white">
                            <span className="text-4xl font-bold text-theme">
                                {startup.name[0]}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {isOwner && (
                                <Button variant="outline">
                                    <Icon name="Edit" size={16} />
                                    Modifier
                                </Button>
                            )}
                            {canJoin && (
                                <Button onClick={handleJoinRequest}>
                                    <Icon name="UserPlus" size={16} />
                                    Demander à rejoindre
                                </Button>
                            )}
                            {isJoinRequested && (
                                <Badge color="yellow">Demande envoyée</Badge>
                            )}
                        </div>
                    </div>

                    {/* Title & Info */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{startup.name}</h1>
                                    {startup.verified && (
                                        <Icon name="CheckCircle" size={24} className="text-blue-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Icon name="MapPin" size={16} />
                                        {startup.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Icon name="Users" size={16} />
                                        {members.length} membre{members.length > 1 ? 's' : ''}
                                    </span>
                                    {startup.rccm && (
                                        <span className="flex items-center gap-1 font-mono text-sm">
                                            <Icon name="FileText" size={16} />
                                            {startup.rccm}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Badge color="theme" className="text-base px-4 py-2">
                                {startup.sector}
                            </Badge>
                        </div>

                        {startup.description && (
                            <p className="text-gray-700 text-lg leading-relaxed">
                                {startup.description}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Icon name="Info" className="text-theme" />
                            À propos
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p>{startup.description || 'Aucune description disponible pour le moment.'}</p>

                            {startup.website && (
                                <div className="flex items-center gap-2">
                                    <Icon name="Globe" size={16} className="text-gray-400" />
                                    <a href={startup.website} target="_blank" rel="noopener noreferrer" className="text-theme hover:underline">
                                        {startup.website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Team Members */}
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Icon name="Users" className="text-theme" />
                            Équipe ({members.length})
                        </h2>

                        {members.length === 0 ? (
                            <p className="text-gray-500 text-sm">Aucun membre pour le moment</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {members.map(member => (
                                    <div key={member.uid} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-12 h-12 bg-theme-light rounded-full flex items-center justify-center text-theme font-bold">
                                            {member.displayName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{member.displayName}</p>
                                            <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
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
                                    <p className="text-gray-500">Secteur</p>
                                    <p className="font-semibold">{startup.sector}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Icon name="MapPin" size={16} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-gray-500">Localisation</p>
                                    <p className="font-semibold">{startup.location}</p>
                                </div>
                            </div>

                            {startup.rccm && (
                                <div className="flex items-start gap-2">
                                    <Icon name="FileText" size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-500">RCCM</p>
                                        <p className="font-mono text-xs">{startup.rccm}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-2">
                                <Icon name={startup.verified ? 'CheckCircle' : 'AlertCircle'} size={16} className={`mt-0.5 ${startup.verified ? 'text-green-500' : 'text-orange-500'}`} />
                                <div>
                                    <p className="text-gray-500">Statut</p>
                                    <p className={`font-semibold ${startup.verified ? 'text-green-600' : 'text-orange-600'}`}>
                                        {startup.verified ? 'Vérifiée' : 'En attente de vérification'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Contact */}
                    <Card>
                        <h3 className="font-bold mb-4">Contact</h3>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Icon name="Mail" size={16} />
                                Envoyer un message
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Icon name="Share" size={16} />
                                Partager le profil
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
