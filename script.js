const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearButton');
const undoButton = document.getElementById('undoButton');
const colorPicker = document.getElementById('colorPicker');
const shapeSelector = document.getElementById('shapeSelector');
const rulerButton = document.getElementById('rulerButton');
const eraserButton = document.getElementById('eraserButton'); 
const penSizeSlider = document.getElementById('penSize');
const penSizeValue = document.getElementById('penSizeValue');


let drawing = false;
let currentPath = [];
let shapeHistory = [];  // Stack to store shapes and lines
let freehandHistory = []; // Stack to store freehand paths (drawn last on top)
let color = '#000000'; // Default color for drawing
let shapeMode = 'freehand'; // Shape mode (rectangle, circle, line)
let rulerMode = false; // To check if ruler mode is enabled
let eraserMode = false; // To check if eraser mode is enabled
let startX, startY; // For storing the starting point of shapes

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.7;

// Function to handle mouse/touch position
function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x, y };
}

// Start drawing
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    const { x, y } = getPosition(e);
    startX = x;
    startY = y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    currentPath = [{ x, y }];
});

// Touch start (mobile)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    drawing = true;
    const { x, y } = getPosition(e);
    startX = x;
    startY = y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    currentPath = [{ x, y }];
});

// Draw or erase while mouse/touch is moving
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;

    const { x, y } = getPosition(e);

    if (eraserMode) {
        // Erase the part of the canvas by clearing a small area (20x20px around the mouse)
        ctx.clearRect(x - 10, y - 10, 20, 20);
    } else if (rulerMode && shapeMode === 'freehand') {
        // Draw straight lines when ruler mode is on
        ctx.lineTo(x, y);
        ctx.stroke();
        currentPath.push({ x, y });
    } else if (shapeMode === 'freehand') {
        // Freehand drawing
        ctx.lineTo(x, y);
        ctx.stroke();
        currentPath.push({ x, y });
    } else {
        // Drawing shapes (rectangle, circle, line)
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;

        if (shapeMode === 'rectangle') {
            // Draw a rectangle
            const width = x - startX;
            const height = y - startY;
            ctx.strokeRect(startX, startY, width, height);
        } else if (shapeMode === 'circle') {
            // Draw a circle
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (shapeMode === 'line') {
            // Draw a line
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
});

// Touch move (mobile)
canvas.addEventListener('touchmove', (e) => {
    if (!drawing) return;
    e.preventDefault();

    const { x, y } = getPosition(e);

    if (eraserMode) {
        // Erase the part of the canvas by clearing a small area (20x20px around the mouse)
        ctx.clearRect(x - 10, y - 10, 20, 20);
    } else if (rulerMode && shapeMode === 'freehand') {
        // Draw straight lines when ruler mode is on
        ctx.lineTo(x, y);
        ctx.stroke();
        currentPath.push({ x, y });
    } else if (shapeMode === 'freehand') {
        // Freehand drawing
        ctx.lineTo(x, y);
        ctx.stroke();
        currentPath.push({ x, y });
    } else {
        // Drawing shapes (rectangle, circle, line)
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;

        if (shapeMode === 'rectangle') {
            const width = x - startX;
            const height = y - startY;
            ctx.strokeRect(startX, startY, width, height);
        } else if (shapeMode === 'circle') {
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (shapeMode === 'line') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    if (shapeMode === 'freehand' && !eraserMode) {
        // Save freehand path only if distinct
        if (isDistinctFreehandPath(freehandHistory, currentPath)) {
            freehandHistory.push(currentPath);  // Save the freehand path to history
        }
    } else if (shapeMode !== 'freehand' && !eraserMode) {
        // Save shapes to history
        const shape = {
            type: shapeMode,
            startX,
            startY,
            endX: currentPath[currentPath.length - 1].x,
            endY: currentPath[currentPath.length - 1].y,
            color // Add color to the shape object
        };

        if (isDistinctShape(shapeHistory, shape)) {
            shapeHistory.push(shape);  // Add the shape to history
        }
    }
    currentPath = []; // Reset the current path
});

// Touch end (mobile)
canvas.addEventListener('touchend', () => {
    drawing = false;
    if (shapeMode === 'freehand' && !eraserMode) {
        // Save freehand path only if distinct
        if (isDistinctFreehandPath(freehandHistory, currentPath)) {
            freehandHistory.push(currentPath);  // Save the freehand path to history
        }
    } else if (shapeMode !== 'freehand' && !eraserMode) {
        // Save shapes to history
        const shape = {
            type: shapeMode,
            startX,
            startY,
            endX: currentPath[currentPath.length - 1].x,
            endY: currentPath[currentPath.length - 1].y,
            color
        };
        if (isDistinctShape(shapeHistory, shape)) {
            shapeHistory.push(shape);  // Add the shape to history
        }
    }
    currentPath = []; // Reset the current path
});

undoButton.addEventListener('click', () => {
    if (freehandHistory.length > 0) {
        freehandHistory.pop();  // Remove the last freehand path
    } else if (shapeHistory.length > 0) {
        shapeHistory.pop();  // Remove the last shape from the history stack
    }
    redrawCanvas();  // Redraw the canvas from the updated history stack
});

// Clear canvas
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapeHistory = [];
    freehandHistory = [];
});

// Handle color picker input
colorPicker.addEventListener('input', (e) => {
    color = e.target.value;
    ctx.strokeStyle = color;
});

// Handle shape selector change
shapeSelector.addEventListener('change', (e) => {
    shapeMode = e.target.value;
    if (shapeMode === 'freehand') {
        rulerMode = false;
        rulerButton.style.backgroundColor = '#4CAF50';
    }
});

// Toggle ruler mode
rulerButton.addEventListener('click', () => {
    rulerMode = !rulerMode;
    rulerButton.style.backgroundColor = rulerMode ? '#ff7f00' : '#4CAF50';
});

// Toggle eraser mode
eraserButton.addEventListener('click', () => {
    eraserMode = !eraserMode;
    eraserButton.style.backgroundColor = eraserMode ? '#ff0000' : '#4CAF50';
});

// Adjust pen size
penSizeSlider.addEventListener('input', (e) => {
    const size = e.target.value;
    ctx.lineWidth = size;
    penSizeValue.textContent = size;
});

// Function to check if the current freehand path is distinct from the last one in history
function isDistinctFreehandPath(history, path) {
    if (history.length === 0) return true;  // First path is always distinct
    const lastPath = history[history.length - 1];
    if (lastPath.length !== path.length) return true;  // Different length means distinct
    // Check if paths are exactly the same
    for (let i = 0; i < path.length; i++) {
        if (lastPath[i].x !== path[i].x || lastPath[i].y !== path[i].y) {
            return true;
        }
    }
    return false;  // Paths are identical
}

// Function to check if the current shape is distinct from the last one in history
function isDistinctShape(history, shape) {
    if (history.length === 0) return false;  // First shape is always distinct
    const lastShape = history[history.length - 1];
    // Shapes are distinct if they have different type or coordinates
    if (lastShape.type !== shape.type) return true;
    if (lastShape.startX !== shape.startX || lastShape.startY !== shape.startY ||
        lastShape.endX !== shape.endX || lastShape.endY !== shape.endY) {
        return false;
    }
    return true;
}

// Redraw the canvas based on the history stacks
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    shapeHistory.forEach(item => {
        ctx.strokeStyle = item.color || color;
        ctx.lineWidth = 5;
        if (item.type === 'rectangle') {
            const width = item.endX - item.startX;
            const height = item.endY - item.startY;
            ctx.strokeRect(item.startX, item.startY, width, height);
        } else if (item.type === 'circle') {
            const radius = Math.sqrt(Math.pow(item.endX - item.startX, 2) + Math.pow(item.endY - item.startY, 2));
            ctx.beginPath();
            ctx.arc(item.startX, item.startY, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (item.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(item.startX, item.startY);
            ctx.lineTo(item.endX, item.endY);
            ctx.stroke();
        }
    });

    freehandHistory.forEach(path => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.forEach(point => {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        });
    });
}

    // Redraw freehand paths on top of shapes and lines (freehand will overlap shapes/lines)
    freehandHistory.forEach(path => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.forEach(point => {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        });
    });

// Set initial drawing style
ctx.lineWidth = penSizeSlider.value;
ctx.lineCap = 'round';
ctx.strokeStyle = color;