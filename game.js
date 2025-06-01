

class FutureSkillsDrive {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu';
        
        // Game variables
        this.player = {
            x: 400,
            y: 450,
            width: 40,
            height: 80,
            speed: 0,
            maxSpeed: 200,
            acceleration: 0,
            plateNumber: 'RWA-2025',
            color: '#ff4444',
            wheelRotation: 0,
            engineSound: 0
        };
        
        this.camera = {
            x: 0,
            y: 0,
            shake: 0
        };
        
        this.road = {
            width: 400,
            lanes: 3,
            curve: 0,
            hillHeight: 0,
            segments: [],
            centerLine: 400
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
        this.particles = [];
        
        this.keys = {};
        this.lastTime = 0;
        this.animationTime = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateInitialRoad();
        this.generateScenery();
        this.generateAICars();
        this.gameLoop();
    }
    
    setupEventListeners() {
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
        this.player.acceleration = 0;
        this.game.distance = 0;
        this.game.stage = 1;
        this.game.score = 0;
        this.game.time = 0;
        this.aiCars = [];
        this.obstacles = [];
        this.particles = [];
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
        for (let i = 0; i < 200; i++) {
            const curve = Math.sin(i * 0.02) * 0.8 + Math.cos(i * 0.015) * 0.4;
            const hill = Math.sin(i * 0.008) * 80 + Math.cos(i * 0.012) * 40;
            
            this.road.segments.push({
                curve: curve,
                hill: hill,
                y: i * 10,
                width: 400 + Math.sin(i * 0.01) * 50
            });
        }
    }
    
    generateScenery() {
        this.scenery = [];
        this.roadSigns = [];
        
        for (let i = 0; i < 100; i++) {
            // Enhanced trees with variety
            const treeTypes = ['pine', 'oak', 'palm'];
            const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
            
            this.scenery.push({
                type: 'tree',
                subType: treeType,
                x: Math.random() < 0.5 ? -250 - Math.random() * 150 : 650 + Math.random() * 150,
                y: i * 60,
                size: 0.8 + Math.random() * 0.6,
                color: `hsl(${120 + Math.random() * 60}, ${60 + Math.random() * 30}%, ${25 + Math.random() * 25}%)`,
                sway: Math.random() * Math.PI * 2
            });
            
            // Enhanced road signs
            if (i % 8 === 0) {
                const signs = [
                    "Visit Rwanda",
                    "Innovation Hub",
                    "Coffee Energy!",
                    "Digital Horizon",
                    "AI Cars Ahead!",
                    "RP",
                    "Kigali " + (50 + i * 10) + "km",
                    "Magic Garden " + Math.max(0, 1500 - i * 15) + "m"
                ];
                
                this.roadSigns.push({
                    x: Math.random() < 0.5 ? -180 : 580,
                    y: i * 60,
                    text: signs[Math.floor(Math.random() * signs.length)],
                    type: Math.random() < 0.3 ? 'billboard' : 'sign'
                });
            }
            
            // Add grass patches and rocks
            if (Math.random() < 0.3) {
                this.scenery.push({
                    type: 'grass',
                    x: -100 + Math.random() * 800,
                    y: i * 60,
                    size: 20 + Math.random() * 30,
                    color: `hsl(${100 + Math.random() * 40}, 70%, ${30 + Math.random() * 20}%)`
                });
            }
        }
    }
    
