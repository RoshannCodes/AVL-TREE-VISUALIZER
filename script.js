// ============================================================================
// AVL Node Class
// ============================================================================
class AVLNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

// ============================================================================
// AVL Tree Class
// ============================================================================
class AVLTree {
    constructor() {
        this.root = null;
    }

    height(node) {
        return node ? node.height : 0;
    }

    balanceFactor(node) {
        return node ? this.height(node.left) - this.height(node.right) : 0;
    }

    updateHeight(node) {
        if (node) {
            node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
        }
    }

    rightRotate(y) {
        const x = y.left;
        const T2 = x.right;
        x.right = y;
        y.left = T2;
        this.updateHeight(y);
        this.updateHeight(x);
        return x;
    }

    leftRotate(x) {
        const y = x.right;
        const T2 = y.left;
        y.left = x;
        x.right = T2;
        this.updateHeight(x);
        this.updateHeight(y);
        return y;
    }

    insert(node, value, steps = []) {
        if (!node) {
            steps.push({ type: 'insert', value, message: `✅ Inserting ${value}` });
            return new AVLNode(value);
        }

        if (value < node.value) {
            steps.push({ type: 'traverse', value, node: node.value, direction: 'left', message: `🔍 Traversing left from ${node.value}` });
            node.left = this.insert(node.left, value, steps);
        } else if (value > node.value) {
            steps.push({ type: 'traverse', value, node: node.value, direction: 'right', message: `🔍 Traversing right from ${node.value}` });
            node.right = this.insert(node.right, value, steps);
        } else {
            steps.push({ type: 'duplicate', value, message: `⚠️ ${value} already exists` });
            return node;
        }

        this.updateHeight(node);
        const balance = this.balanceFactor(node);

        // Left Left Case
        if (balance > 1 && value < node.left.value) {
            steps.push({ type: 'rotation', rotation: 'Right', node: node.value, message: `🔄 Right rotation at ${node.value}` });
            return this.rightRotate(node);
        }

        // Right Right Case
        if (balance < -1 && value > node.right.value) {
            steps.push({ type: 'rotation', rotation: 'Left', node: node.value, message: `🔄 Left rotation at ${node.value}` });
            return this.leftRotate(node);
        }

        // Left Right Case
        if (balance > 1 && value > node.left.value) {
            steps.push({ type: 'rotation', rotation: 'Left-Right', node: node.value, message: `🔄 Left-Right rotation at ${node.value}` });
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Right Left Case
        if (balance < -1 && value < node.right.value) {
            steps.push({ type: 'rotation', rotation: 'Right-Left', node: node.value, message: `🔄 Right-Left rotation at ${node.value}` });
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    minValueNode(node) {
        let current = node;
        while (current.left) {
            current = current.left;
        }
        return current;
    }

    delete(node, value, steps = []) {
        if (!node) {
            steps.push({ type: 'notfound', value, message: `❌ ${value} not found` });
            return node;
        }

        if (value < node.value) {
            steps.push({ type: 'traverse', value, node: node.value, direction: 'left', message: `🔍 Traversing left from ${node.value}` });
            node.left = this.delete(node.left, value, steps);
        } else if (value > node.value) {
            steps.push({ type: 'traverse', value, node: node.value, direction: 'right', message: `🔍 Traversing right from ${node.value}` });
            node.right = this.delete(node.right, value, steps);
        } else {
            steps.push({ type: 'delete', value, message: `🗑️ Deleting ${value}` });

            if (!node.left || !node.right) {
                node = node.left || node.right;
            } else {
                const temp = this.minValueNode(node.right);
                steps.push({ type: 'replace', from: node.value, to: temp.value, message: `🔄 Replacing ${node.value} with ${temp.value}` });
                node.value = temp.value;
                node.right = this.delete(node.right, temp.value, steps);
            }
        }

        if (!node) return node;

        this.updateHeight(node);
        const balance = this.balanceFactor(node);

        // Left Left Case
        if (balance > 1 && this.balanceFactor(node.left) >= 0) {
            steps.push({ type: 'rotation', rotation: 'Right', node: node.value, message: `🔄 Right rotation at ${node.value}` });
            return this.rightRotate(node);
        }

        // Left Right Case
        if (balance > 1 && this.balanceFactor(node.left) < 0) {
            steps.push({ type: 'rotation', rotation: 'Left-Right', node: node.value, message: `🔄 Left-Right rotation at ${node.value}` });
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Right Right Case
        if (balance < -1 && this.balanceFactor(node.right) <= 0) {
            steps.push({ type: 'rotation', rotation: 'Left', node: node.value, message: `🔄 Left rotation at ${node.value}` });
            return this.leftRotate(node);
        }

        // Right Left Case
        if (balance < -1 && this.balanceFactor(node.right) > 0) {
            steps.push({ type: 'rotation', rotation: 'Right-Left', node: node.value, message: `🔄 Right-Left rotation at ${node.value}` });
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }
}

// ============================================================================
// Tree Renderer
// ============================================================================
class TreeRenderer {
    constructor(canvas, tree) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tree = tree;
        this.highlightNode = null;
    }

    calculatePositions(node, x, y, level, positions, horizontalGap = 100) {
        if (!node) return;
        const gap = horizontalGap / Math.pow(1.5, level);
        positions.set(node, { x, y });
        if (node.left) {
            this.calculatePositions(node.left, x - gap, y + 100, level + 1, positions, horizontalGap);
        }
        if (node.right) {
            this.calculatePositions(node.right, x + gap, y + 100, level + 1, positions, horizontalGap);
        }
    }

    draw(highlightNode = null) {
        this.highlightNode = highlightNode;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        if (!this.tree.root) {
            this.drawEmptyMessage();
            return;
        }

        const positions = new Map();
        this.calculatePositions(this.tree.root, width / 2, 60, 0, positions);

        // Draw edges first
        this.drawEdges(this.tree.root, positions);

        // Draw nodes on top
        this.drawNodes(this.tree.root, positions);
    }

    drawEmptyMessage() {
        this.ctx.fillStyle = '#b0b0b0';
        this.ctx.font = 'italic 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Tree is empty. Insert a value to begin!', this.canvas.width / 2, this.canvas.height / 2);
    }

    drawEdges(node, positions) {
        if (!node) return;

        const pos = positions.get(node);

        if (node.left) {
            const leftPos = positions.get(node.left);
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.ctx.lineTo(leftPos.x, leftPos.y);
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.drawEdges(node.left, positions);
        }

        if (node.right) {
            const rightPos = positions.get(node.right);
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.ctx.lineTo(rightPos.x, rightPos.y);
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.drawEdges(node.right, positions);
        }
    }

    drawNodes(node, positions) {
        if (!node) return;

        const pos = positions.get(node);
        const balance = this.tree.balanceFactor(node);

        // Draw node circle
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);

        // Determine color based on state
        if (this.highlightNode === node.value) {
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.shadowColor = '#fbbf24';
            this.ctx.shadowBlur = 25;
        } else if (Math.abs(balance) > 1) {
            this.ctx.fillStyle = '#ef4444';
        } else {
            this.ctx.fillStyle = '#22c55e';
        }

        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw node value
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.value, pos.x, pos.y);

        // Draw balance factor
        this.ctx.fillStyle = '#1f2937';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(`BF:${balance}`, pos.x, pos.y - 45);

        // Draw height
        this.ctx.fillText(`H:${node.height}`, pos.x, pos.y + 45);

        // Recursively draw child nodes
        this.drawNodes(node.left, positions);
        this.drawNodes(node.right, positions);
    }
}

// ============================================================================
// Application Controller
// ============================================================================
class AVLApp {
    constructor() {
        this.tree = new AVLTree();
        this.canvas = document.getElementById('treeCanvas');
        this.renderer = new TreeRenderer(this.canvas, this.tree);
        this.animationSteps = [];
        this.currentStep = 0;
        this.isAnimating = false;
        this.speed = 1000;
        this.animationTimer = null;

        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
        this.elements = {
            valueInput: document.getElementById('valueInput'),
            insertBtn: document.getElementById('insertBtn'),
            deleteBtn: document.getElementById('deleteBtn'),
            randomBtn: document.getElementById('randomBtn'),
            playBtn: document.getElementById('playBtn'),
            resetBtn: document.getElementById('resetBtn'),
            speedSlider: document.getElementById('speedSlider'),
            speedValue: document.getElementById('speedValue'),
            messageBox: document.getElementById('messageBox'),
            infoBtn: document.getElementById('infoBtn'),
            infoPanel: document.getElementById('infoPanel'),
            statHeight: document.getElementById('statHeight'),
            statCurrentStep: document.getElementById('statCurrentStep'),
            statTotalSteps: document.getElementById('statTotalSteps'),
            statRotations: document.getElementById('statRotations'),
            statStatus: document.getElementById('statStatus')
        };
    }

