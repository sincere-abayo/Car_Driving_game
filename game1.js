class FutureSkillsDrive {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, paused, gameOver, victory
        
        // Game variables
        this.player = {
            x: 400,
            y: 450,
            width: 40,
            height: 80,
            speed: 0,
            maxSpeed: 200,
            plateNumber: 'RWA-2025',
            color: '#ff4444'
        };
        
        this.camera = {
            x: 0,
            y: 0
        };
        
        this.road = {
            width: 400,
            lanes: 3,
            curve: 0,
            hillHeight: 0,
            segments: []
        };
        
        this.game = {
            distance: 0,
            stage: 1,
            score: 0,
            time: 0,
            freeRideMode: false,
            radioOn: false
        };
        
        this.aiCars = [];
        this.obstacles = [];
        this.scenery = [];
        this.roadSigns = [];
        
        this.keys = {};
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateInitialRoad();
        this.generateScenery();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e.code);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Menu buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        document.getElementById('exitBtn').addEventListener('click', () => this.exitGame());
        document.getElementById('backBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('helpBackBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('victoryRestartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('victoryMenuBtn').addEventListener('click', () => this.showMenu());
    }
    
    handleKeyPress(code) {
        switch(code) {
            case 'Escape':
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                } else {
                    this.showMenu();
                }
                break;
            case 'KeyR':
                this.toggleRadio();
                break;
            case 'KeyF':
                this.toggleFreeRide();
                break;
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.resetGame();
        this.showScreen('gameScreen');
    }
    
    resetGame() {
        this.player.x = 400;
        this.player.y = 450;
        this.player.speed = 0;
        this.game.distance = 0;
        this.game.stage = 1;
        this.game.score = 0;
        this.game.time = 0;
        this.aiCars = [];
        this.obstacles = [];
        this.generateInitialRoad();
        this.generateAICars();
    }
    
    showMenu() {
        this.gameState = 'menu';
        this.showScreen('startScreen');
        musicPlayer.stop();
    }
    
    showSettings() {
        this.showScreen('settingsScreen');
    }
    
    showHelp() {
        this.showScreen('helpScreen');
    }
    
    exitGame() {
        window.close();
    }
    
    pauseGame() {
        this.gameState = 'paused';
    }
    
    resumeGame() {
        this.gameState = 'playing';
    }
    
    toggleRadio() {
        this.game.radioOn = !this.game.radioOn;
        document.getElementById('radioStatus').textContent = this.game.radioOn ? 'ON' : 'OFF';
        
        if (this.game.radioOn) {
            musicPlayer.start();
        } else {
            musicPlayer.stop();
        }
    }
    
    toggleFreeRide() {
        this.game.freeRideMode = !this.game.freeRideMode;
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }
    
    generateInitialRoad() {
        this.road.segments = [];
        for (let i = 0; i < 100; i++) {
            this.road.segments.push({
                curve: Math.sin(i * 0.02) * 0.5,
                hill: Math.cos(i * 0.03) * 50,
                y: i * 10
            });
        }
    }
    
    generateScenery() {
        this.scenery = [];
        this.roadSigns = [];
        
        for (let i = 0; i < 50; i++) {
            // Trees
            this.scenery.push({
                type: 'tree',
                x: Math.random() < 0.5 ? -200 - Math.random() * 100 : 600 + Math.random() * 100,
                y: i * 50,
                color: `hsl(${120 + Math.random() * 60}, 70%, ${30 + Math.random() * 20}%)`
            });
            
            // Road signs every 500m
            if (i % 10 === 0) {
                const signs = [
                    "Visit Rwanda",
                    "Rwanda's Innovation Hub",
                    "Refuel with Rwandan Coffee Energy!",
                    "Stage " + Math.ceil(i/20) + ": Digital Horizon Ahead!",
                    "Beware of AI cars!",
                    "RP"
                ];
                
                this.roadSigns.push({
                    x: Math.random() < 0.5 ? -150 : 550,
                    y: i * 50,
                    text: signs[Math.floor(Math.random() * signs.length)]
                });
            }
        }
    }
    
    generateAICars() {
        this.aiCars = [];
        for (let i = 0; i < 5; i++) {
            this.aiCars.push({
                x: 300 + Math.random() * 200,
                y: this.player.y - 200 - i * 150,
                width: 35,
                height: 70,
                speed: 80 + Math.random() * 60,
                lane: Math.floor(Math.random() * 3),
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer(deltaTime);
        this.updateAICars(deltaTime);
        this.updateCamera();
        this.updateGame(deltaTime);
        this.checkCollisions();
        this.updateUI();
    }
    
    updatePlayer(deltaTime) {
        // Handle input
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= 150 * deltaTime;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += 150 * deltaTime;
        }
        if (this.keys['Space']) {
            this.player.speed = Math.max(0, this.player.speed - 200 * deltaTime);
            sounds.brake();
        } else {
            this.player.speed = Math.min(this.player.maxSpeed, this.player.speed + 100 * deltaTime);
        }
        
        // Keep player on road
        this.player.x = Math.max(250, Math.min(550, this.player.x));
        
        // Update distance based on speed
        this.game.distance += this.player.speed * deltaTime * 0.1;
    }
    
    updateAICars(deltaTime) {
        this.aiCars.forEach(car => {
            car.y += (this.player.speed - car.speed) * deltaTime * 0.1;
            
            // Simple AI lane changing
            if (Math.random() < 0.001) {
                car.lane = Math.max(0, Math.min(2, car.lane + (Math.random() < 0.5 ? -1 : 1)));
                car.x = 300 + car.lane * 80;
            }
            
            // Respawn cars that are too far behind
            if (car.y > this.player.y + 300) {
                car.y = this.player.y - 500 - Math.random() * 200;
                car.speed = 80 + Math.random() * 60;
                car.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
            }
        });
    }
    
    updateCamera() {
        this.camera.y = this.player.y - 300;
    }
    
    updateGame(deltaTime) {
        this.game.time += deltaTime;
        
        // Stage progression every 500m
        const newStage = Math.min(3, Math.floor(this.game.distance / 500) + 1);
        if (newStage > this.game.stage) {
            this.game.stage = newStage;
            if (this.game.stage === 3) {
                this.checkVictory();
            }
        }
        
        this.game.score = Math.floor(this.game.distance * 10);
    }
    
    checkCollisions() {
        this.aiCars.forEach(car => {
            if (this.isColliding(this.player, car)) {
                this.handleCrash();
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    handleCrash() {
        sounds.crash();
        this.player.speed *= 0.5;
        this.game.score = Math.max(0, this.game.score - 100);
    }
    
    checkVictory() {
        if (this.game.distance >= 1500) { // Reached Magic Garden
            this.gameState = 'victory';
            this.showVictoryScreen();
        }
    }
    
    showVictoryScreen() {
        this.showScreen('victoryScreen');
        document.getElementById('victoryStats').innerHTML = `
            <p>Distance: ${Math.floor(this.game.distance)}m</p>
            <p>Time: ${Math.floor(this.game.time)}s</p>
            <p>Score: ${this.game.score}</p>
        `;
        this.saveHighScore();
    }
    
    saveHighScore() {
        const highScore = localStorage.getItem('futureSkillsDriveHighScore') || 0;
        if (this.game.score > highScore) {
            localStorage.setItem('futureSkillsDriveHighScore', this.game.score);
        }
    }
    
    updateUI() {
        document.getElementById('speed').textContent = Math.floor(this.player.speed);
        document.getElementById('distanceValue').textContent = Math.floor(this.game.distance);
        document.getElementById('stageValue').textContent = this.game.stage;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'menu') return;
        
        this.renderSky();
        this.renderGround();
        this.renderRoad();
        this.renderScenery();
        this.renderRoadSigns();
        this.renderAICars();
        this.renderPlayer();
        
        if (this.gameState === 'paused') {
            this.renderPauseOverlay();
        }
    }
    
    renderSky() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8E8');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderGround() {
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.canvas.height * 0.6, this.canvas.width, this.canvas.height * 0.4);
    }
    
    renderRoad() {
        const roadY = this.canvas.height * 0.6;
        
        // Road surface
        this.ctx.fillStyle = '#404040';
        this.ctx.fillRect(200, roadY, 400, this.canvas.height * 0.4);
        
        // Lane markings
        this.ctx.strokeStyle = '#FFFF00';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 20]);
        
        for (let i = 1; i < 3; i++) {
            const x = 200 + (400 / 3) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, roadY);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
        
        // Road edges
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(200, roadY);
        this.ctx.lineTo(200, this.canvas.height);
        this.ctx.moveTo(600, roadY);
        this.ctx.lineTo(600, this.canvas.height);
        this.ctx.stroke();
    }
    
    renderScenery() {
        this.scenery.forEach(item => {
            if (item.type === 'tree') {
                this.renderTree(item.x, this.canvas.height * 0.6, item.color);
            }
        });
    }
    
        renderTree(x, y, color) {
        // Tree trunk
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x - 5, y - 40, 10, 40);
        
        // Tree foliage
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 40, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Additional foliage layers for depth
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x - 10, y - 35, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y - 35, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderRoadSigns() {
        this.roadSigns.forEach(sign => {
            const screenY = this.canvas.height * 0.6 - 80;
            
            // Sign post
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(sign.x - 3, screenY, 6, 80);
            
            // Sign board
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(sign.x - 40, screenY - 30, 80, 25);
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(sign.x - 40, screenY - 30, 80, 25);
            
            // Sign text
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(sign.text, sign.x, screenY - 12);
        });
    }
    
    renderAICars() {
        this.aiCars.forEach(car => {
            this.renderCar(car.x, car.y - this.camera.y, car.width, car.height, car.color, 'AI-' + Math.floor(Math.random() * 999));
        });
    }
    
    renderPlayer() {
        this.renderCar(this.player.x, this.player.y - this.camera.y, this.player.width, this.player.height, this.player.color, this.player.plateNumber);
    }
    
    renderCar(x, y, width, height, color, plateNumber) {
        // Car body
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x - width/2, y - height/2, width, height);
        
        // Car windows
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(x - width/2 + 5, y - height/2 + 5, width - 10, height/3);
        this.ctx.fillRect(x - width/2 + 5, y - height/2 + height/2, width - 10, height/3);
        
        // Car wheels
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(x - width/3, y - height/2 + 10, 5, 0, Math.PI * 2);
        this.ctx.arc(x + width/3, y - height/2 + 10, 5, 0, Math.PI * 2);
        this.ctx.arc(x - width/3, y + height/2 - 10, 5, 0, Math.PI * 2);
        this.ctx.arc(x + width/3, y + height/2 - 10, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // License plate
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x - width/2 + 5, y + height/2 - 15, width - 10, 10);
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - width/2 + 5, y + height/2 - 15, width - 10, 10);
        
        // Plate number
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(plateNumber, x, y + height/2 - 7);
    }
    
    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new FutureSkillsDrive();
});