    generateAICars() {
        this.aiCars = [];
        const carModels = ['sedan', 'suv', 'truck', 'sports'];
        
        for (let i = 0; i < 8; i++) {
            const model = carModels[Math.floor(Math.random() * carModels.length)];
            const lane = Math.floor(Math.random() * 3);
            
            this.aiCars.push({
                x: 280 + lane * 80,
                y: this.player.y - 300 - i * 200,
                width: model === 'truck' ? 45 : model === 'suv' ? 42 : 38,
                height: model === 'truck' ? 90 : model === 'suv' ? 85 : 75,
                speed: 60 + Math.random() * 80,
                lane: lane,
                targetLane: lane,
                laneChangeTimer: 0,
                model: model,
                color: `hsl(${Math.random() * 360}, ${60 + Math.random() * 30}%, ${40 + Math.random() * 30}%)`,
                plateNumber: 'AI-' + Math.floor(Math.random() * 999),
                wheelRotation: 0,
                engineParticles: []
            });
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.animationTime += deltaTime;
        this.updatePlayer(deltaTime);
        this.updateAICars(deltaTime);
        this.updateCamera(deltaTime);
        this.updateGame(deltaTime);
        this.updateParticles(deltaTime);
        this.checkCollisions();
        this.updateUI();
    }
    
    updatePlayer(deltaTime) {
        // Enhanced movement controls
        let targetSpeed = 0;
        
        // Forward/Backward movement
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            targetSpeed = this.player.maxSpeed;
            this.addEngineParticles();
        } else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            targetSpeed = -this.player.maxSpeed * 0.5;
        }
        