    attachEventListeners() {
        this.elements.insertBtn.addEventListener('click', () => this.handleInsert());
        this.elements.deleteBtn.addEventListener('click', () => this.handleDelete());
        this.elements.randomBtn.addEventListener('click', () => this.handleRandom());
        this.elements.playBtn.addEventListener('click', () => this.toggleAnimation());
        this.elements.resetBtn.addEventListener('click', () => this.handleReset());
        this.elements.speedSlider.addEventListener('input', (e) => this.handleSpeedChange(e));
        this.elements.infoBtn.addEventListener('click', () => this.toggleInfo());
        this.elements.valueInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleInsert();
        });
    }

    handleInsert() {
        const value = parseInt(this.elements.valueInput.value);
        if (isNaN(value) || value < 0 || value > 99) {
            this.showMessage('⚠️ Please enter a valid number between 0 and 99');
            return;
        }

        const steps = [];
        this.tree.root = this.tree.insert(this.tree.root, value, steps);
        this.animationSteps = steps;
        this.currentStep = 0;
        this.isAnimating = true;
        this.elements.valueInput.value = '';
        this.startAnimation();
    }

    handleDelete() {
        const value = parseInt(this.elements.valueInput.value);
        if (isNaN(value)) {
            this.showMessage('⚠️ Please enter a valid number');
            return;
        }

        const steps = [];
        this.tree.root = this.tree.delete(this.tree.root, value, steps);
        this.animationSteps = steps;
        this.currentStep = 0;
        this.isAnimating = true;
        this.elements.valueInput.value = '';
        this.startAnimation();
    }

    handleRandom() {
        const value = Math.floor(Math.random() * 100);
        this.elements.valueInput.value = value;
    }

    handleReset() {
        this.tree = new AVLTree();
        this.renderer.tree = this.tree;
        this.animationSteps = [];
        this.currentStep = 0;
        this.isAnimating = false;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
        }
        this.elements.messageBox.classList.remove('show');
        this.updateStatistics();
        this.render();
    }

    handleSpeedChange(e) {
        this.speed = parseInt(e.target.value);
        this.elements.speedValue.textContent = `${this.speed}ms`;
    }

    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        if (this.isAnimating) {
            this.elements.playBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
            this.startAnimation();
        } else {
            this.elements.playBtn.innerHTML = '<span class="btn-icon">▶</span> Play';
            if (this.animationTimer) {
                clearTimeout(this.animationTimer);
            }
        }
        this.updateStatistics();
    }

    toggleInfo() {
        this.elements.infoPanel.classList.toggle('show');
    }

    startAnimation() {
        if (!this.isAnimating || this.currentStep >= this.animationSteps.length) {
            this.isAnimating = false;
            this.elements.playBtn.innerHTML = '<span class="btn-icon">▶</span> Play';
            this.renderer.draw(null);
            this.updateStatistics();
            return;
        }

        const step = this.animationSteps[this.currentStep];
        this.renderer.draw(step.node || step.value);
        this.showMessage(step.message || '');
        this.updateStatistics();

        this.currentStep++;
        this.animationTimer = setTimeout(() => this.startAnimation(), this.speed);
    }

    showMessage(message) {
        this.elements.messageBox.textContent = message;
        this.elements.messageBox.classList.add('show');
    }

    updateStatistics() {
        const height = this.tree.root ? this.tree.height(this.tree.root) : 0;
        const rotations = this.animationSteps.filter(s => s.type === 'rotation').length;
        const status = this.isAnimating ? '🔄' : '⏸️';

        this.elements.statHeight.textContent = height;
        this.elements.statCurrentStep.textContent = this.currentStep;
        this.elements.statTotalSteps.textContent = this.animationSteps.length;
        this.elements.statRotations.textContent = rotations;
        this.elements.statStatus.textContent = status;
    }

    render() {
        this.renderer.draw();
        this.updateStatistics();
    }
}

// ============================================================================
// Initialize Application
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    new AVLApp();
});