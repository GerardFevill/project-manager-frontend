# Configuration CORS - Résolution du problème

## 🔴 Problème Initial

```
Access to XMLHttpRequest at 'http://192.168.56.102:3001/api/users?page=1&pageSize=100'
from origin 'http://localhost:4201' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Cause
Le navigateur bloque les requêtes entre différentes origines (Cross-Origin) :
- **Frontend** : `http://localhost:4201`
- **Backend API** : `http://192.168.56.102:3001`

---

## ✅ Solution Implémentée : Proxy Angular

Au lieu d'appeler directement l'API backend, nous utilisons un **proxy Angular** en développement.

### Comment ça fonctionne ?

```
┌─────────────────┐
│   Browser       │
│ localhost:4201  │
└────────┬────────┘
         │ Request: GET /api/users
         │ (Same origin - No CORS)
         ▼
┌─────────────────────────┐
│   Angular Dev Server    │
│   localhost:4201        │
└────────┬────────────────┘
         │ Proxy forwards to:
         │ http://192.168.56.102:3001/api/users
         ▼
┌─────────────────────────┐
│   Backend API           │
│   192.168.56.102:3001   │
└─────────────────────────┘
```

---

## 📁 Fichiers Modifiés

### 1. **proxy.conf.json** (nouveau)
```json
{
  "/api": {
    "target": "http://192.168.56.102:3001",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Explication** :
- `/api` : Toutes les requêtes commençant par `/api` seront proxifiées
- `target` : L'URL du backend API
- `changeOrigin: true` : Change l'en-tête Origin pour éviter CORS
- `logLevel: "debug"` : Affiche les logs du proxy dans la console

---

### 2. **environment.ts**
```typescript
// AVANT
export const environment = {
  production: false,
  apiUrl: 'http://192.168.56.102:3001/api'
};

// APRÈS
export const environment = {
  production: false,
  apiUrl: '/api'  // URL relative, utilise le proxy
};
```

---

### 3. **package.json**
```json
// AVANT
"start": "ng serve"

// APRÈS
"start": "ng serve --proxy-config proxy.conf.json"
```

---

## 🚀 Comment Utiliser

### Démarrer le serveur de développement

```bash
npm start
```

Ou directement :
```bash
ng serve --proxy-config proxy.conf.json
```

### Vérifier que le proxy fonctionne

Dans la console du terminal, vous devriez voir :
```
[HPM] Proxy created: /api  ->  http://192.168.56.102:3001
[HPM] Proxy rewrite rule created: "^/api" ~> ""
```

Dans les DevTools du navigateur (onglet Network) :
- ✅ Requêtes vers : `http://localhost:4201/api/users`
- ✅ Status : 200 OK
- ✅ Pas d'erreur CORS

---

## 🔧 Configuration Avancée

### Modifier l'URL du backend

Si l'IP du backend change, modifiez uniquement `proxy.conf.json` :

```json
{
  "/api": {
    "target": "http://NOUVELLE_IP:PORT",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### Ajouter des en-têtes personnalisés

```json
{
  "/api": {
    "target": "http://192.168.56.102:3001",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "headers": {
      "X-Custom-Header": "value"
    }
  }
}
```

### Proxifier plusieurs routes

```json
{
  "/api": {
    "target": "http://192.168.56.102:3001",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/auth": {
    "target": "http://192.168.56.102:3002",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## 🌐 Production vs Développement

### Développement (avec proxy)
```typescript
// environment.ts
apiUrl: '/api'
```
- ✅ Proxy Angular gère les requêtes
- ✅ Pas de problème CORS
- ✅ Logs de debug disponibles

### Production (sans proxy)
```typescript
// environment.prod.ts
apiUrl: '/api/v1'
```
- Backend doit être sur le **même domaine**
- Ou utiliser **Nginx** comme reverse proxy
- Ou configurer **CORS côté backend**

---

## 🔧 Alternative : Configurer CORS côté Backend

Si vous préférez configurer le backend au lieu d'utiliser un proxy :

### Backend Node.js/Express
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:4201',
  credentials: true
}));
```

### Backend NestJS
```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:4201',
  credentials: true
});
```

### Backend Spring Boot
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:4201")
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                    .allowCredentials(true);
            }
        };
    }
}
```

---

## ❓ Dépannage

### Problème : Le proxy ne fonctionne pas

**Solution 1** : Vérifier que le serveur est démarré avec `--proxy-config`
```bash
npm start
# ou
ng serve --proxy-config proxy.conf.json
```

**Solution 2** : Vérifier les logs du proxy
- Dans le terminal, vous devriez voir `[HPM] Proxy created`
- Si vous ne voyez rien, le fichier `proxy.conf.json` n'est pas lu

**Solution 3** : Redémarrer le serveur Angular
```bash
# Arrêter avec Ctrl+C
# Puis relancer
npm start
```

---

### Problème : Erreur 404 Not Found

**Cause** : L'URL de la requête ne correspond pas à la route du proxy.

**Solution** : Vérifier que toutes les requêtes API commencent par `/api`
```typescript
// ✅ BON
GET /api/users
GET /api/projects

// ❌ MAUVAIS
GET /users  // Ne sera pas proxifié
```

---

### Problème : Le backend ne répond pas

**Solution 1** : Vérifier que le backend est bien démarré
```bash
curl http://192.168.56.102:3001/api/health
```

**Solution 2** : Vérifier l'URL dans `proxy.conf.json`
```json
{
  "/api": {
    "target": "http://192.168.56.102:3001",  // Vérifier IP et port
    ...
  }
}
```

---

## 📚 Documentation Officielle

- [Angular Proxy Configuration](https://angular.dev/tools/cli/serve#proxying-to-a-backend-server)
- [webpack-dev-server Proxy](https://webpack.js.org/configuration/dev-server/#devserverproxy)

---

## ✅ Checklist

- [x] Créé `proxy.conf.json`
- [x] Modifié `environment.ts` pour utiliser `/api`
- [x] Modifié `package.json` script `start`
- [x] Testé avec `npm start`
- [ ] **TODO Backend** : Vérifier que l'API backend est accessible sur `http://192.168.56.102:3001`

---

**Date** : 2025-11-20
**Version** : 1.0
**Auteur** : Claude Code
