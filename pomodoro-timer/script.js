class PomodoroTimer {
    constructor() {
        this.focusTime = 25 * 60;
        this.shortBreak = 5 * 60;
        this.longBreak = 15 * 60;
        this.currentTime = this.focusTime;
        this.isRunning = false;
        this.interval = null;
        this.sessionCount = 0;
        this.currentSession = 'focus';
        
        this.stats = {
            completedSessions: 0,
            totalFocusTime: 0,
            streak: 0,
            lastDate: null
        };

       this.sounds = {
            rain: new Audio('./sounds/rain.mp3'),
            forest: new Audio('./sounds/forest.mp3'),
            ocean: new Audio('./sounds/ocean.mp3'),
            coffee: new Audio('./sounds/coffee-shop.mp3')
        };

        this.initElements();
        this.loadStats();
        this.bindEvents();
        this.updateDisplay();
    }

    initElements() {
        this.timerDisplay = document.getElementById('timer');
        this.sessionType = document.getElementById('sessionType');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.focusInput = document.getElementById('focusTime');
        this.shortBreakInput = document.getElementById('shortBreak');
        this.longBreakInput = document.getElementById('longBreak');
        this.soundSelect = document.getElementById('soundSelect');
        this.volumeControl = document.getElementById('volume');
        this.statsDisplay = {
            completed: document.getElementById('completedSessions'),
            focusTime: document.getElementById('totalFocusTime'),
            streak: document.getElementById('streak')
        };
        this.exportBtn = document.getElementById('exportBtn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.focusInput.addEventListener('change', () => this.updateTimes());
        this.shortBreakInput.addEventListener('change', () => this.updateTimes());
        this.longBreakInput.addEventListener('change', () => this.updateTimes());
        this.soundSelect.addEventListener('change', () => this.changeSound());
        this.volumeControl.addEventListener('input', () => this.updateVolume());
        this.exportBtn.addEventListener('click', () => this.exportStats());
    }

    updateTimes() {
        this.focusTime = parseInt(this.focusInput.value) * 60;
        this.shortBreak = parseInt(this.shortBreakInput.value) * 60;
        this.longBreak = parseInt(this.longBreakInput.value) * 60;
        this.reset();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.interval = setInterval(() => this.tick(), 1000);
        }
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
    }

    reset() {
        this.pause();
        this.currentTime = this.currentSession === 'focus' ? this.focusTime : 
                         this.sessionCount % 4 === 0 ? this.longBreak : this.shortBreak;
        this.updateDisplay();
    }

    tick() {
        if (this.currentTime > 0) {
            this.currentTime--;
            if (this.currentSession === 'focus') {
                this.stats.totalFocusTime++;
            }
            this.updateDisplay();
        } else {
            this.completeSession();
        }
    }

    completeSession() {
        this.pause();
        if (this.currentSession === 'focus') {
            this.sessionCount++;
            this.stats.completedSessions++;
            this.currentSession = this.sessionCount % 4 === 0 ? 'longBreak' : 'shortBreak';
            this.currentTime = this.sessionCount % 4 === 0 ? this.longBreak : this.shortBreak;
            this.updateStreak();
        } else {
            this.currentSession = 'focus';
            this.currentTime = this.focusTime;
        }
        this.sessionType.textContent = this.currentSession.charAt(0).toUpperCase() + this.currentSession.slice(1);
        this.saveStats();
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.updateStatsDisplay();
    }

    changeSound() {
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        
        const selectedSound = this.soundSelect.value;
        if (selectedSound !== 'none') {
            this.sounds[selectedSound].loop = true;
            this.sounds[selectedSound].volume = this.volumeControl.value;
            this.sounds[selectedSound].play();
        }
    }

    updateVolume() {
        const volume = this.volumeControl.value;
        Object.values(this.sounds).forEach(sound => {
            sound.volume = volume;
        });
    }

    updateStreak() {
        const today = new Date().toDateString();
        if (this.stats.lastDate) {
            const last = new Date(this.stats.lastDate);
            const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
            if (diff === 1) this.stats.streak++;
            else if (diff > 1) this.stats.streak = 1;
        } else {
            this.stats.streak = 1;
        }
        this.stats.lastDate = today;
    }

    updateStatsDisplay() {
        this.statsDisplay.completed.textContent = this.stats.completedSessions;
        this.statsDisplay.focusTime.textContent = Math.floor(this.stats.totalFocusTime / 60);
        this.statsDisplay.streak.textContent = this.stats.streak;
    }

    saveStats() {
        localStorage.setItem('pomodoroStats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('pomodoroStats');
        if (saved) {
            this.stats = JSON.parse(saved);
            this.updateStatsDisplay();
        }
    }

    exportStats() {
        const statsString = `Pomodoro Stats - ${new Date().toLocaleString()}
Completed Sessions: ${this.stats.completedSessions}
Total Focus Time: ${Math.floor(this.stats.totalFocusTime / 60)} minutes
Current Streak: ${this.stats.streak} days`;

        const blob = new Blob([statsString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pomodoro-stats-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});