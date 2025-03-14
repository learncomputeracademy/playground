class Flashcard {
    constructor(front, back) {
        this.front = front;
        this.back = back;
        this.interval = 1;
        this.nextReview = new Date();
        this.ease = 2.5;
    }
}

class FlashcardApp {
    constructor() {
        this.cards = JSON.parse(localStorage.getItem('flashcards')) || [];
        this.cards = this.cards.map(card => ({
            ...card,
            nextReview: new Date(card.nextReview)
        }));
        this.selectedCard = null;
        
        this.initElements();
        this.bindEvents();
        this.renderCards();
        this.updateStats();
    }

    initElements() {
        this.frontInput = document.getElementById('front');
        this.backInput = document.getElementById('back');
        this.addButton = document.getElementById('add-card');
        this.cardsList = document.getElementById('cards-list');
        this.totalCardsSpan = document.getElementById('total-cards');
        this.dueCardsSpan = document.getElementById('due-cards');
        this.reviewControls = document.getElementById('review-controls');
        this.reviewButtons = document.querySelectorAll('.review-btn');
    }

    bindEvents() {
        if (this.addButton) {
            this.addButton.addEventListener('click', () => this.addCard());
        } else {
            console.error('Add Card button not found in the DOM');
        }

        this.reviewButtons.forEach(btn => 
            btn.addEventListener('click', (e) => this.reviewCard(e.target.dataset.difficulty))
        );
    }

    addCard() {
        const front = this.frontInput.value.trim();
        const back = this.backInput.value.trim();
        
        if (front && back) {
            const card = new Flashcard(front, back);
            this.cards.push(card);
            this.saveCards();
            this.renderCards();
            this.updateStats();
            this.clearInputs();
        } else {
            console.log('Please enter both front and back text');
        }
    }

    deleteCard(index) {
        this.cards.splice(index, 1);
        this.saveCards();
        this.renderCards();
        this.updateStats();
        if (this.selectedCard) {
            this.reviewControls.style.display = 'none';
            this.selectedCard = null;
        }
    }

    renderCards() {
        this.cardsList.innerHTML = '';
        const now = new Date();

        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-item';
            cardElement.innerHTML = `
                <div class="card-content">
                    <div class="card-front">${card.front}</div>
                    <div class="card-back">${card.back}</div>
                </div>
                <div class="card-status">
                    ${card.nextReview <= now ? 'Due Now' : `Due: ${card.nextReview.toLocaleDateString()}`}
                </div>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            
            cardElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    this.selectCard(card, cardElement);
                }
            });

            const deleteBtn = cardElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteCard(index));

            this.cardsList.appendChild(cardElement);
        });
    }

    selectCard(card, element) {
        if (this.selectedCard === element) {
            element.classList.toggle('show-back');
            return;
        }

        if (this.selectedCard) {
            this.selectedCard.classList.remove('show-back', 'selected');
        }
        
        this.selectedCard = element;
        element.classList.add('show-back', 'selected');
        this.reviewControls.style.display = 'flex';
    }

    reviewCard(difficulty) {
        if (!this.selectedCard) return;

        const index = Array.from(this.cardsList.children).indexOf(this.selectedCard);
        const card = this.cards[index];
        const now = new Date();

        if (difficulty >= 3) {
            card.ease = Math.max(1.3, card.ease + 0.1 * (difficulty - card.ease));
            card.interval = card.interval * card.ease;
        } else {
            card.ease = Math.max(1.3, card.ease - 0.2);
            card.interval = 1;
        }

        card.nextReview = new Date(now.getTime() + card.interval * 24 * 60 * 60 * 1000);
        this.saveCards();
        this.renderCards();
        this.updateStats();
        this.reviewControls.style.display = 'none';
        this.selectedCard = null;
    }

    updateStats() {
        const now = new Date();
        this.totalCardsSpan.textContent = this.cards.length;
        this.dueCardsSpan.textContent = this.cards.filter(card => card.nextReview <= now).length;
    }

    clearInputs() {
        this.frontInput.value = '';
        this.backInput.value = '';
    }

    saveCards() {
        localStorage.setItem('flashcards', JSON.stringify(this.cards));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        new FlashcardApp();
    } catch (error) {
        console.error('Error initializing FlashcardApp:', error);
    }
});