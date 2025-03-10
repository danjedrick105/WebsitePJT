
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

// Draw or erase while mouse is moving
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;

    const x = e.offsetX;
    const y = e.offsetY;

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

// Stop drawing or erasing on mouse up
canvas.addEventListener('mouseup', () => {
    if (shapeMode === 'freehand' && !eraserMode) {
        // Save freehand path only if distinct
        if (isDistinctFreehandPath(freehandHistory, currentPath)) {
            freehandHistory.push(currentPath);  // Save the freehand path to history
        }
    } else if (shapeMode !== 'freehand' && !eraserMode) {
        // Save shapes to history only if distinct
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
    drawing = false;
    currentPath = [];  // Reset the current path
});

// Undo the last drawing
undoButton.addEventListener('click', () => {
    if (shapeHistory.length > 0 || freehandHistory.length > 0) {
        if (freehandHistory.length > 0) {
            freehandHistory.pop();  // Remove the last freehand path
        } else {
            shapeHistory.pop();  // Remove the last shape from the history stack
        }
        redrawCanvas();  // Redraw the canvas from the updated history stack
    }
});


clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  
    shapeHistory = [];  
    freehandHistory = [];  
});


colorPicker.addEventListener('input', (e) => {
    color = e.target.value;
    ctx.strokeStyle = color;
});


rulerButton.addEventListener('click', () => {
    rulerMode = !rulerMode;
    rulerButton.style.backgroundColor = rulerMode ? '#ff7f00' : '#4CAF50';
});


shapeSelector.addEventListener('change', (e) => {
    shapeMode = e.target.value;
    if (shapeMode === 'freehand') {
        rulerMode = false;  
        rulerButton.style.backgroundColor = '#4CAF50'; 
    }
});

eraserButton.addEventListener('click', () => {
    eraserMode = !eraserMode;
    eraserButton.style.backgroundColor = eraserMode ? '#ff0000' : '#4CAF50'; // Change button color when toggled
});

penSizeSlider.addEventListener('input', (e) => {
    const size = e.target.value;
    ctx.lineWidth = size;  // Update the canvas line width
    penSizeValue.textContent = size;  // Display the current pen size
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

// Redraw the entire canvas based on the history stacks
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

    // Redraw shapes and lines first (this allows them to be overlapped by freehand)
    shapeHistory.forEach(item => {
        ctx.strokeStyle = item.color || color; // Ensure color is applied to the shape
        ctx.lineWidth = 5;
        if (item.type === 'rectangle') {
            const width = item.endX - item.startX;
            const height = item.endY - item.startY;
        } else if (item.type === 'circle') {
            const radius = Math.sqrt(Math.pow(item.endX - item.startX, 2) + Math.pow(item.endY - item.startY, 2));
            ctx.beginPath();
            ctx.arc(item.startX, item.startY, radius, 0, Math.PI * 2);
 
        } else if (item.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(item.startX, item.startY);
            ctx.lineTo(item.endX, item.endY);

        }
    });

    // Redraw freehand paths on top of shapes and lines (freehand will overlap shapes/lines)
    freehandHistory.forEach(path => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.forEach(point => {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        });
    });
}

// Set initial drawing style
ctx.lineWidth = penSizeSlider.value;
ctx.lineCap = 'round';
ctx.strokeStyle = color;

$('body').on('click', '.dashboard_leftNav_category a', function() {
    var link = $(this).attr('showSection'); //changed from let link
    var show = $('[section="'+link+'"]');
    $('[section]').hide();
    $('body').find(show).fadeIn();
    $('html,body').scrollTop(0);
  });
