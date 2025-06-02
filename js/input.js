// Input handling system
class InputHandler {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        
        // Input state
        this.input = {
            left: false,
            right: false,
            accelerate: false,
            brake: false,
            pause: false,
            radio: false,
            freeRide: false
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.updateInputState();
            
            // Handle special keys
            switch(e.code) {
                case 'Escape':
                    this.input.pause = true;
                    break;
                case 'KeyR':
                    this.input.radio = true;
                    break;
                case 'KeyF':
                    this.input.freeRide = true;
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.updateInputState();
            
            // Reset special keys
            switch(e.code) {
                case 'Escape':
                    this.input.pause = false;
                    break;
                case 'KeyR':
                    this.input.radio = false;
                    break;
                case 'KeyF':
                    this.input.freeRide = false;
                    break;
            }
        });
        
        // Mouse events for alternative steering
        document.addEventListener('mousemove', (e) => {
            const rect = document.getElementById('gameCanvas').getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        document.addEventListener('mousedown', (e) => {
            this.mouse.down = true;
        });
        
        document.addEventListener('mouseup', (e) => {
            this.mouse.down = false;
        });
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    updateInputState() {
        // Arrow keys or WASD
        this.input.left = this.keys['ArrowLeft'] || this.keys['KeyA'];
        this.input.right = this.keys['ArrowRight'] || this.keys['KeyD'];
        this.input.accelerate = this.keys['ArrowUp'] || this.keys['KeyW'];
        this.input.brake = this.keys['ArrowDown'] || this.keys['KeyS'] || this.keys['Space'];
    }
    
    // Get mouse steering input (-1 to 1)
    getMouseSteering(canvasWidth) {
        const centerX = canvasWidth / 2;
        const mouseOffset = this.mouse.x - centerX;
        const maxOffset = canvasWidth * 0.3; // 30% of canvas width for full steering
        
        return Utils.clamp(mouseOffset / maxOffset, -1, 1);
    }
    
    // Reset input state
    reset() {
        this.keys = {};
        this.input = {
            left: false,
            right: false,
            accelerate: false,
            brake: false,
            pause: false,
            radio: false,
            freeRide: false
        };
    }
}