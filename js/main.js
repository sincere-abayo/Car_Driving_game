// Main game loop and initialization
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.lastTime = 0;
        this.running = false;
        
        // Initialize game systems
        this.gameState = new GameState();
        this.renderer = new Renderer(this.canvas);
        this.input = new InputHandler();
        this.road = new Road();
        
        // Initialize player car
        this.player = new Car(0, 0, 0, true);
        this.gameState.player = this.player;
        this.gameState.road = this.road;
        this.gameState.renderer = this.renderer;
        this.gameState.input = this.input;
        
        // AI cars
        this.aiCars = [];
        this.gameState.aiCars = this.aiCars;
        
        // Camera settings
        this.camera = {
            x: 0,
            y: 1000,
            z: 0,
            followDistance: 500
        };
        
        // Performance monitoring
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        this.init();
    }
    
    init() {
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Start game loop
        this.start();
        
        console.log('Future Skills Drive initialized!');
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.renderer.width = this.canvas.width;
        this.renderer.height = this.canvas.height;
        this.renderer.camera.horizon = this.canvas.height / 2;
    }
    
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stop() {
        this.running = false;
    }
    
    gameLoop() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Cap delta time to prevent large jumps
        const cappedDeltaTime = Math.min(deltaTime, 1/30);
        
        this.update(cappedDeltaTime);
        this.render();
        
        // Calculate FPS
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate > 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Handle input
        this.gameState.handleInput(this.input.input);
        
        // Only update game objects when playing
        if (this.gameState.currentState === 'playing') {
            // Update player
            this.player.update(deltaTime, this.road, this.input.input);
            
            // Update AI cars
            this.aiCars.forEach(car => {
                car.update(deltaTime, this.road);
                
                // Check collision with player
                if (car.checkCollision(this.player)) {
                    this.handleCollision(this.player, car);
                }
                
                // Remove cars that are too far behind
                if (car.z < this.player.z - 2000) {
                    this.respawnAICar(car);
                }
            });
            
            // Update camera to follow player
            this.updateCamera();
            
            // Extend road if needed
            this.road.extendRoad(this.player.z);
            
            // Spawn new AI cars periodically
            this.manageAICars();
        }
        
        // Update game state
        this.gameState.update(deltaTime);
    }
    
    updateCamera() {
        // Smooth camera following
        const targetX = this.player.x;
        const targetZ = this.player.z - this.camera.followDistance;
        
        this.camera.x = Utils.lerp(this.camera.x, targetX, 0.1);
        this.camera.z = Utils.lerp(this.camera.z, targetZ, 0.1);
        
        // Apply road curve to camera
        const currentSegment = this.road.getCurrentSegment(this.camera.z);
        if (currentSegment) {
            this.camera.x += currentSegment.curve * 0.3;
        }
    }
    
    manageAICars() {
        // Maintain a certain number of AI cars
        const targetCarCount = 5 + this.gameState.stage * 2;
        
        while (this.aiCars.length < targetCarCount) {
            this.spawnAICar();
        }
    }
    
    spawnAICar() {
        const car = new Car(
            Utils.random(-800, 800),
            0,
            this.player.z + Utils.random(500, 2000),
            false
        );
        this.aiCars.push(car);
    }
    
    respawnAICar(car) {
        car.x = Utils.random(-800, 800);
        car.z = this.player.z + Utils.random(1000, 2000);
        car.speed = Utils.random(80, 150);
        car.crashed = false;
        car.color = Utils.randomColor();
    }
    
    handleCollision(car1, car2) {
        // Both cars crash
        car1.crash();
        car2.crash();
        
        // Player loses a life
        if (car1.isPlayer) {
            this.gameState.lives--;
            if (this.gameState.lives <= 0 && !this.gameState.freeRideMode) {
                this.gameState.setState('gameOver');
            }
        }
        
        console.log('Collision detected!');
    }
    
    render() {
        // Clear canvas
        this.renderer.clear();
        
        if (this.gameState.currentState === 'playing' || this.gameState.currentState === 'paused') {
            // Draw sky and ground
            this.renderer.drawSky();
            this.renderer.drawGround();
            
            // Update renderer camera position
            this.renderer.camera.distance = this.camera.z;
            
            // Get visible road segments
            const visibleSegments = this.road.getVisibleSegments(this.camera.z, this.renderer.drawDistance);
            
            // Draw road segments (back to front)
            visibleSegments.forEach((segment, index) => {
                const prevSegment = index > 0 ? visibleSegments[index - 1] : segment;
                this.renderer.drawSegment(segment, prevSegment);
            });
            
            // Draw scenery objects
            this.renderScenery();
            
            // Draw cars (sort by z-distance for proper depth)
            const allCars = [this.player, ...this.aiCars];
            allCars.sort((a, b) => b.z - a.z);
            
            console.log(`Rendering ${allCars.length} cars`);
            
            allCars.forEach((car, index) => {
                // Calculate relative position to camera
                const relativeX = car.x - this.camera.x;
                const relativeZ = car.z - this.camera.z;
                
                console.log(`Car ${index}: world(${car.x}, ${car.z}) relative(${relativeX}, ${relativeZ}) camera(${this.camera.x}, ${this.camera.z})`);
                
                // Only render cars within reasonable distance
                if (relativeZ > -200 && relativeZ < 2000) {
                    const carInfo = this.renderer.drawCar(
                        relativeX,
                        car.y,
                        relativeZ,
                        car.color,
                        car.plateNumber,
                        car.year
                    );
                    
                    if (carInfo) {
                        console.log(`Car ${index} rendered at screen position: ${carInfo.x}, ${carInfo.y}`);
                    }
                } else {
                    console.log(`Car ${index} outside render distance: ${relativeZ}`);
                }
            });
            
            // Draw HUD overlay
            this.renderHUD();
            
            // Draw pause overlay if paused
            if (this.gameState.currentState === 'paused') {
                this.renderPauseOverlay();
            }
        }
    }
    
    renderScenery() {
        // Draw trees
        this.road.trees.forEach(tree => {
            const relativeZ = tree.z - this.camera.z;
            if (relativeZ > -200 && relativeZ < 2000) {
                this.renderer.drawTree(
                    tree.x - this.camera.x,
                    tree.y,
                    relativeZ,
                    tree.type
                );
            }
        });
        
        // Draw signs
        this.road.signs.forEach(sign => {
            const relativeZ = sign.z - this.camera.z;
            if (relativeZ > -200 && relativeZ < 1000) {
                this.renderer.drawSign(
                    sign.x - this.camera.x,
                    sign.y,
                    relativeZ,
                    sign.message
                );
            }
        });
        
        // Draw advertising posts
        this.road.adPosts.forEach(post => {
            const relativeZ = post.z - this.camera.z;
            if (relativeZ > -200 && relativeZ < 1000) {
                this.renderer.drawAdPost(
                    post.x - this.camera.x,
                    post.y,
                    relativeZ,
                    post.message,
                    post.color
                );
            }
        });
    }
    
    renderHUD() {
        const ctx = this.renderer.ctx;
        
        // Semi-transparent overlay for HUD
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, this.canvas.width, 100);
        ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);
        
        // Speed indicator
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Speed: ${Math.round(this.player.speed)} km/h`, 20, 40);
        
        // Distance
        ctx.fillText(`Distance: ${Utils.formatDistance(this.gameState.distance)}`, 20, 70);
        
        // Stage info
        ctx.textAlign = 'center';
        ctx.fillText(`Stage ${this.gameState.stage}: ${this.road.getStageName(this.gameState.stage)}`, this.canvas.width / 2, 40);
        
        // Lives (if not in free ride mode)
        if (!this.gameState.freeRideMode) {
            ctx.fillText(`Lives: ${this.gameState.lives}`, this.canvas.width / 2, 70);
        } else {
            ctx.fillStyle = '#00FF00';
            ctx.fillText('FREE RIDE MODE', this.canvas.width / 2, 70);
        }
        
        // Time and score
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        ctx.fillText(`Time: ${Utils.formatTime(this.gameState.time)}`, this.canvas.width - 20, 40);
        ctx.fillText(`Score: ${this.gameState.score}`, this.canvas.width - 20, 70);
        
        // FPS counter (bottom right)
        ctx.font = '16px Arial';
        ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 20, this.canvas.height - 20);
        
        // Debug info (bottom center)
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFF00';
        ctx.fillText(`Cars: ${this.aiCars.length + 1} | Player: (${Math.round(this.player.x)}, ${Math.round(this.player.z)}) | Camera: (${Math.round(this.camera.x)}, ${Math.round(this.camera.z)})`, this.canvas.width / 2, this.canvas.height - 50);
        
        // Controls hint (bottom left)
        ctx.textAlign = 'left';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText('WASD/Arrows: Drive | ESC: Pause | R: Radio | F: Free Ride', 20, this.canvas.height - 20);
    }
    
    renderPauseOverlay() {
        const ctx = this.renderer.ctx;
        
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pause text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
