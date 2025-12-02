// Fake Database Service - Simulates backend with localStorage
class FakeDB {
    constructor() {
        this.APP_KEY = 'startup_connect_data_v2';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.APP_KEY)) {
            const initialData = {
                users: [
                    {
                        uid: 'admin1',
                        email: 'admin@adpme.bj',
                        displayName: 'Admin ADPME',
                        role: 'admin',
                        emailVerified: true,
                        createdAt: Date.now() - 86400000 * 30
                    },
                    {
                        uid: 'partner1',
                        email: 'invest@partner.com',
                        displayName: 'Bénin Business Angels',
                        role: 'partner',
                        companyName: 'Bénin Business Angels',
                        emailVerified: true,
                        createdAt: Date.now() - 86400000 * 20
                    },
                    {
                        uid: 'startuper1',
                        email: 'ceo@matech.com',
                        displayName: 'Jean Innov',
                        role: 'startuper',
                        startupId: 's1',
                        sector: 'Tech',
                        emailVerified: true,
                        createdAt: Date.now() - 86400000 * 10
                    }
                ],
                startups: [
                    {
                        id: 's1',
                        name: 'MaTech',
                        sector: 'Tech',
                        location: 'Cotonou',
                        rccm: 'RB/COT/2024/A/001',
                        rccmPdf: 'mock-rccm-matech.pdf',
                        members: ['startuper1'],
                        description: "Plateforme d'IA pour l'agriculture intelligente au Bénin.",
                        website: 'https://matech.bj',
                        size: '5-10',
                        verified: true,
                        createdAt: Date.now() - 86400000 * 10
                    },
                    {
                        id: 's2',
                        name: 'AgriBenin',
                        sector: 'Agri',
                        location: 'Parakou',
                        rccm: 'RB/PKO/2023/B/554',
                        rccmPdf: 'mock-rccm-agri.pdf',
                        members: [],
                        description: "Transformation et exportation de noix de cajou bio.",
                        website: 'https://agribenin.com',
                        size: '10-50',
                        verified: true,
                        createdAt: Date.now() - 86400000 * 60
                    },
                    {
                        id: 's3',
                        name: 'FinTech Solutions',
                        sector: 'Finance',
                        location: 'Cotonou',
                        rccm: 'RB/COT/2024/A/089',
                        rccmPdf: 'mock-rccm-fintech.pdf',
                        members: [],
                        description: "Solutions de paiement mobile pour les commerçants.",
                        size: '1-5',
                        verified: false,
                        createdAt: Date.now() - 86400000 * 5
                    }
                ],
                offers: [
                    {
                        id: 'o1',
                        title: 'Programme d\'Accélération Tech 2025',
                        description: "Programme intensif de 3 mois pour startups technologiques avec financement jusqu'à 50M FCFA, mentorat et accès au marché.",
                        type: 'offer',
                        sector: 'Tech',
                        creatorId: 'partner1',
                        creatorName: 'Bénin Business Angels',
                        deadline: Date.now() + 86400000 * 30,
                        hasInternalForm: true,
                        externalFormUrl: null,
                        createdAt: Date.now() - 86400000 * 5,
                        views: 45,
                        applications: 12
                    },
                    {
                        id: 'o2',
                        title: 'Tech Salon Cotonou 2025',
                        description: "Rencontrez les investisseurs, partenaires et autres startups lors du plus grand événement tech de l'année.",
                        type: 'event',
                        sector: 'Tech',
                        creatorId: 'admin1',
                        creatorName: 'ADPME',
                        deadline: Date.now() + 86400000 * 15,
                        hasInternalForm: false,
                        externalFormUrl: 'https://techsalon.bj/register',
                        createdAt: Date.now() - 86400000 * 3,
                        views: 120,
                        applications: 34
                    },
                    {
                        id: 'o3',
                        title: 'Financement Agritech',
                        description: "Subventions pour startups agricoles innovantes. Jusqu'à 30M FCFA de financement.",
                        type: 'offer',
                        sector: 'Agri',
                        creatorId: 'admin1',
                        creatorName: 'ADPME',
                        deadline: Date.now() + 86400000 * 45,
                        hasInternalForm: true,
                        externalFormUrl: null,
                        createdAt: Date.now() - 86400000 * 2,
                        views: 67,
                        applications: 8
                    }
                ],
                groups: [
                    {
                        id: 'g1',
                        name: 'Secteur : Tech',
                        type: 'sector',
                        sector: 'Tech',
                        members: ['startuper1', 'partner1', 'admin1'],
                        createdAt: Date.now() - 86400000 * 10
                    },
                    {
                        id: 'g2',
                        name: 'Secteur : Agri',
                        type: 'sector',
                        sector: 'Agri',
                        members: ['partner1', 'admin1'],
                        createdAt: Date.now() - 86400000 * 60
                    },
                    {
                        id: 'g3',
                        name: 'Secteur : Finance',
                        type: 'sector',
                        sector: 'Finance',
                        members: ['admin1'],
                        createdAt: Date.now() - 86400000 * 5
                    }
                ],
                messages: [
                    {
                        id: 'm1',
                        groupId: 'g1',
                        content: 'Bienvenue dans le groupe Tech ! Partagez vos innovations.',
                        userId: 'admin1',
                        userName: 'Admin ADPME',
                        createdAt: Date.now() - 86400000 * 2
                    },
                    {
                        id: 'm2',
                        groupId: 'g1',
                        content: 'Merci ! Hâte de collaborer avec vous tous.',
                        userId: 'startuper1',
                        userName: 'Jean Innov',
                        createdAt: Date.now() - 86400000 * 1
                    }
                ],
                candidacies: [
                    {
                        id: 'c1',
                        offerId: 'o1',
                        offerTitle: 'Programme d\'Accélération Tech 2025',
                        startupId: 's1',
                        startupName: 'MaTech',
                        userId: 'startuper1',
                        status: 'pending',
                        submittedAt: Date.now() - 86400000 * 2,
                        formData: { pitch: 'Notre solution IA révolutionne l\'agriculture...' }
                    }
                ],
                savedOffers: [
                    { userId: 'startuper1', offerId: 'o2', savedAt: Date.now() - 86400000 * 1 }
                ],
                joinRequests: [],
                startupConnections: [],
                reports: [
                    {
                        id: 'r1',
                        type: 'content',
                        targetType: 'post',
                        targetId: 'p1',
                        reporterId: 'startuper1',
                        reason: 'Contenu inapproprié',
                        status: 'pending',
                        createdAt: Date.now() - 86400000 * 1
                    }
                ],
                posts: []
            };
            localStorage.setItem(this.APP_KEY, JSON.stringify(initialData));
        }
    }

    _getData() {
        return JSON.parse(localStorage.getItem(this.APP_KEY));
    }

    _saveData(data) {
        localStorage.setItem(this.APP_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event('db-update'));
    }

    // Auth Methods
    async login(email, password) {
        const data = this._getData();
        const user = data.users.find(u => u.email === email);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!user) {
                    reject('Utilisateur non trouvé');
                } else if (!user.emailVerified) {
                    reject('Veuillez confirmer votre email avant de vous connecter');
                } else {
                    resolve(user);
                }
            }, 500);
        });
    }

    async register(userProfile) {
        const data = this._getData();

        // Check if email already exists
        if (data.users.find(u => u.email === userProfile.email)) {
            return Promise.reject('Cet email est déjà utilisé');
        }

        const newUser = {
            uid: 'user' + Date.now(),
            ...userProfile,
            emailVerified: true, // Auto-verify email
            createdAt: Date.now()
        };



        data.users.push(newUser);

        // If startuper created a new startup, add them to members automatically
        if (newUser.role === 'startuper' && newUser.startupId) {
            const startupIndex = data.startups.findIndex(s => s.id === newUser.startupId);
            if (startupIndex !== -1) {
                // Check if members array exists, if not create it
                if (!data.startups[startupIndex].members) {
                    data.startups[startupIndex].members = [];
                }

                // Add user to members with their role
                data.startups[startupIndex].members.push({
                    userId: newUser.uid,
                    name: newUser.displayName,
                    role: newUser.jobTitle || 'Membre',
                    isFounder: newUser.isFounder || false,
                    joinedAt: Date.now()
                });
            }
        }

        this._saveData(data);

        return Promise.resolve(newUser);
    }

    async verifyEmail(userId) {
        const data = this._getData();
        const user = data.users.find(u => u.uid === userId);

        if (user) {
            user.emailVerified = true;
            this._saveData(data);
            return Promise.resolve(user);
        }

        return Promise.reject('Utilisateur non trouvé');
    }

    // RCCM Validation
    validateRCCM(rccm) {
        // Format: RB/CITY/YEAR/LETTER/NUMBER
        // Example: RB/COT/2024/A/001
        const regex = /^RB\/[A-Z]{3}\/\d{4}\/[A-Z]\/\d{3,4}$/;
        return regex.test(rccm);
    }

    // Data Methods
    async getCollection(collectionName, filter = null) {
        const data = this._getData();
        let collection = data[collectionName] || [];

        if (filter) {
            collection = collection.filter(filter);
        }

        return Promise.resolve(collection);
    }

    async getDoc(collectionName, id) {
        const data = this._getData();
        const doc = data[collectionName]?.find(d => d.id === id);
        return Promise.resolve(doc);
    }

    async addDoc(collectionName, doc) {
        const data = this._getData();
        const newDoc = { ...doc, id: collectionName[0] + Date.now() };

        if (!data[collectionName]) data[collectionName] = [];
        data[collectionName].push(newDoc);
        this._saveData(data);

        return Promise.resolve(newDoc);
    }

    async updateDoc(collectionName, id, updates) {
        const data = this._getData();
        const idx = data[collectionName]?.findIndex(d => d.id === id);

        if (idx !== -1) {
            data[collectionName][idx] = { ...data[collectionName][idx], ...updates };
            this._saveData(data);
            return Promise.resolve(data[collectionName][idx]);
        }

        return Promise.reject('Document non trouvé');
    }

    async deleteDoc(collectionName, id) {
        const data = this._getData();
        const idx = data[collectionName]?.findIndex(d => d.id === id);

        if (idx !== -1) {
            data[collectionName].splice(idx, 1);
            this._saveData(data);
            return Promise.resolve();
        }

        return Promise.reject('Document non trouvé');
    }

    // Startup-specific methods
    async joinGroup(userId, sector) {
        const data = this._getData();
        let group = data.groups.find(g => g.type === 'sector' && g.sector === sector);

        if (!group) {
            group = {
                id: 'g' + Date.now(),
                name: `Secteur : ${sector}`,
                type: 'sector',
                sector: sector,
                members: [],
                createdAt: Date.now()
            };
            data.groups.push(group);
        }

        if (!group.members.includes(userId)) {
            group.members.push(userId);
            this._saveData(data);
        }

        return Promise.resolve(group);
    }

    async saveOffer(userId, offerId) {
        const data = this._getData();

        if (!data.savedOffers.find(s => s.userId === userId && s.offerId === offerId)) {
            data.savedOffers.push({ userId, offerId, savedAt: Date.now() });
            this._saveData(data);
        }

        return Promise.resolve();
    }

    async unsaveOffer(userId, offerId) {
        const data = this._getData();
        data.savedOffers = data.savedOffers.filter(s => !(s.userId === userId && s.offerId === offerId));
        this._saveData(data);
        return Promise.resolve();
    }

    async getSavedOffers(userId) {
        const data = this._getData();
        const saved = data.savedOffers.filter(s => s.userId === userId);
        const offerIds = saved.map(s => s.offerId);
        const offers = data.offers.filter(o => offerIds.includes(o.id));
        return Promise.resolve(offers);
    }

    // Startup Connection Methods
    async sendConnectionRequest(fromStartupId, toStartupId, message) {
        const data = this._getData();

        // Check if connection already exists
        const existing = data.startupConnections.find(
            c => (c.fromStartupId === fromStartupId && c.toStartupId === toStartupId) ||
                (c.fromStartupId === toStartupId && c.toStartupId === fromStartupId)
        );

        if (existing) {
            return Promise.reject('Une demande de connexion existe déjà');
        }

        const request = {
            id: 'sc' + Date.now(),
            fromStartupId,
            toStartupId,
            message: message || '',
            status: 'pending',
            createdAt: Date.now()
        };

        data.startupConnections.push(request);
        this._saveData(data);
        return Promise.resolve(request);
    }

    async acceptConnectionRequest(requestId) {
        const data = this._getData();
        const request = data.startupConnections.find(r => r.id === requestId);

        if (!request) {
            return Promise.reject('Demande non trouvée');
        }

        request.status = 'accepted';
        request.respondedAt = Date.now();
        this._saveData(data);
        return Promise.resolve(request);
    }

    async rejectConnectionRequest(requestId) {
        const data = this._getData();
        const request = data.startupConnections.find(r => r.id === requestId);

        if (!request) {
            return Promise.reject('Demande non trouvée');
        }

        request.status = 'rejected';
        request.respondedAt = Date.now();
        this._saveData(data);
        return Promise.resolve(request);
    }

    async getStartupConnections(startupId) {
        const data = this._getData();
        return Promise.resolve(
            data.startupConnections.filter(
                c => (c.fromStartupId === startupId || c.toStartupId === startupId) &&
                    c.status === 'accepted'
            )
        );
    }

    async getPendingConnectionRequests(startupId) {
        const data = this._getData();
        return Promise.resolve(
            data.startupConnections.filter(
                c => c.toStartupId === startupId && c.status === 'pending'
            )
        );
    }

    async getSentConnectionRequests(startupId) {
        const data = this._getData();
        return Promise.resolve(
            data.startupConnections.filter(
                c => c.fromStartupId === startupId
            )
        );
    }
}

export const db = new FakeDB();
