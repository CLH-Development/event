# Calendrier en ligne

Une application de calendrier hebdomadaire interactive construite avec Flask et JavaScript.

## Fonctionnalités

- Vue hebdomadaire du calendrier
- Création, modification et suppression d'événements
- Personnalisation des couleurs des événements
- Stockage persistant dans une base de données PostgreSQL
- Interface utilisateur intuitive et responsive

## Technologies utilisées

- Backend : Flask (Python)
- Frontend : JavaScript vanilla, HTML5, CSS3
- Base de données : PostgreSQL
- Déploiement : Render.com

## Installation locale

1. Cloner le repository :
```bash
git clone <votre-repo-url>
cd Calendar
```

2. Créer un environnement virtuel et l'activer :
```bash
python -m venv venv
source venv/bin/activate  # Sur Unix
.\venv\Scripts\activate   # Sur Windows
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

4. Configurer les variables d'environnement :
Créer un fichier `.env` avec :
```
DATABASE_URL=votre_url_postgresql
FLASK_ENV=development
```

5. Lancer l'application :
```bash
python app.py
```

## Déploiement

L'application est configurée pour être déployée sur Render.com avec une base de données PostgreSQL.
