from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from config import Config
from datetime import datetime
import os

app = Flask(__name__, static_folder='.')
app.config.from_object(Config)
db = SQLAlchemy(app)

# Modèle pour les événements du calendrier
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7))  # Pour stocker les codes couleur HTML (#RRGGBB)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'description': self.description,
            'color': self.color
        }

# Créer les tables dans la base de données
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Route pour obtenir tous les événements
@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([event.to_dict() for event in events])

# Route pour créer un nouvel événement
@app.route('/api/events', methods=['POST'])
def create_event():
    try:
        data = request.get_json()
        
        # Validation des données requises
        required_fields = ['title', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Le champ {field} est requis'}), 400
        
        # Conversion des dates
        start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        
        # Création de l'événement
        event = Event(
            title=data['title'],
            start_date=start_date,
            end_date=end_date,
            description=data.get('description', ''),
            color=data.get('color', '#3788d8')  # Couleur par défaut
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify(event.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Route pour mettre à jour un événement
@app.route('/api/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    try:
        event = Event.query.get_or_404(event_id)
        data = request.get_json()
        
        if 'title' in data:
            event.title = data['title']
        if 'start_date' in data:
            event.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        if 'end_date' in data:
            event.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        if 'description' in data:
            event.description = data['description']
        if 'color' in data:
            event.color = data['color']
        
        db.session.commit()
        return jsonify(event.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Route pour supprimer un événement
@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    try:
        event = Event.query.get_or_404(event_id)
        db.session.delete(event)
        db.session.commit()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Route pour obtenir un événement spécifique
@app.route('/api/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify(event.to_dict())

if __name__ == '__main__':
    app.run(debug=True)
