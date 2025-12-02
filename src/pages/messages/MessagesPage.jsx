import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/fakeDB';
import { Card, Button, Badge, EmptyState, LoadingSpinner, Input } from '../../components/ui';
import { Icon } from '../../components/ui/Icons';
import { formatDistanceToNow, fr } from '../../utils/dateUtils';

export default function MessagesPage() {
    const { user } = useAuth();

    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadGroups();
    }, [user]);

    useEffect(() => {
        if (selectedGroup) {
            loadMessages(selectedGroup.id);
        }
    }, [selectedGroup]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadGroups = async () => {
        try {
            const allGroups = await db.getCollection('groups');

            // Filter groups user is member of
            const userGroups = allGroups.filter(g => g.members?.includes(user.uid));

            // Sort by most recent activity
            userGroups.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));

            setGroups(userGroups);

            // Auto-select first group
            if (userGroups.length > 0 && !selectedGroup) {
                setSelectedGroup(userGroups[0]);
            }
        } catch (error) {
            console.error('Error loading groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (groupId) => {
        try {
            const allMessages = await db.getCollection('messages');
            const groupMessages = allMessages
                .filter(m => m.groupId === groupId)
                .sort((a, b) => a.createdAt - b.createdAt);

            setMessages(groupMessages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedGroup) return;

        setSending(true);

        try {
            const message = {
                groupId: selectedGroup.id,
                userId: user.uid,
                userName: user.displayName,
                content: newMessage.trim(),
                createdAt: Date.now()
            };

            await db.addDoc('messages', message);

            // Update group's last activity
            await db.updateDoc('groups', selectedGroup.id, {
                lastActivity: Date.now()
            });

            // Reload messages
            await loadMessages(selectedGroup.id);

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <EmptyState
                    icon={<Icon name="MessageSquare" size={48} />}
                    title="Aucun groupe de discussion"
                    description="Vous n'êtes membre d'aucun groupe pour le moment. Rejoignez une startup pour accéder aux groupes sectoriels."
                />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Sidebar - Groups List */}
            <div className="w-80 flex-shrink-0">
                <Card className="h-full flex flex-col p-0">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                        <p className="text-sm text-gray-500 mt-1">{groups.length} groupe{groups.length > 1 ? 's' : ''}</p>
                    </div>

                    {/* Groups List */}
                    <div className="flex-1 overflow-y-auto">
                        {groups.map(group => {
                            const isSelected = selectedGroup?.id === group.id;
                            const unreadCount = 0; // TODO: Implement unread count

                            return (
                                <button
                                    key={group.id}
                                    onClick={() => setSelectedGroup(group)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition border-l-4 ${isSelected
                                        ? 'bg-theme-light border-theme'
                                        : 'border-transparent'
                                        }`}
                                >
                                    {/* Group Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-theme text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        <Icon name="Users" size={20} />
                                    </div>

                                    {/* Group Info */}
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-semibold truncate ${isSelected ? 'text-theme' : 'text-gray-900'
                                                }`}>
                                                {group.name}
                                            </h3>
                                            {unreadCount > 0 && (
                                                <Badge color="theme" className="ml-2">{unreadCount}</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {group.members?.length || 0} membre{(group.members?.length || 0) > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Card className="h-full flex flex-col p-0">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-theme rounded-xl flex items-center justify-center text-white">
                                <Icon name="Users" size={18} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">{selectedGroup?.name}</h2>
                                <p className="text-xs text-gray-500">
                                    {selectedGroup?.members?.length || 0} membre{(selectedGroup?.members?.length || 0) > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        <Button variant="outline" size="sm">
                            <Icon name="Info" size={16} />
                            Détails
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <EmptyState
                                    icon={<Icon name="MessageSquare" size={40} />}
                                    title="Aucun message"
                                    description="Soyez le premier à envoyer un message dans ce groupe"
                                />
                            </div>
                        ) : (
                            <>
                                {messages.map((message, index) => {
                                    const isOwnMessage = message.userId === user.uid;
                                    const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;

                                    return (
                                        <div
                                            key={message.id || index}
                                            className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                                        >
                                            {/* Avatar */}
                                            {showAvatar ? (
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm ${isOwnMessage ? 'bg-theme' : 'bg-gray-400'
                                                    }`}>
                                                    {message.userName?.[0] || '?'}
                                                </div>
                                            ) : (
                                                <div className="w-8" />
                                            )}

                                            {/* Message Bubble */}
                                            <div className={`flex-1 max-w-lg ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                                                {showAvatar && (
                                                    <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                                                        <span className="text-xs font-semibold text-gray-900">
                                                            {message.userName || 'Utilisateur inconnu'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {formatDistanceToNow(message.createdAt, { addSuffix: true, locale: fr })}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className={`px-4 py-2 rounded-2xl ${isOwnMessage
                                                    ? 'bg-theme text-white rounded-tr-sm'
                                                    : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                                                    }`}>
                                                    <p className="text-sm whitespace-pre-wrap break-words">
                                                        {message.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                        <form onSubmit={handleSendMessage} className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Écrivez votre message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={sending}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent disabled:bg-gray-50"
                            />
                            <Button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                size="lg"
                                className="px-6"
                            >
                                {sending ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <>
                                        <Icon name="Send" size={18} />
                                        Envoyer
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
}
