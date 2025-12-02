# 🎭 Mode Démo - Guide d'utilisation

## Accès rapide aux profils utilisateurs

Pour accéder à l'interface d'un utilisateur sans vous connecter, ajoutez simplement `?user=ID_UTILISATEUR` à n'importe quelle URL.

### 📋 Utilisateurs disponibles

#### Startuppers
```
?user=startuper1  → Jean Doe (Startuper chez MaTech)
?user=startuper2  → Marie Koffi (Startuper chez GreenAgri)
```

#### Partenaires
```
?user=partner1    → ADPME (Partenaire)
```

#### Administrateurs
```
?user=admin1      → Admin Principal
```

### 🔗 Exemples d'URLs

**Interface complète de Jean (startuper1) :**
- Page d'accueil : `http://localhost:5173/?user=startuper1`
- Page startup : `http://localhost:5173/startup?user=startuper1`
- Opportunités : `http://localhost:5173/offers?user=startuper1`
- Messages : `http://localhost:5173/messages?user=startuper1`

**Interface de Marie (startuper2) :**
- Page d'accueil : `http://localhost:5173/?user=startuper2`
- Page startup : `http://localhost:5173/startup?user=startuper2`

**Interface Admin :**
- Panel admin : `http://localhost:5173/admin?user=admin1`
- Page d'accueil : `http://localhost:5173/?user=admin1`

**Interface Partenaire :**
- Page partenaire : `http://localhost:5173/partner?user=partner1`
- Créer offre : `http://localhost:5173/offers/create?user=partner1`

### ✨ Avantages

- ✅ Pas besoin de se connecter/déconnecter constamment
- ✅ Testez rapidement différents profils
- ✅ Partagez des URLs de démo avec l'équipe
- ✅ Fonctionne sur toutes les pages
- ✅ Le paramètre persiste durant la navigation

### 🔧 Mode développement

Le paramètre `?user=` active automatiquement le **mode démo**. Un message console s'affiche :
```
🎭 Demo Mode Active: Jean Doe (startuper)
```

### ⚠️ Important

- Ce mode est uniquement pour le développement/tests
- En production, ce paramètre devrait être désactivé
- L'authentification normale fonctionne toujours
