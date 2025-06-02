// 3D-like rendering system for the racing game
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Camera settings
        this.camera = {
            height: 1000,
            depth: 1 / Math.tan(Utils.toRadians(30)), // FOV 60 degrees
            horizon: this.height / 2,
            distance: 0
        };
        
        // Road settings
        this.roadWidth = 2000;
        this.segmentLength = 200;
        this.drawDistance = 300;
    }
    
    // Clear the canvas
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    // Draw sky gradient
    drawSky() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.camera.horizon);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#B0E0E6'); // Light sky blue
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.camera.horizon);
    }
    
    // Draw ground
    drawGround() {
        const gradient = this.ctx.createLinearGradient(0, this.camera.horizon, 0, this.height);
        gradient.addColorStop(0, '#90EE90'); // Light green
        gradient.addColorStop(1, '#228B22'); // Forest green
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.camera.horizon, this.width, this.height - this.camera.horizon);
    }
    
    // Project 3D world coordinates to 2D screen coordinates
    project(x, y, z) {
        // Prevent division by zero or negative z
        if (z <= 0) {
            return { x: 0, y: 0, w: 0, scale: 0 };
        }
        
        const scale = this.camera.depth / z;
        const projectedX = (this.width / 2) + (scale * x);
        const projectedY = this.camera.horizon - (scale * y);
        const projectedW = scale * this.roadWidth;
        
        return { x: projectedX, y: projectedY, w: projectedW, scale: scale };
    }
    
    // Draw a road segment
    drawSegment(segment, prevSegment) {
        const p1 = this.project(segment.curve, segment.hill, segment.z);
        const p2 = this.project(segment.curve, segment.hill, segment.z + this.segmentLength);
        
        if (p1.scale <= 0 || p2.scale <= 0) return;
        
        // Road surface
        this.drawQuad(
            p1.x - p1.w/2, p1.y,
            p1.x + p1.w/2, p1.y,
            p2.x + p2.w/2, p2.y,
            p2.x - p2.w/2, p2.y,
            segment.color.road
        );
        
        // Road markings
        const markingWidth = p1.w * 0.05;
        
        // Center line (dashed)
        if (Math.floor(segment.index / 3) % 2) {
            this.drawQuad(
                p1.x - markingWidth/2, p1.y,
                p1.x + markingWidth/2, p1.y,
                p2.x + markingWidth/2, p2.y,
                p2.x - markingWidth/2, p2.y,
                '#FFFFFF'
            );
        }
        
        // Side lines
        this.drawQuad(
            p1.x - p1.w/2, p1.y,
            p1.x - p1.w/2 + markingWidth, p1.y,
            p2.x - p2.w/2 + markingWidth, p2.y,
            p2.x - p2.w/2, p2.y,
            '#FFFFFF'
        );
        
        this.drawQuad(
            p1.x + p1.w/2 - markingWidth, p1.y,
            p1.x + p1.w/2, p1.y,
            p2.x + p2.w/2, p2.y,
            p2.x + p2.w/2 - markingWidth, p2.y,
            '#FFFFFF'
        );
    }
    
    // Draw a quadrilateral
    drawQuad(x1, y1, x2, y2, x3, y3, x4, y4, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.lineTo(x4, y4);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    // Draw a 3D car - FIXED VERSION
    drawCar(x, y, z, color = '#FF0000', plateNumber = null, year = null) {
        // Debug logging
        console.log(`Drawing car at: x=${x}, y=${y}, z=${z}, color=${color}`);
        
        const p = this.project(x, y, z);
        
        // Debug projection
        console.log(`Projected: x=${p.x}, y=${p.y}, scale=${p.scale}`);
        
        // More lenient visibility check
        if (p.scale <= 0.001 || p.scale > 10) {
            console.log(`Car not visible: scale=${p.scale}`);
            return;
        }
        
        // Check if car is within screen bounds (with margin)
        if (p.x < -200 || p.x > this.width + 200) {
            console.log(`Car outside screen bounds: x=${p.x}`);
            return;
        }
        
        const carWidth = Math.max(4, p.scale * 80);
        const carHeight = Math.max(3, p.scale * 40);
        
        console.log(`Car dimensions: width=${carWidth}, height=${carHeight}`);
        
        // Car body (main rectangle)
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            p.x - carWidth/2, 
            p.y - carHeight, 
            carWidth, 
            carHeight
        );
        
        // Car roof (slightly smaller and darker)
        if (carWidth > 8) { // Only draw details if car is big enough
            this.ctx.fillStyle = Utils.colorLerp(color, '#000000', 0.3);
            const roofWidth = carWidth * 0.7;
            const roofHeight = carHeight * 0.4;
            this.ctx.fillRect(
                p.x - roofWidth/2, 
                p.y - carHeight, 
                roofWidth, 
                roofHeight
            );
            
            // Windows
            this.ctx.fillStyle = '#87CEEB';
            const windowWidth = roofWidth * 0.8;
            const windowHeight = roofHeight * 0.7;
            this.ctx.fillRect(
                p.x - windowWidth/2, 
                p.y - carHeight + 2, 
                windowWidth, 
                windowHeight
            );
            
            // Wheels
            this.ctx.fillStyle = '#333333';
            const wheelSize = Math.max(2, carWidth * 0.15);
            this.ctx.fillRect(p.x - carWidth/3, p.y - wheelSize/2, wheelSize, wheelSize);
            this.ctx.fillRect(p.x + carWidth/3 - wheelSize, p.y - wheelSize/2, wheelSize, wheelSize);
        }
        
        // License plate (only for player car when close enough)
        if (p.scale > 0.3 && plateNumber && carWidth > 20) {
            this.ctx.fillStyle = '#FFFFFF';
            const plateWidth = carWidth * 0.6;
            const plateHeight = Math.max(4, carHeight * 0.2);
            this.ctx.fillRect(p.x - plateWidth/2, p.y - plateHeight - 2, plateWidth, plateHeight);
            
            // Plate text
            if (plateHeight > 6) {
                this.ctx.fillStyle = '#000000';
                this.ctx.font = `${Math.max(6, plateHeight * 0.4)}px Arial`;
                this.ctx.textAlign = 'center';
                if (year) {
                    this.ctx.fillText(year, p.x, p.y - plateHeight/2 - 1);
                }
                this.ctx.fillText(plateNumber, p.x, p.y - 3);
            }
        }
        
        // Debug: Draw a red dot at car position
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        
        return { x: p.x, y: p.y, width: carWidth, height: carHeight, scale: p.scale };
    }
    
    // Draw trees along the roadside
    drawTree(x, y, z, type = 'palm') {
        const p = this.project(x, y, z);
        if (p.scale <= 0 || p.scale > 1) return;
        
        const treeHeight = p.scale * 200;
        const trunkWidth = p.scale * 20;
        
        // Tree trunk
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(p.x - trunkWidth/2, p.y - treeHeight, trunkWidth, treeHeight);
        
        if (type === 'palm') {
            // Palm fronds
            this.ctx.fillStyle = '#228B22';
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const frondLength = treeHeight * 0.6;
                const endX = p.x + Math.cos(angle) * frondLength;
                const endY = p.y - treeHeight + Math.sin(angle) * frondLength * 0.3;
                
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y - treeHeight);
                this.ctx.lineTo(endX, endY);
                this.ctx.lineWidth = trunkWidth * 0.3;
                this.ctx.strokeStyle = '#228B22';
                this.ctx.stroke();
            }
        } else {
            // Regular tree crown
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y - treeHeight, treeHeight * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // Draw road signs
    drawSign(x, y, z, text, color = '#FFFF00') {
        const p = this.project(x, y, z);
        if (p.scale <= 0 || p.scale > 1) return;
        
        const signWidth = p.scale * 150;
        const signHeight = p.scale * 80;
        const poleHeight = p.scale * 100;
        
        // Sign pole
        this.ctx.fillStyle = '#666666';
        this.ctx.fillRect(p.x - 2, p.y - poleHeight, 4, poleHeight);
        
        // Sign board
        this.ctx.fillStyle = color;
        this.ctx.fillRect(p.x - signWidth/2, p.y - poleHeight - signHeight, signWidth, signHeight);
        
        // Sign border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(p.x - signWidth/2, p.y - poleHeight - signHeight, signWidth, signHeight);
        
        // Sign text
        this.ctx.fillStyle = '#000000';
        this.ctx.font = `${Math.max(8, signHeight * 0.3)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, p.x, p.y - poleHeight - signHeight/2 + 5);
    }
    
    // Draw advertising posts
    drawAdPost(x, y, z, text, bgColor = '#FF6B35') {
        const p = this.project(x, y, z);
        if (p.scale <= 0 || p.scale > 1) return;
        
        const postWidth = p.scale * 200;
        const postHeight = p.scale * 120;
        const poleHeight = p.scale * 80;
        
        // Support pole
        this.ctx.fillStyle = '#444444';
        this.ctx.fillRect(p.x - 3, p.y - poleHeight, 6, poleHeight);
        
        // Ad board
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(p.x - postWidth/2, p.y - poleHeight - postHeight, postWidth, postHeight);
        
        // Border
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(p.x - postWidth/2, p.y - poleHeight - postHeight, postWidth, postHeight);
        
        // Text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `bold ${Math.max(10, postHeight * 0.2)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, p.x, p.y - poleHeight - postHeight/2 + 5);
    }
}
