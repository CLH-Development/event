let currentDate = new Date();
let selectedDate = null;
let selectedColor = null;

// Fonction pour charger les événements depuis l'API
async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
    }
}

// Fonction pour sauvegarder un événement
async function saveEvent(eventData) {
    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
        loadEvents(); // Recharger les événements après la sauvegarde
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
    }
}

// Fonction pour supprimer un événement
async function deleteEvent(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        loadEvents(); // Recharger les événements après la suppression
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

// Fonction pour mettre à jour un événement
async function updateEvent(eventId, eventData) {
    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
        loadEvents(); // Recharger les événements après la mise à jour
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
    }
}

// Fonction pour afficher les événements dans le calendrier
function displayEvents(events) {
    // Effacer tous les événements existants
    document.querySelectorAll('.events-container').forEach(container => {
        container.innerHTML = '';
    });

    events.forEach(event => {
        const startDate = new Date(event.start_date);
        const dayColumn = getDayColumn(startDate);
        if (dayColumn) {
            const eventElement = createEventElement(event);
            dayColumn.querySelector('.events-container').appendChild(eventElement);
        }
    });
}

// Fonction pour créer un élément d'événement
function createEventElement(event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event';
    eventDiv.style.backgroundColor = event.color;
    eventDiv.dataset.eventId = event.id;

    const startTime = new Date(event.start_date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    eventDiv.innerHTML = `
        <div class="event-time">${startTime}</div>
        <div class="event-title">${event.title}</div>
        ${event.description ? `<div class="event-subtitle">${event.description}</div>` : ''}
    `;

    // Ajouter les gestionnaires d'événements
    eventDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(event);
    });

    return eventDiv;
}

// Fonction pour obtenir la colonne du jour correspondant à une date
function getDayColumn(date) {
    const dayOfWeek = date.getDay();
    const columns = document.querySelectorAll('.day-column');
    return columns[dayOfWeek];
}

// Fonction pour ouvrir le modal d'édition
function openEditModal(event = null) {
    const modal = document.querySelector('.modal-overlay');
    const form = document.getElementById('event-form');
    
    if (event) {
        // Mode édition
        const startTime = new Date(event.start_date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        document.getElementById('event-time').value = startTime;
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-notes').value = event.description || '';
        selectedColor = event.color;
        updateSelectedColor();
        
        // Ajouter un bouton de suppression
        let deleteButton = form.querySelector('.delete-button');
        if (!deleteButton) {
            deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'delete-button';
            deleteButton.textContent = 'Supprimer';
            form.querySelector('.modal-buttons').appendChild(deleteButton);
        }
        
        deleteButton.onclick = () => {
            if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
                deleteEvent(event.id);
                closeModal();
            }
        };
        
        // Mettre à jour le gestionnaire de soumission du formulaire
        form.onsubmit = (e) => {
            e.preventDefault();
            const updatedEvent = {
                title: document.getElementById('event-title').value,
                start_date: combineDateTimeString(selectedDate, document.getElementById('event-time').value),
                end_date: combineDateTimeString(selectedDate, getEndTime(document.getElementById('event-time').value)),
                description: document.getElementById('event-notes').value,
                color: selectedColor
            };
            updateEvent(event.id, updatedEvent);
            closeModal();
        };
    } else {
        // Mode création
        form.reset();
        selectedColor = '#FFD6E5'; // Couleur par défaut
        updateSelectedColor();
        
        // Supprimer le bouton de suppression s'il existe
        const deleteButton = form.querySelector('.delete-button');
        if (deleteButton) {
            deleteButton.remove();
        }
        
        // Mettre à jour le gestionnaire de soumission du formulaire
        form.onsubmit = (e) => {
            e.preventDefault();
            const newEvent = {
                title: document.getElementById('event-title').value,
                start_date: combineDateTimeString(selectedDate, document.getElementById('event-time').value),
                end_date: combineDateTimeString(selectedDate, getEndTime(document.getElementById('event-time').value)),
                description: document.getElementById('event-notes').value,
                color: selectedColor
            };
            saveEvent(newEvent);
            closeModal();
        };
    }
    
    modal.style.display = 'flex';
}

// Fonction pour fermer le modal
function closeModal() {
    document.querySelector('.modal-overlay').style.display = 'none';
}

// Fonction pour combiner date et heure en chaîne ISO
function combineDateTimeString(date, time) {
    const [hours, minutes] = time.split(':');
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours), parseInt(minutes), 0);
    return newDate.toISOString();
}

// Fonction pour obtenir l'heure de fin (1 heure après le début)
function getEndTime(startTime) {
    const [hours, minutes] = startTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours) + 1, parseInt(minutes), 0);
    return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fonction pour mettre à jour la couleur sélectionnée
function updateSelectedColor() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.color === selectedColor);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Gestionnaire pour les boutons de navigation
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 7);
        updateCalendar();
    });

    document.getElementById('currentWeek').addEventListener('click', () => {
        currentDate = new Date();
        updateCalendar();
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 7);
        updateCalendar();
    });

    // Gestionnaire pour les colonnes de jours
    document.querySelectorAll('.day-column').forEach(column => {
        column.addEventListener('click', () => {
            selectedDate = getDateFromColumn(column);
            openEditModal();
        });
    });

    // Gestionnaire pour les boutons de couleur
    document.querySelectorAll('.color-option').forEach(button => {
        button.addEventListener('click', () => {
            selectedColor = button.dataset.color;
            updateSelectedColor();
        });
    });

    // Gestionnaire pour le bouton d'annulation
    document.getElementById('cancel-event').addEventListener('click', closeModal);

    // Fermer le modal en cliquant en dehors
    document.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    });

    // Initialiser le calendrier
    updateCalendar();
    loadEvents();
});

// Fonction pour mettre à jour le calendrier
function updateCalendar() {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);

    document.querySelectorAll('.day-header').forEach((header, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase();
        const dayNumber = date.getDate();
        header.textContent = `${dayName} ${dayNumber}`;
    });

    loadEvents();
}

// Fonction pour obtenir la date d'une colonne
function getDateFromColumn(column) {
    const dayHeader = column.querySelector('.day-header').textContent;
    const [, dayNumber] = dayHeader.split(' ');
    const date = new Date(currentDate);
    date.setDate(parseInt(dayNumber));
    return date;
}
