// Road generation and management system
class Road {
    constructor() {
        this.segments = [];
        this.segmentLength = 200;
        this.totalSegments = 1000;
        this.lastZ = 0;
        
        // Road generation parameters
        this.curviness = 0.01;
        this.hilliness = 0.005;
        this.segmentColors = {
            light: { road: '#666666', grass: '#90EE90', rumble: '#FFFFFF' },
            dark: { road: '#555555', grass: '#228B22', rumble: '#FF0000' }
        };
        
        // Scenery objects
        this.trees = [];
        this.signs = [];
        this.adPosts = [];
        
        this.generateInitialRoad();
        this.generateScenery();
    }
    
    // Generate initial road segments
    generateInitialRoad() {
        let curve = 0;
        let hill = 0;
        
        for (let i = 0; i < this.totalSegments; i++) {
            const z = i * this.segmentLength;
            
            // Generate curves using noise and sine functions
            curve += Utils.generateRoadCurve(z, this.curviness, 2);
            curve *= 0.95; // Damping
            
            // Generate hills
            hill += Utils.generateHill(z, this.hilliness, 1);
            hill *= 0.95; // Damping
            
            // Alternate segment colors for visual effect
            const color = (Math.floor(i / 3) % 2) ? this.segmentColors.light : this.segmentColors.dark;
            
            this.segments.push({
                index: i,
                z: z,
                curve: curve,
                hill: hill,
                color: color,
                objects: []
            });
        }
        
        this.lastZ = this.totalSegments * this.segmentLength;
    }
    
    // Generate scenery objects
    generateScenery() {
        const signMessages = [
            "Welcome to Rwanda!",
            "Stage 1: Kigali Ahead",
            "Stage 2: Rulindo District",
            "Stage 3: Digital Horizon",
            "Beware of AI cars!",
            "Speed Limit 120 km/h",
            "Magic Garden 500m"
        ];
        
        const adMessages = [
            "Visit Rwanda",
            "Rwanda's Innovation Hub",
            "Refuel with Rwandan Coffee!",
            "Future Skills Drive",
            "RTB Competition 2025",
            "Digital Rwanda Vision"
        ];
        
        // Generate trees
        for (let i = 0; i < 200; i++) {
            const z = Utils.random(0, this.lastZ);
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * Utils.random(1200, 2000);
            const type = Math.random() > 0.3 ? 'palm' : 'regular';
            
            this.trees.push({ x, y: 0, z, type });
        }
        
        // Generate road signs
        for (let i = 0; i < 15; i++) {
            const z = (i + 1) * (this.lastZ / 16);
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * Utils.random(600, 800);
            const message = signMessages[i % signMessages.length];
            
            this.signs.push({ x, y: 0, z, message });
        }
        
        // Generate advertising posts
        for (let i = 0; i < 10; i++) {
            const z = Utils.random(1000, this.lastZ - 1000);
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * Utils.random(800, 1500);
            const message = adMessages[i % adMessages.length];
            const color = Utils.randomColor();
            
            this.adPosts.push({ x, y: 0, z, message, color });
        }
    }
    
    // Get current road segment based on position
    getCurrentSegment(z) {
        const index = Math.floor(z / this.segmentLength);
        return this.segments[index] || this.segments[this.segments.length - 1];
    }
    
    // Get road curve at specific position
    getCurveAt(z) {
        const segment = this.getCurrentSegment(z);
        return segment ? segment.curve : 0;
    }
    
    // Get road hill at specific position
    getHillAt(z) {
        const segment = this.getCurrentSegment(z);
        return segment ? segment.hill : 0;
    }
    
    // Extend road dynamically (for infinite mode)
    extendRoad(playerZ) {
        const segmentsAhead = 100;
        const neededZ = playerZ + (segmentsAhead * this.segmentLength);
        
        if (neededZ > this.lastZ) {
            const newSegments = Math.ceil((neededZ - this.lastZ) / this.segmentLength);
            
            for (let i = 0; i < newSegments; i++) {
                const index = this.segments.length;
                const z = this.lastZ + (i * this.segmentLength);
                
                                // Continue curve and hill generation
                const lastSegment = this.segments[this.segments.length - 1];
                let curve = lastSegment.curve + Utils.generateRoadCurve(z, this.curviness, 2);
                curve *= 0.95;
                
                let hill = lastSegment.hill + Utils.generateHill(z, this.hilliness, 1);
                hill *= 0.95;
                
                const color = (Math.floor(index / 3) % 2) ? this.segmentColors.light : this.segmentColors.dark;
                
                this.segments.push({
                    index: index,
                    z: z,
                    curve: curve,
                    hill: hill,
                    color: color,
                    objects: []
                });
            }
            
            this.lastZ = neededZ;
        }
    }
    
    // Get visible segments for rendering
    getVisibleSegments(cameraZ, drawDistance) {
        const startIndex = Math.max(0, Math.floor(cameraZ / this.segmentLength) - 5);
        const endIndex = Math.min(this.segments.length - 1, startIndex + drawDistance);
        
        return this.segments.slice(startIndex, endIndex + 1);
    }
    
    // Get stage based on distance
    getStage(distance) {
        if (distance < 5000) return 1;
        if (distance < 10000) return 2;
        if (distance < 15000) return 3;
        return 4; // Magic Garden
    }
    
    // Get stage name
    getStageName(stage) {
        const stageNames = {
            1: "Kigali City",
            2: "Rulindo District", 
            3: "Digital Horizon",
            4: "Magic Garden"
        };
        return stageNames[stage] || "Unknown";
    }
}