// Additional utility functions for procedural generation
class ProceduralGenerator {
    static generateRoadCurve(distance) {
        return Math.sin(distance * 0.01) * 0.5 + Math.cos(distance * 0.007) * 0.3;
    }
    
    static generateHillHeight(distance) {
        return Math.sin(distance * 0.005) * 100 + Math.cos(distance * 0.003) * 50;
    }
    
    static generateTreeColor() {
        const hue = 120 + Math.random() * 60; // Green variations
        const saturation = 60 + Math.random() * 20;
        const lightness = 30 + Math.random() * 20;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    static generateCarColor() {
        const hue = Math.random() * 360;
        const saturation = 60 + Math.random() * 30;
        const lightness = 40 + Math.random() * 30;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    static generateObstacle(x, y) {
        const types = ['cone', 'pothole', 'barrier'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        return {
            type: type,
            x: x,
            y: y,
            width: 20,
            height: 20,
            color: type === 'cone' ? '#FF6600' : type === 'pothole' ? '#333333' : '#FF0000'
        };
    }
    
    static generateSignMessage(stage) {
        const messages = {
            1: [
                "Welcome to Rwanda!",
                "Drive Safe - AI Ahead",
                "Stage 1: Kigali City",
                "Visit Rwanda - Land of a Thousand Hills"
            ],
            2: [
                "Stage 2: Digital Highway",
                "Innovation Hub Ahead",
                "Beware: Increased Traffic",
                "Refuel with Rwandan Coffee!"
            ],
            3: [
                "Stage 3: Final Stretch",
                "Magic Garden - 500m",
                "Digital Horizon Ahead",
                "Almost There - Stay Focused!"
            ]
        };
        
        const stageMessages = messages[stage] || messages[1];
        return stageMessages[Math.floor(Math.random() * stageMessages.length)];
    }
}

// Enhanced HUD with sinusoidal animation
class AnimatedHUD {
    constructor() {
        this.time = 0;
        this.bannerElement = document.getElementById('banner');
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        // Animate banner with sinusoidal function
        if (this.bannerElement) {
            const offset = Math.sin(this.time * 2) * 5;
            this.bannerElement.style.transform = `translateX(-50%) translateY(${offset}px)`;
        }
        
        // Animate speedometer glow
        const speedElement = document.getElementById('speedometer');
        if (speedElement) {
            const intensity = 0.5 + Math.sin(this.time * 3) * 0.3;
            speedElement.style.textShadow = `0 0 ${10 * intensity}px #00ff00`;
        }
    }
}

// Weather effects system
class WeatherSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.weatherType = 'clear'; // clear, rain, fog
    }
    
    setWeather(type) {
        this.weatherType = type;
        this.particles = [];
        
        if (type === 'rain') {
            for (let i = 0; i < 100; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    speed: 5 + Math.random() * 5,
                    length: 10 + Math.random() * 10
                });
            }
        }
    }
    
    update(deltaTime) {
        if (this.weatherType === 'rain') {
            this.particles.forEach(particle => {
                particle.y += particle.speed;
                if (particle.y > this.canvas.height) {
                    particle.y = -particle.length;
                    particle.x = Math.random() * this.canvas.width;
                }
            });
        }
    }
    
    render() {
        if (this.weatherType === 'rain') {
            this.ctx.strokeStyle = 'rgba(200, 200, 255, 0.6)';
            this.ctx.lineWidth = 1;
            
            this.particles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(particle.x - 2, particle.y - particle.length);
                this.ctx.stroke();
            });
        } else if (this.weatherType === 'fog') {
            this.ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// Performance monitor for optimization
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.fps = 0;
    }
    
    update(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
            
            // Log performance warnings
            if (this.fps < 30) {
                console.warn('Low FPS detected:', this.fps);
            }
        }
    }
    
    getFPS() {
        return this.fps;
    }
}
