class PixelArtGenerator {
    constructor() {
        this.canvas = document.getElementById('pixelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 16;
        this.pixelSize = 20;
        this.color = '#000000';
        this.isDrawing = false;
        this.isFilling = false;
        this.isErasing = false;
        
        this.init();
        this.bindEvents();
    }

    init() {
        this.adjustCanvasSize();
        this.clearCanvas();
    }

    adjustCanvasSize() {
        const maxWidth = 700; // Reduced for condensed design
        this.pixelSize = Math.floor(maxWidth / this.gridSize);
        this.canvas.width = this.gridSize * this.pixelSize;
        this.canvas.height = this.gridSize * this.pixelSize;
    }

    bindEvents() {
        document.getElementById('gridSize').addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
            this.adjustCanvasSize();
            this.clearCanvas();
        });

        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('change', (e) => {
            this.color = e.target.value;
        });

        document.getElementById('fillTool').addEventListener('click', () => {
            this.isFilling = !this.isFilling;
            this.isErasing = false;
            this.toggleToolState('fillTool', this.isFilling);
        });

        document.getElementById('eraseTool').addEventListener('click', () => {
            this.isErasing = !this.isErasing;
            this.isFilling = false;
            this.toggleToolState('eraseTool', this.isErasing);
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearCanvas();
        });

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.isDrawing = false);

        document.getElementById('exportPNG').addEventListener('click', () => this.exportPNG());
    }

    toggleToolState(toolId, isActive) {
        const btn = document.getElementById(toolId);
        btn.classList.toggle('active', isActive);
    }

    getPixelCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.pixelSize);
        const y = Math.floor((e.clientY - rect.top) / this.pixelSize);
        return { x, y };
    }

    drawPixel(x, y) {
        this.ctx.fillStyle = this.isErasing ? '#ffffff' : this.color;
        this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    }

    handleMouseDown(e) {
        this.isDrawing = true;
        const { x, y } = this.getPixelCoordinates(e);

        if (this.isFilling) {
            this.floodFill(x, y, this.ctx.getImageData(x * this.pixelSize, y * this.pixelSize, 1, 1).data);
        } else {
            this.drawPixel(x, y);
        }
    }

    handleMouseMove(e) {
        if (!this.isDrawing || this.isFilling) return;
        const { x, y } = this.getPixelCoordinates(e);
        this.drawPixel(x, y);
    }

    floodFill(x, y, targetColor) {
        const currentColor = this.ctx.getImageData(x * this.pixelSize, y * this.pixelSize, 1, 1).data;
        if (this.colorsMatch(currentColor, targetColor)) {
            this.drawPixel(x, y);
            if (x > 0) this.floodFill(x - 1, y, targetColor);
            if (x < this.gridSize - 1) this.floodFill(x + 1, y, targetColor);
            if (y > 0) this.floodFill(x, y - 1, targetColor);
            if (y < this.gridSize - 1) this.floodFill(x, y + 1, targetColor);
        }
    }

    colorsMatch(color1, color2) {
        return color1[0] === color2[0] && color1[1] === color2[1] && 
               color1[2] === color2[2] && color1[3] === color2[3];
    }

    clearCanvas() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    exportPNG() {
        const link = document.createElement('a');
        link.download = 'pixel-art.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

new PixelArtGenerator();