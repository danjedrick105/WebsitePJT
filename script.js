const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearButton');
const undoButton = document.getElementById('undoButton');
const colorPicker = document.getElementById('colorPicker');
const shapeSelector = document.getElementById('shapeSelector');
const rulerButton = document.getElementById('rulerButton');

let drawing = false;
let currentPath = [];
let history = [];  // Stack to store paths for undo functionality
let currentShape = null;
let color = '#000000'; // Default color for drawing
let shapeMode = 'freehand'; // Shape mode (rectangle, circle, line)
let rulerMode = false; // To check if ruler mode is enabled
let startX, startY; // For storing the starting point of shapes

// Start drawing on mouse down
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    const x = e.offsetX;
    const y = e.offsetY;
    startX = x;
    startY = y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    currentPath = [{ x, y }];
});

// Draw while mouse is moving
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;

    const x = e.offsetX;
    const y = e.offsetY;

    if (rulerMode && shapeMode === 'freehand') {
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
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas to update drawing
        redrawCanvas();
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

// Stop drawing on mouse up
canvas.addEventListener('mouseup', () => {
    if (shapeMode === 'freehand') {
        history.push(currentPath);  // Save the freehand path to history
    }
    drawing = false;
});

// Undo the last drawing
undoButton.addEventListener('click', () => {
    if (history.length > 0) {
        history.pop(); // Remove the last path from the history stack
        redrawCanvas();  // Redraw the canvas from the updated history stack
    }
});

// Clear the canvas
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    history = [];  // Clear the history stack
});

// Change the drawing color
colorPicker.addEventListener('input', (e) => {
    color = e.target.value;
    ctx.strokeStyle = color;
});

// Toggle ruler mode
rulerButton.addEventListener('click', () => {
    rulerMode = !rulerMode;
    rulerButton.style.backgroundColor = rulerMode ? '#ff7f00' : '#4CAF50';
});

// Change shape mode
shapeSelector.addEventListener('change', (e) => {
    shapeMode = e.target.value;
    if (shapeMode === 'freehand') {
        rulerMode = false;  // Disable ruler mode when not drawing shapes
        rulerButton.style.backgroundColor = '#4CAF50';  // Reset ruler button color
    }
});

// Redraw the entire canvas based on the history stack
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    history.forEach(path => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.forEach(point => {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        });
    });
}

// Set initial drawing style
ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.strokeStyle = color; // Set the initial drawing color
