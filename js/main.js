// js/main.js
import { MAP_SIZE, SIMULATION_INTERVAL } from './config.js';
import { setupTools, updateStats } from './ui.js';
import { runSimulation } from './simulation.js';
import { drawMap, handleMapClick } from './map.js';

window.onload = function() {
    const canvas = document.getElementById('canvas-jogo');
    const ctx = canvas.getContext('2d');

    // --- ESTADO GLOBAL DO JOGO ---
    const gameState = {
        money: 20000,
        population: 0,
        income: 0,
        currentTool: 'estrada',
    };

    // --- CÂMERA E CONTROLES DE MOVIMENTO ---
    const camera = { x: 0, y: 0 };
    let isDragging = false;
    let lastMouseX, lastMouseY;
    
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.offsetX;
        lastMouseY = e.offsetY;
        canvas.style.cursor = 'grabbing';
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.offsetX - lastMouseX;
        const dy = e.offsetY - lastMouseY;
        camera.x -= dx;
        camera.y -= dy;
        lastMouseX = e.offsetX;
        lastMouseY = e.offsetY;
    });

    // --- MAPA DO JOGO ---
    const map = [];
    for (let y = 0; y < MAP_SIZE; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_SIZE; x++) {
            map[y][x] = { type: 'grama' };
        }
    }
    
    // --- CARREGAMENTO DE IMAGENS ---
    const images = {};
    const imageSources = ['grama', 'estrada', 'residencial', 'comercial', 'industrial', 'energia'];
    let imagesLoaded = 0;

    imageSources.forEach(key => {
        images[key] = new Image();
        images[key].src = `imagens/${key}.png`;
        images[key].onload = () => {
            imagesLoaded++;
            if (imagesLoaded === imageSources.length) {
                startGame();
            }
        };
    });

    // --- INICIALIZAÇÃO E LOOP DO JOGO ---
    function startGame() {
        setupTools(gameState);
        canvas.addEventListener('click', (e) => {
            if(!isDragging) { // Só constrói se não estiver arrastando
                 handleMapClick(e, canvas, camera, gameState, map);
            }
        });
        
        // Inicia o ciclo de simulação
        setInterval(() => {
            runSimulation(gameState, map);
        }, SIMULATION_INTERVAL);

        // Inicia o loop de renderização
        gameLoop();
    }

    function gameLoop() {
        drawMap(ctx, canvas, map, images, camera);
        updateStats(gameState);
        requestAnimationFrame(gameLoop);
    }
};
