// Utility functions for the game
class Utils {
    // Linear interpolation
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Clamp value between min and max
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    // Generate random number between min and max
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Generate random integer between min and max (inclusive)
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Distance between two points
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Normalize angle to 0-2π range
    static normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }
    
    // Convert degrees to radians
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    
    // Convert radians to degrees
    static toDegrees(radians) {
        return radians * 180 / Math.PI;
    }
    
    // Sinusoidal animation function for HUD elements
    static sinusoidalAnimation(time, amplitude = 1, frequency = 1, phase = 0) {
        return amplitude * Math.sin(frequency * time + phase);
    }
    
    // Noise function for procedural generation (simplified Perlin-like)
    static noise(x, y = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1; // Return value between -1 and 1
    }
    
    // Generate procedural road curve using sine waves
    static generateRoadCurve(distance, frequency = 0.01, amplitude = 100) {
        return Math.sin(distance * frequency) * amplitude;
    }
    
    // Generate procedural hills
    static generateHill(distance, frequency = 0.005, amplitude = 50) {
        return Math.sin(distance * frequency) * amplitude;
    }
    
    // Color interpolation
    static colorLerp(color1, color2, factor) {
        const r1 = parseInt(color1.substr(1, 2), 16);
        const g1 = parseInt(color1.substr(3, 2), 16);
        const b1 = parseInt(color1.substr(5, 2), 16);
        
        const r2 = parseInt(color2.substr(1, 2), 16);
        const g2 = parseInt(color2.substr(3, 2), 16);
        const b2 = parseInt(color2.substr(5, 2), 16);
        
        const r = Math.round(Utils.lerp(r1, r2, factor));
        const g = Math.round(Utils.lerp(g1, g2, factor));
        const b = Math.round(Utils.lerp(b1, b2, factor));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // Format time as MM:SS
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Format distance with appropriate units
    static formatDistance(meters) {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)}km`;
        }
        return `${Math.round(meters)}m`;
    }
    
    // Check if two rectangles intersect (for collision detection)
    static rectIntersect(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // Generate random color
    static randomColor() {
        const colors = ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C', '#EF476F'];
        return colors[Utils.randomInt(0, colors.length - 1)];
    }
    
    // Easing functions for smooth animations
    static easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    static easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}
