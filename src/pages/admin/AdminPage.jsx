import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Badge, LoadingSpinner, Input, Select, Alert, Modal } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';
import { formatDate } from '../../utils/dateUtils';

export default function AdminPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);

    // Data states
    const [users, setUsers] = useState([]);
    const [startups, setStartups] = useState([]);
    const [offers, setOffers] = useState([]);
    const [reports, setReports] = useState([]);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [usersData, startupsData, offersData, reportsData] = await Promise.all([
                db.getCollection('users'),
                db.getCollection('startups'),
                db.getCollection('offers'),
                db.getCollection('reports')
            ]);

            setUsers(usersData);
            setStartups(startupsData);
            setOffers(offersData);
            setReports(reportsData);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    // User Management Functions
    const handleDeleteUser = async (userId) => {
        setActionLoading(true);
        try {
            await db.deleteDoc('users', userId);
            setUsers(users.filter(u => u.uid !== userId));
            setSuccessMessage('Utilisateur supprimé avec succès');
            setShowDeleteModal(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangeUserRole = async (userId, newRole) => {
        try {
            await db.updateDoc('users', userId, { role: newRole });
            setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
            setSuccessMessage('Rôle modifié avec succès');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error changing role:', error);
        }
    };

    // Startup Management Functions
    const handleVerifyStartup = async (startupId, verified) => {
        try {
            await db.updateDoc('startups', startupId, { verified });
            setStartups(startups.map(s => s.id === startupId ? { ...s, verified } : s));
            setSuccessMessage(`Startup ${verified ? 'vérifiée' : 'non vérifiée'} avec succès`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error verifying startup:', error);
        }
    };

    const handleDeleteStartup = async (startupId) => {
        setActionLoading(true);
        try {
            await db.deleteDoc('startups', startupId);
            setStartups(startups.filter(s => s.id !== startupId));
            setSuccessMessage('Startup supprimée avec succès');
            setShowDeleteModal(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting startup:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Offer Management Functions
    const handleDeleteOffer = async (offerId) => {
        setActionLoading(true);
        try {
            await db.deleteDoc('offers', offerId);
            setOffers(offers.filter(o => o.id !== offerId));
            setSuccessMessage('Offre supprimée avec succès');
            setShowDeleteModal(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting offer:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Report Management Functions
    const handleReportAction = async (reportId, action) => {
        try {
            await db.updateDoc('reports', reportId, {
                status: action === 'approve' ? 'approved' : 'rejected',
                resolvedAt: Date.now(),
                resolvedBy: user.uid
            });
            setReports(reports.map(r =>
                r.id === reportId
                    ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' }
                    : r
            ));
            setSuccessMessage(`Signalement ${action === 'approve' ? 'approuvé' : 'rejeté'}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error handling report:', error);
        }
    };

    // Filter functions
    const getFilteredUsers = () => {
        return users.filter(u => {
            const matchesSearch = u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = filterRole === 'all' || u.role === filterRole;
            return matchesSearch && matchesRole;
        });
    };

    const getFilteredStartups = () => {
        return startups.filter(s =>
            s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.sector?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const getFilteredOffers = () => {
        return offers.filter(o =>
            o.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.sector?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const getPendingReports = () => {
        return reports.filter(r => r.status === 'pending');
    };

    // Check if user exists and is admin
    if (!user || user.role !== 'admin') {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <Alert type="error">
                    Accès refusé. Cette page est réservée aux administrateurs.
                </Alert>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
                <p className="text-gray-500 mt-1">Gérez les utilisateurs, startups, offres et signalements</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <Alert type="success">{successMessage}</Alert>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                        <p className="text-sm text-gray-600">Utilisateurs</p>
                    </div>
                </Card>
                <Card className="bg-green-50">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{startups.length}</p>
                        <p className="text-sm text-gray-600">Startups</p>
                    </div>
                </Card>
                <Card className="bg-purple-50">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">{offers.length}</p>
                        <p className="text-sm text-gray-600">Opportunités</p>
                    </div>
                </Card>
                <Card className="bg-red-50">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">{reports.filter(r => r.status === 'pending').length}</p>
                        <p className="text-sm text-gray-600">Signalements</p>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <Card className="p-0">
                <div className="border-b border-gray-200">
                    <div className="flex -mb-px overflow-x-auto">
                        {[
                            { id: 'users', label: 'Utilisateurs', icon: 'Users' },
                            { id: 'startups', label: 'Startups', icon: 'Building2' },
                            { id: 'offers', label: 'Opportunités', icon: 'Briefcase' },
                            { id: 'reports', label: 'Signalements', icon: 'ShieldAlert', badge: getPendingReports().length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSearchQuery('');
                                    setFilterRole('all');
                                }}
                                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${activeTab === tab.id
                                    ? 'border-theme text-theme'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Icon name={tab.icon} size={18} />
                                {tab.label}
                                {tab.badge > 0 && (
                                    <Badge color="red">{tab.badge}</Badge>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Search and Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Rechercher ${activeTab === 'users' ? 'un utilisateur' : activeTab === 'startups' ? 'une startup' : 'une opportunité'}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
                            />
                        </div>
                        {activeTab === 'users' && (
                            <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                                <option value="all">Tous les rôles</option>
                                <option value="startuper">Startuppers</option>
                                <option value="partner">Partenaires</option>
                                <option value="admin">Admins</option>
                            </Select>
                        )}
                    </div>

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="space-y-3">
                            {getFilteredUsers().length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Aucun utilisateur trouvé</p>
                            ) : (
                                getFilteredUsers().map(u => (
                                    <div key={u.uid} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="w-12 h-12 bg-theme-light rounded-full flex items-center justify-center text-theme font-bold flex-shrink-0">
                                            {u.displayName?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">{u.displayName}</h3>
                                                <Badge color={u.role === 'admin' ? 'red' : u.role === 'partner' ? 'blue' : 'theme'}>
                                                    {u.role}
                                                </Badge>
                                                {u.emailVerified && <Icon name="CheckCircle" size={14} className="text-green-500" />}
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{u.email}</p>
                                            {u.companyName && <p className="text-xs text-gray-500">{u.companyName}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={u.role}
                                                onChange={(e) => handleChangeUserRole(u.uid, e.target.value)}
                                                className="text-sm"
                                            >
                                                <option value="startuper">Startuper</option>
                                                <option value="partner">Partner</option>
                                                <option value="admin">Admin</option>
                                            </Select>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    setItemToDelete({ type: 'user', id: u.uid, name: u.displayName });
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                <Icon name="XCircle" size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Startups Tab */}
                    {activeTab === 'startups' && (
                        <div className="space-y-3">
                            {getFilteredStartups().length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Aucune startup trouvée</p>
                            ) : (
                                getFilteredStartups().map(s => (
                                    <div key={s.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="w-12 h-12 bg-theme-light rounded-xl flex items-center justify-center text-theme font-bold flex-shrink-0">
                                            {s.name?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                                                {s.verified && <Icon name="CheckCircle" size={16} className="text-blue-500" />}
                                                <Badge color="gray">{s.sector}</Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Icon name="MapPin" size={12} />
                                                    {s.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Icon name="Users" size={12} />
                                                    {s.members?.length || 0} membres
                                                </span>
                                                {user.role === 'admin' && s.rccm && (
                                                    <span className="font-mono">{s.rccm}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant={s.verified ? 'outline' : 'primary'}
                                                size="sm"
                                                onClick={() => handleVerifyStartup(s.id, !s.verified)}
                                            >
                                                <Icon name={s.verified ? 'XCircle' : 'CheckCircle'} size={14} />
                                                {s.verified ? 'Retirer' : 'Vérifier'}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    setItemToDelete({ type: 'startup', id: s.id, name: s.name });
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                <Icon name="XCircle" size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Offers Tab */}
                    {activeTab === 'offers' && (
                        <div className="space-y-3">
                            {getFilteredOffers().length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Aucune opportunité trouvée</p>
                            ) : (
                                getFilteredOffers().map(o => (
                                    <div key={o.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge color={o.type === 'event' ? 'purple' : 'theme'}>
                                                    {o.type === 'event' ? 'Événement' : 'Offre'}
                                                </Badge>
                                                <Badge color="gray">{o.sector}</Badge>
                                                {o.deadline < Date.now() && <Badge color="red">Expiré</Badge>}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-1">{o.title}</h3>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>{o.creatorName}</span>
                                                <span className="flex items-center gap-1">
                                                    <Icon name="Eye" size={12} />
                                                    {o.views || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Icon name="FileText" size={12} />
                                                    {o.applications || 0} candidatures
                                                </span>
                                                {o.deadline && <span>{formatDate(o.deadline)}</span>}
                                            </div>
                                        </div>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => {
                                                setItemToDelete({ type: 'offer', id: o.id, name: o.title });
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            <Icon name="XCircle" size={14} />
                                            Supprimer
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === 'reports' && (
                        <div className="space-y-3">
                            {getPendingReports().length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Aucun signalement en attente</p>
                            ) : (
                                getPendingReports().map(r => (
                                    <div key={r.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <Badge color="yellow">En attente</Badge>
                                                <h3 className="font-semibold text-gray-900 mt-2">{r.reason}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Type: {r.targetType} • ID: {r.targetId}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Signalé le {formatDate(r.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleReportAction(r.id, 'approve')}
                                            >
                                                <Icon name="CheckCircle" size={14} />
                                                Approuver
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReportAction(r.id, 'reject')}
                                            >
                                                <Icon name="XCircle" size={14} />
                                                Rejeter
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmer la suppression"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Êtes-vous sûr de vouloir supprimer{' '}
                        <strong>{itemToDelete?.name}</strong> ?
                    </p>
                    <p className="text-sm text-red-600">
                        ⚠️ Cette action est irréversible.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={actionLoading}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                if (itemToDelete?.type === 'user') {
                                    handleDeleteUser(itemToDelete.id);
                                } else if (itemToDelete?.type === 'startup') {
                                    handleDeleteStartup(itemToDelete.id);
                                } else if (itemToDelete?.type === 'offer') {
                                    handleDeleteOffer(itemToDelete.id);
                                }
                            }}
                            disabled={actionLoading}
                        >
                            {actionLoading ? <LoadingSpinner size="sm" /> : 'Supprimer'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
