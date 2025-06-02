// Car class for player and AI vehicles
class Car {
    constructor(x = 0, y = 0, z = 0, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.speed = 0;
        this.maxSpeed = isPlayer ? 300 : Utils.random(80, 150); // km/h
        this.acceleration = isPlayer ? 200 : 100;
        this.deceleration = 300;
        this.turnSpeed = 0;
        this.maxTurnSpeed = 5;
        
        // Visual properties
        this.color = isPlayer ? '#FF0000' : Utils.randomColor();
        this.width = 80;
        this.height = 40;
        this.length = 120;
        
        // Player specific
        this.isPlayer = isPlayer;
        this.plateNumber = isPlayer ? 'FUTUR-KG' : null;
        this.year = isPlayer ? '2025' : null;
        
        // AI specific
        this.lane = isPlayer ? 0 : Utils.randomInt(-1, 1); // -1 left, 0 center, 1 right
        this.targetLane = this.lane;
        this.laneChangeTimer = 0;
        this.laneChangeDelay = Utils.random(3, 8); // seconds
        
        // Physics
        this.friction = 0.9;
        this.offRoadFriction = 0.7;
        this.crashed = false;
        this.crashTimer = 0;
    }
    
    // Update car physics and AI
    update(deltaTime, road, input = null) {
        if (this.crashed) {
            this.crashTimer -= deltaTime;
            if (this.crashTimer <= 0) {
                this.crashed = false;
                this.speed = Math.max(0, this.speed * 0.5);
            }
            return;
        }
        
        if (this.isPlayer) {
            this.updatePlayer(deltaTime, input);
        } else {
            this.updateAI(deltaTime, road);
        }
        
        // Apply movement
        this.z += this.speed * deltaTime / 3.6; // Convert km/h to m/s
        this.x += this.turnSpeed * deltaTime * 100;
        
        // Apply friction
        this.speed *= this.friction;
        this.turnSpeed *= 0.8;
        
        // Check road bounds and apply off-road penalty
        const roadWidth = 1000; // Half road width
        if (Math.abs(this.x) > roadWidth) {
            this.speed *= this.offRoadFriction;
            this.x = Utils.clamp(this.x, -roadWidth * 1.2, roadWidth * 1.2);
        }
    }
    
    // Update player car
    updatePlayer(deltaTime, input) {
        if (!input) return;
        
        // Acceleration/Deceleration
        if (input.accelerate && !input.brake) {
            this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration * deltaTime);
        } else if (input.brake) {
            this.speed = Math.max(0, this.speed - this.deceleration * deltaTime);
        } else {
            // Natural deceleration when no input
            this.speed = Math.max(0, this.speed - 50 * deltaTime);
        }
        
        // Steering (speed affects turning responsiveness)
        const speedFactor = Math.min(1, this.speed / 100);
        if (input.left) {
            this.turnSpeed = Math.max(-this.maxTurnSpeed, this.turnSpeed - 10 * deltaTime * speedFactor);
        }
        if (input.right) {
            this.turnSpeed = Math.min(this.maxTurnSpeed, this.turnSpeed + 10 * deltaTime * speedFactor);
        }
    }
    
    // Update AI car
    updateAI(deltaTime, road) {
        // Basic AI: maintain speed and occasionally change lanes
        const targetSpeed = this.maxSpeed * Utils.random(0.7, 1.0);
        
        if (this.speed < targetSpeed) {
            this.speed = Math.min(targetSpeed, this.speed + this.acceleration * deltaTime);
        } else {
            this.speed = Math.max(targetSpeed, this.speed - 50 * deltaTime);
        }
        
        // Lane changing logic
        this.laneChangeTimer += deltaTime;
        if (this.laneChangeTimer > this.laneChangeDelay) {
            this.targetLane = Utils.randomInt(-1, 1);
            this.laneChangeTimer = 0;
            this.laneChangeDelay = Utils.random(3, 8);
        }
        
        // Move towards target lane
        const laneWidth = 300;
        const targetX = this.targetLane * laneWidth;
        const laneError = targetX - this.x;
        
        if (Math.abs(laneError) > 10) {
            this.turnSpeed = Utils.clamp(laneError * 0.01, -this.maxTurnSpeed, this.maxTurnSpeed);
        }
        
        // Add some road curve following
        if (road && road.segments.length > 0) {
            const currentSegment = road.getCurrentSegment(this.z);
            if (currentSegment) {
                this.x += currentSegment.curve * 0.001;
            }
        }
    }
    
    // Check collision with another car
    checkCollision(otherCar) {
        const dx = this.x - otherCar.x;
        const dz = this.z - otherCar.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        const collisionDistance = (this.length + otherCar.length) / 2;
        
        if (distance < collisionDistance && Math.abs(dx) < (this.width + otherCar.width) / 2) {
            return true;
        }
        return false;
    }
    
    // Handle crash
    crash() {
        this.crashed = true;
        this.crashTimer = 2.0; // 2 seconds crash duration
        this.speed *= 0.3; // Reduce speed significantly
        this.turnSpeed = Utils.random(-2, 2); // Random spin
    }
    
    // Get car bounds for collision detection
    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.z - this.length / 2,
            width: this.width,
            height: this.length
        };
    }
    
    // Reset car position (for respawn)
    reset(x = 0, z = 0) {
        this.x = x;
        this.z = z;
        this.speed = 0;
        this.turnSpeed = 0;
        this.crashed = false;
        this.crashTimer = 0;
    }
}