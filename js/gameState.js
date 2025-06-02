// Game state management system
class GameState {
    constructor() {
        this.currentState = 'menu';
        this.previousState = null;
        
        // Game data
        this.score = 0;
        this.distance = 0;
        this.time = 0;
        this.stage = 1;
        this.lives = 3;
        this.freeRideMode = false;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // Settings
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
        
        // High scores
        this.highScores = this.loadHighScores();
        
        // Game objects
        this.player = null;
        this.aiCars = [];
        this.road = null;
        this.renderer = null;
        this.input = null;
        
        this.setupUI();
    }
    
    setupUI() {
        // Menu buttons
        document.getElementById('startBtn').addEventListener('click', () => {
            this.setState('countdown');
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.setState('settings');
        });
        
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.setState('help');
        });
        
        document.getElementById('exitBtn').addEventListener('click', () => {
            window.close();
        });
        
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.setState('menu');
        });
        
        document.getElementById('backFromHelpBtn').addEventListener('click', () => {
            this.setState('menu');
        });
        
        // Settings
        document.getElementById('musicVolume').addEventListener('input', (e) => {
            this.musicVolume = e.target.value / 100;
            this.saveSettings();
        });
        
        document.getElementById('sfxVolume').addEventListener('input', (e) => {
            this.sfxVolume = e.target.value / 100;
            this.saveSettings();
        });
        
        this.loadSettings();
    }
    
    setState(newState) {
        this.previousState = this.currentState;
        this.currentState = newState;
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show appropriate screen
        switch(newState) {
            case 'menu':
                document.getElementById('startScreen').classList.add('active');
                document.getElementById('gameHUD').classList.add('hidden');
                break;
            case 'settings':
                document.getElementById('settingsScreen').classList.add('active');
                break;
            case 'help':
                document.getElementById('helpScreen').classList.add('active');
                break;
            case 'countdown':
                this.startCountdown();
                break;
            case 'playing':
                document.getElementById('gameHUD').classList.remove('hidden');
                break;
            case 'paused':
                // Show pause overlay
                break;
            case 'gameOver':
                this.showGameOver();
                break;
            case 'victory':
                this.showVictory();
                break;
        }
    }
    
    startCountdown() {
        let count = 3;
        const countdownInterval = setInterval(() => {
            // Display countdown on canvas
            if (count > 0) {
                // Draw countdown number
                count--;
            } else {
                clearInterval(countdownInterval);
                this.setState('playing');
                this.resetGame();
            }
        }, 1000);
    }
    
    resetGame() {
        this.score = 0;
        this.distance = 0;
        this.time = 0;
        this.stage = 1;
        this.lives = 3;
        
        // Reset player
        if (this.player) {
            this.player.reset(0, 0);
        }
        
        // Clear AI cars
        this.aiCars = [];
        
        // Generate new AI cars
        this.spawnAICars();
    }
    
    spawnAICars() {
        const numCars = 5 + this.stage * 2; // More cars in later stages
        
        for (let i = 0; i < numCars; i++) {
            const car = new Car(
                Utils.random(-800, 800),
                0,
                Utils.random(1000, 10000),
                false
            );
            this.aiCars.push(car);
        }
    }
    
    update(deltaTime) {
        if (this.currentState !== 'playing') return;
        
        this.time += deltaTime;
        
        // Update distance based on player position
        if (this.player) {
            this.distance = Math.max(this.distance, this.player.z);
            
            // Check stage progression
            const newStage = this.road.getStage(this.distance);
            if (newStage !== this.stage) {
                this.stage = newStage;
                this.onStageChange();
            }
            
            // Check victory condition
            if (this.distance >= 15000 && this.stage === 4) {
                this.setState('victory');
                return;
            }
        }
        
        // Update score
        this.score += Math.floor(this.distance / 10);
        
        // Update UI
        this.updateHUD();
    }
    
    onStageChange() {
        // Increase difficulty
        this.spawnAICars();
        
        // Show stage notification
        console.log(`Entering Stage ${this.stage}: ${this.road.getStageName(this.stage)}`);
    }
    
    updateHUD() {
        const speedElement = document.getElementById('speedValue');
        const distanceElement = document.getElementById('distanceValue');
        
        if (speedElement && this.player) {
            speedElement.textContent = Math.round(this.player.speed);
        }
        
        if (distanceElement) {
            distanceElement.textContent = Math.round(this.distance);
        }
        
        // Animate HUD elements with sinusoidal function
        const time = Date.now() / 1000;
        const pulse = Utils.sinusoidalAnimation(time, 0.1, 2);
        if (speedElement) {
            speedElement.style.transform = `scale(${1 + pulse})`;
        }
    }
    
    showGameOver() {
        // Save high score
        this.saveHighScore();
        
        // Show game over screen
        alert(`Game Over! Distance: ${Math.round(this.distance)}m, Time: ${Utils.formatTime(this.time)}`);
        this.setState('menu');
    }
    
    showVictory() {
        // Save high score
        this.saveHighScore();
        
        // Show victory screen
        alert(`Congratulations! You've reached the Magic Garden!\nDistance: ${Math.round(this.distance)}m\nTime: ${Utils.formatTime(this.time)}`);
        this.setState('menu');
    }
    
    saveHighScore() {
        const newScore = {
            distance: Math.round(this.distance),
            time: this.time,
            stage: this.stage,
            date: new Date().toLocaleDateString()
        };
        
        this.highScores.push(newScore);
        this.highScores.sort((a, b) => b.distance - a.distance);
        this.highScores = this.highScores.slice(0, 10); // Keep top 10
        
        localStorage.setItem('futureSkillsDrive_highScores', JSON.stringify(this.highScores));
    }
    
    loadHighScores() {
        const saved = localStorage.getItem('futureSkillsDrive_highScores');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveSettings() {
        const settings = {
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            musicEnabled: this.musicEnabled,
            sfxEnabled: this.sfxEnabled
        };
        localStorage.setItem('futureSkillsDrive_settings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('futureSkillsDrive_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.musicVolume = settings.musicVolume || 0.7;
            this.sfxVolume = settings.sfxVolume || 0.8;
            this.musicEnabled = settings.musicEnabled !== false;
            this.sfxEnabled = settings.sfxEnabled !== false;
            
            // Update UI
            document.getElementById('musicVolume').value = this.musicVolume * 100;
            document.getElementById('sfxVolume').value = this.sfxVolume * 100;
        }
    }
    
    handleInput(input) {
        if (input.pause) {
            if (this.currentState === 'playing') {
                this.setState('paused');
            } else if (this.currentState === 'paused') {
                this.setState('playing');
            }
        }
        
        if (input.freeRide && this.currentState === 'playing') {
            this.freeRideMode = !this.freeRideMode;
            console.log(`Free Ride Mode: ${this.freeRideMode ? 'ON' : 'OFF'}`);
        }
        
        if (input.radio) {
            this.musicEnabled = !this.musicEnabled;
            console.log(`Radio: ${this.musicEnabled ? 'ON' : 'OFF'}`);
        }
    }
}