        // Steering
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= (100 + this.player.speed * 0.5) * deltaTime;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += (100 + this.player.speed * 0.5) * deltaTime;
        }
        
        // Braking
        if (this.keys['Space']) {
            targetSpeed = 0;
            this.player.acceleration = -300;
            sounds.brake();
            this.addBrakeParticles();
        } else {
            this.player.acceleration = targetSpeed > this.player.speed ? 150 : -100;
        }
        
        // Update speed with acceleration
        this.player.speed += this.player.acceleration * deltaTime;
        this.player.speed = Math.max(-this.player.maxSpeed * 0.5, 
                                   Math.min(this.player.maxSpeed, this.player.speed));
        
        // Wheel rotation animation
        this.player.wheelRotation += this.player.speed * deltaTime * 0.1;
        
        // Keep player on road with smoother boundaries
        const roadLeft = this.road.centerLine - this.road.width/2 + 20;
        const roadRight = this.road.centerLine + this.road.width/2 - 20;
        this.player.x = Math.max(roadLeft, Math.min(roadRight, this.player.x));
        
        // Update distance based on forward speed
        if (this.player.speed > 0) {
            this.game.distance += this.player.speed * deltaTime * 0.1;
        }
        
        // Camera shake when speeding
        this.camera.shake = Math.max(0, this.player.speed - 150) * 0.02;
    }
    
    updateAICars(deltaTime) {
        this.aiCars.forEach(car => {
            // Relative movement to player
            car.y += (this.player.speed - car.speed) * deltaTime * 0.1;
            
            // Enhanced AI lane changing
            car.laneChangeTimer -= deltaTime;
            
            if (car.laneChangeTimer <= 0 && Math.random() < 0.002) {
                const newLane = Math.max(0, Math.min(2, car.lane + (Math.random() < 0.5 ? -1 : 1)));
                if (newLane !== car.lane) {
                    car.targetLane = newLane;
                    car.laneChangeTimer = 2 + Math.random() * 3;
                }
            }
            
            // Smooth lane changing
            const targetX = 280 + car.targetLane * 80;
            if (Math.abs(car.x - targetX) > 2) {
                car.x += (targetX - car.x) * deltaTime * 2;
            } else {
                car.lane = car.targetLane;
            }
            
            // Wheel rotation
            car.wheelRotation += car.speed * deltaTime * 0.1;
            
            // Add engine particles occasionally
            if (Math.random() < 0.1) {
                this.addAIEngineParticles(car);
            }
            
            // Respawn cars
            if (car.y > this.player.y + 400) {
                car.y = this.player.y - 600 - Math.random() * 300;
                car.speed = 60 + Math.random() * 80;
                car.color = `hsl(${Math.random() * 360}, ${60 + Math.random() * 30}%, ${40 + Math.random() * 30}%)`;
                car.lane = Math.floor(Math.random() * 3);
                car.targetLane = car.lane;
                car.x = 280 + car.lane * 80;
            }
        });
    }
    
    updateCamera(deltaTime) {
        this.camera.y = this.player.y - 350;
        
        // Add camera shake
        if (this.camera.shake > 0) {
            this.camera.x = (Math.random() - 0.5) * this.camera.shake;
            this.camera.y += (Math.random() - 0.5) * this.camera.shake;
        }
    }
    
        updateGame(deltaTime) {
        this.game.time += deltaTime;
        
        // Stage progression
        const newStage = Math.min(3, Math.floor(this.game.distance / 500) + 1);
        if (newStage > this.game.stage) {
            this.game.stage = newStage;
            if (this.game.stage === 3) {
                this.checkVictory();
            }
        }
        
        this.game.score = Math.floor(this.game.distance * 10 + this.player.speed * 2);
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.life -= deltaTime;
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.size *= 0.98;
            return particle.life > 0 && particle.size > 0.5;
        });
    }
    
    addEngineParticles() {
        if (Math.random() < 0.3) {
            this.particles.push({
                x: this.player.x + (Math.random() - 0.5) * 20,
                y: this.player.y + this.player.height/2,
                vx: (Math.random() - 0.5) * 50,
                vy: 50 + Math.random() * 30,
                size: 3 + Math.random() * 4,
                color: `rgba(${100 + Math.random() * 100}, ${100 + Math.random() * 100}, ${200 + Math.random() * 55}, 0.7)`,
                life: 0.5 + Math.random() * 0.5,
                type: 'exhaust'
            });
        }
    }
    
    addBrakeParticles() {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: this.player.x + (Math.random() - 0.5) * this.player.width,
                y: this.player.y + this.player.height/2,
                vx: (Math.random() - 0.5) * 100,
                vy: 20 + Math.random() * 40,
                size: 2 + Math.random() * 3,
                color: `rgba(255, ${100 + Math.random() * 100}, 0, 0.8)`,
                life: 0.3 + Math.random() * 0.4,
                type: 'brake'
            });
        }
    }
    
    addAIEngineParticles(car) {
        this.particles.push({
            x: car.x + (Math.random() - 0.5) * 15,
            y: car.y + car.height/2,
            vx: (Math.random() - 0.5) * 30,
            vy: 30 + Math.random() * 20,
            size: 2 + Math.random() * 3,
            color: `rgba(${80 + Math.random() * 80}, ${80 + Math.random() * 80}, ${150 + Math.random() * 105}, 0.5)`,
            life: 0.4 + Math.random() * 0.3,
            type: 'exhaust'
        });
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
        this.player.speed *= 0.3;
        this.game.score = Math.max(0, this.game.score - 200);
        
        // Add crash particles
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.player.x,
                y: this.player.y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                size: 5 + Math.random() * 8,
                color: `rgba(255, ${Math.random() * 100}, 0, 0.9)`,
                life: 1 + Math.random(),
                type: 'crash'
            });
        }
    }
    
    checkVictory() {
        if (this.game.distance >= 1500) {
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
    // Update both speed displays
    const speedValue = Math.floor(Math.abs(this.player.speed));
    document.getElementById('speed').textContent = speedValue;
    document.getElementById('speedDisplay').textContent = speedValue;
    
    document.getElementById('distanceValue').textContent = Math.floor(this.game.distance);
    document.getElementById('stageValue').textContent = this.game.stage;
    document.getElementById('stageDisplay').textContent = this.game.stage;
    
    // Update speedometer color based on speed
    const speedElement = document.getElementById('speedDisplay');
    const speedRatio = Math.abs(this.player.speed) / this.player.maxSpeed;
    if (speedRatio > 0.8) {
        speedElement.style.color = '#ff4444';
    } else if (speedRatio > 0.6) {
        speedElement.style.color = '#ffaa44';
    } else {
        speedElement.style.color = '#00ff00';
    }
}

    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'menu') return;
        
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        this.renderSky();
        this.renderGround();
        this.renderRoad();
        this.renderScenery();
        this.renderRoadSigns();
        this.renderParticles();
        this.renderAICars();
        this.renderPlayer();
        
        this.ctx.restore();
        
        if (this.gameState === 'paused') {
            this.renderPauseOverlay();
        }
    }
    
    renderSky() {
        const gradient = this.ctx.createLinearGradient(0, this.camera.y, 0, this.camera.y + this.canvas.height);
        
        // Dynamic sky based on stage
        if (this.game.stage === 1) {
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#98D8E8');
        } else if (this.game.stage === 2) {
            gradient.addColorStop(0, '#FFB347');
            gradient.addColorStop(1, '#87CEEB');
        } else {
            gradient.addColorStop(0, '#FF6B6B');
            gradient.addColorStop(1, '#4ECDC4');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.camera.y, this.canvas.width, this.canvas.height);
        
        // Add moving clouds
        for (let i = 0; i < 5; i++) {
            const cloudX = (this.animationTime * 20 + i * 200) % (this.canvas.width + 100) - 50;
            const cloudY = this.camera.y + 50 + i * 30;
            this.renderCloud(cloudX, cloudY, 40 + i * 10);
        }
    }
    
    renderCloud(x, y, size) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.7, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x - size * 0.7, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderGround() {
        const groundY = this.canvas.height * 0.6 + this.camera.y;
        
        // Animated grass
        const grassGradient = this.ctx.createLinearGradient(0, groundY, 0, groundY + this.canvas.height * 0.4);
        grassGradient.addColorStop(0, '#228B22');
        grassGradient.addColorStop(0.5, '#32CD32');
        grassGradient.addColorStop(1, '#006400');
        
        this.ctx.fillStyle = grassGradient;
        this.ctx.fillRect(0, groundY, this.canvas.width, this.canvas.height * 0.4);
        
        // Add grass texture
        this.ctx.fillStyle = 'rgba(0, 100, 0, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = (this.animationTime * 50 + i * 20) % this.canvas.width;
            const y = groundY + Math.sin(this.animationTime + i) * 5;
            this.ctx.fillRect(x, y, 2, 8);
        }
    }
    
    renderRoad() {
        const roadY = this.canvas.height * 0.6 + this.camera.y;
        const roadWidth = this.road.width;
        const roadLeft = this.road.centerLine - roadWidth/2;
        
        // Road surface with perspective
        const roadGradient = this.ctx.createLinearGradient(roadLeft, roadY, roadLeft + roadWidth, roadY);
        roadGradient.addColorStop(0, '#2C2C2C');
        roadGradient.addColorStop(0.5, '#404040');
        roadGradient.addColorStop(1, '#2C2C2C');
        
        this.ctx.fillStyle = roadGradient;
        this.ctx.fillRect(roadLeft, roadY, roadWidth, this.canvas.height * 0.4);
        
        // Animated lane markings
        this.ctx.strokeStyle = '#FFFF00';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([30, 30]);
        this.ctx.lineDashOffset = -this.animationTime * 100;
        
        for (let i = 1; i < 3; i++) {
            const x = roadLeft + (roadWidth / 3) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, roadY);
            this.ctx.lineTo(x, roadY + this.canvas.height * 0.4);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
        
        // Road edges with reflectors
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(roadLeft, roadY);
        this.ctx.lineTo(roadLeft, roadY + this.canvas.height * 0.4);
        this.ctx.moveTo(roadLeft + roadWidth, roadY);
        this.ctx.lineTo(roadLeft + roadWidth, roadY + this.canvas.height * 0.4);
        this.ctx.stroke();
        
        // Add road reflectors
        for (let i = 0; i < 10; i++) {
            const reflectorY = roadY + i * 50 + (this.animationTime * 50) % 50;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(roadLeft - 5, reflectorY, 3, 8);
            this.ctx.fillRect(roadLeft + roadWidth + 2, reflectorY, 3, 8);
        }
    }
    
    renderScenery() {
        this.scenery.forEach(item => {
            const screenY = item.y - this.camera.y;
            if (screenY > -100 && screenY < this.canvas.height + 100) {
                if (item.type === 'tree') {
                    this.renderEnhancedTree(item.x, this.canvas.height * 0.6, item);
                } else if (item.type === 'grass') {
                    this.renderGrassPatch(item.x, this.canvas.height * 0.6, item);
                }
            }
        });
    }
    
    renderEnhancedTree(x, y, tree) {
        this.ctx.save();
        
        // Tree sway animation
        const sway = Math.sin(this.animationTime * 2 + tree.sway) * 3;
        this.ctx.translate(x + sway, y);
        this.ctx.scale(tree.size, tree.size);
        
        if (tree.subType === 'pine') {
            // Pine tree
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(-3, -40, 6, 40);
            
            // Pine layers
            for (let i = 0; i < 4; i++) {
                this.ctx.fillStyle = tree.color;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -60 + i * 15);
                this.ctx.lineTo(-15 + i * 2, -40 + i * 15);
                this.ctx.lineTo(15 - i * 2, -40 + i * 15);
                this.ctx.closePath();
                this.ctx.fill();
            }
        } else if (tree.subType === 'palm') {
            // Palm tree
            this.ctx.fillStyle = '#DEB887';
            this.ctx.fillRect(-4, -50, 8, 50);
            
            // Palm fronds
            for (let i = 0; i < 6; i++) {
                this.ctx.save();
                this.ctx.rotate((i * Math.PI * 2 / 6) + sway * 0.1);
                this.ctx.fillStyle = tree.color;
                this.ctx.fillRect(-2, -70, 4, 30);
                               this.ctx.save();
                this.ctx.rotate((i * Math.PI * 2 / 6) + sway * 0.1);
                this.ctx.fillStyle = tree.color;
                this.ctx.fillRect(-2, -70, 4, 30);
                this.ctx.restore();
            }
        } else {
            // Oak tree (default)
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(-5, -40, 10, 40);
            
            // Tree foliage with multiple layers
            this.ctx.fillStyle = tree.color;
            this.ctx.beginPath();
            this.ctx.arc(0, -40, 25, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(-12, -35, 18, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(12, -35, 18, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    renderGrassPatch(x, y, grass) {
        this.ctx.fillStyle = grass.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, grass.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add grass blades
        for (let i = 0; i < 5; i++) {
            const bladeX = x + (Math.random() - 0.5) * grass.size;
            const bladeY = y + (Math.random() - 0.5) * grass.size * 0.5;
            this.ctx.fillRect(bladeX, bladeY, 1, 8);
        }
    }
    
    renderRoadSigns() {
        this.roadSigns.forEach(sign => {
            const screenY = sign.y - this.camera.y;
            if (screenY > -100 && screenY < this.canvas.height + 100) {
                const signY = this.canvas.height * 0.6 - 80;
                
                if (sign.type === 'billboard') {
                    this.renderBillboard(sign.x, signY, sign.text);
                } else {
                    this.renderRoadSign(sign.x, signY, sign.text);
                }
            }
        });
    }
    
    renderBillboard(x, y, text) {
        // Billboard post
        this.ctx.fillStyle = '#666666';
        this.ctx.fillRect(x - 5, y, 10, 100);
        
        // Billboard board
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x - 60, y - 40, 120, 35);
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - 60, y - 40, 120, 35);
        
        // Billboard text
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y - 18);
        
        // Add lights
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        this.ctx.arc(x - 50, y - 50, 3, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y - 50, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderRoadSign(x, y, text) {
        // Sign post
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x - 3, y, 6, 80);
        
        // Sign board
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x - 40, y - 30, 80, 25);
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 40, y - 30, 80, 25);
        
        // Sign text
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y - 12);
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            
            if (particle.type === 'exhaust') {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (particle.type === 'brake') {
                this.ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, 
                                particle.size, particle.size);
            } else if (particle.type === 'crash') {
                this.ctx.save();
                this.ctx.rotate(particle.life * 10);
                this.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
                this.ctx.restore();
            }
            
            this.ctx.restore();
        });
    }
    
    renderAICars() {
        this.aiCars.forEach(car => {
            const screenY = car.y - this.camera.y;
            if (screenY > -100 && screenY < this.canvas.height + 100) {
                this.renderEnhancedCar(car.x, screenY, car.width, car.height, car.color, 
                                     car.plateNumber, car.model, car.wheelRotation);
            }
        });
    }
    
    renderPlayer() {
        const screenY = this.player.y - this.camera.y;
        this.renderEnhancedCar(this.player.x, screenY, this.player.width, this.player.height, 
                             this.player.color, this.player.plateNumber, 'sports', this.player.wheelRotation);
    }
    
    renderEnhancedCar(x, y, width, height, color, plateNumber, model, wheelRotation) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Car shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(-width/2 + 2, -height/2 + 2, width, height);
        
        // Car body based on model
        this.ctx.fillStyle = color;
        if (model === 'truck') {
            // Truck body
            this.ctx.fillRect(-width/2, -height/2, width, height);
            // Truck cab
            this.ctx.fillRect(-width/2, -height/2, width, height/3);
        } else if (model === 'suv') {
            // SUV body (taller)
            this.ctx.fillRect(-width/2, -height/2, width, height);
            // SUV roof
            this.ctx.fillRect(-width/2 + 3, -height/2 - 5, width - 6, height/2);
        } else if (model === 'sports') {
            // Sports car (sleeker)
            this.ctx.fillRect(-width/2, -height/2 + 5, width, height - 10);
            // Sports car hood
            this.ctx.fillRect(-width/2 + 2, -height/2, width - 4, height/3);
        } else {
            // Sedan (default)
            this.ctx.fillRect(-width/2, -height/2, width, height);
        }
        
        // Car highlights
        this.ctx.fillStyle = this.lightenColor(color, 30);
        this.ctx.fillRect(-width/2, -height/2, width/3, height);
        
        // Car windows
        this.ctx.fillStyle = 'rgba(135, 206, 235, 0.8)';
        this.ctx.fillRect(-width/2 + 5, -height/2 + 5, width - 10, height/3);
        this.ctx.fillRect(-width/2 + 5, -height/2 + height/2, width - 10, height/3);
        
        // Car lights
        this.ctx.fillStyle = '#FFFF99';
        this.ctx.fillRect(-width/2, -height/2 + 2, 3, 8);
        this.ctx.fillRect(width/2 - 3, -height/2 + 2, 3, 8);
        
        // Tail lights
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fillRect(-width/2, height/2 - 10, 3, 8);
        this.ctx.fillRect(width/2 - 3, height/2 - 10, 3, 8);
        
        // Animated wheels
        this.renderWheel(-width/3, -height/2 + 12, wheelRotation);
        this.renderWheel(width/3, -height/2 + 12, wheelRotation);
        this.renderWheel(-width/3, height/2 - 12, wheelRotation);
        this.renderWheel(width/3, height/2 - 12, wheelRotation);
        
        // License plate
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(-width/2 + 5, height/2 - 15, width - 10, 10);
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-width/2 + 5, height/2 - 15, width - 10, 10);
        
        // Plate number
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(plateNumber, 0, height/2 - 7);
        
        this.ctx.restore();
    }
    
    renderWheel(x, y, rotation) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        
        // Tire
        this.ctx.fillStyle = '#222222';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rim
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Spokes
        this.ctx.strokeStyle = '#888888';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(4 * Math.cos(i * Math.PI / 2), 4 * Math.sin(i * Math.PI / 2));
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    lightenColor(color, percent) {
        // Simple color lightening function
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
            (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
            .toString(16).slice(1);
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
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.016);
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

// Enhanced utility classes
class ProceduralGenerator {
    static generateRoadCurve(distance) {
        return Math.sin(distance * 0.01) * 0.8 + Math.cos(distance * 0.007) * 0.4;
    }
    
    static generateHillHeight(distance) {
        return Math.sin(distance * 0.005) * 120 + Math.cos(distance * 0.003) * 60;
    }
    
    static generateTreeColor() {
        const hue = 120 + Math.random() * 60;
        const saturation = 60 + Math.random() * 30;
        const lightness = 25 + Math.random() * 25;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    static generateCarColor() {
        const hue = Math.random() * 360;
        const saturation = 60 + Math.random() * 30;
        const lightness = 40 + Math.random() * 30;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
}

// Enhanced HUD with better animations
class AnimatedHUD {
    constructor() {
        this.time = 0;
        this.bannerElement = document.getElementById('banner');
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        if (this.bannerElement) {
            const offset = Math.sin(this.time * 2) * 3;
            this.bannerElement.style.transform = `translateX(-50%) translateY(${offset}px)`;
        }
        
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
            
            if (this.fps < 30) {
                console.warn('Low FPS detected:', this.fps);
            }
        }
    }
    
    getFPS() {
        return this.fps;
    }
}

