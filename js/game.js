// js/game.js
import { SIMULATION_INTERVAL } from './config.js';
import { setupTools, updateStats } from './ui.js';
import { runSimulation } from './simulation.js';
import { drawMap, handleMapClick, handleMapMove, handleMapZoom } from './map.js';

export function initGame(config) {
    const canvas = document.getElementById('canvas-jogo');
    const ctx = canvas.getContext('2d');

    const gameState = {
        money: 20000,
        population: 0,
        income: 0,
        currentTool: 'estrada',
        mapWidth: config.mapWidth,
        mapHeight: config.mapHeight,
    };

    const camera = { x: 0, y: 0, zoom: 1 };
    
    // --- MAPA DO JOGO ---
    const map = [];
    for (let y = 0; y < gameState.mapHeight; y++) {
        map[y] = [];
        for (let x = 0; x < gameState.mapWidth; x++) {
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
        images[key].onerror = () => {
            console.error(`Falha ao carregar a imagem: imagens/${key}.png`);
            // Mesmo com erro, contamos como "carregada" para o jogo não travar.
            // A função de desenho saberá como lidar com a imagem faltando.
            imagesLoaded++;
            if (imagesLoaded === imageSources.length) {
                startGame();
            }
        };
    });

    // --- INICIALIZAÇÃO E LOOP DO JOGO ---
    function startGame() {
        setupTools(gameState, canvas);
        
        // Eventos do mouse
        let isDragging = false;
        let lastMousePos = { x: 0, y: 0 };

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMousePos = { x: e.offsetX, y: e.offsetY };
        });

        canvas.addEventListener('mouseup', (e) => {
            isDragging = false;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (isDragging && gameState.currentTool === 'mover') {
                handleMapMove(e, lastMousePos, camera);
                lastMousePos = { x: e.offsetX, y: e.offsetY };
            }
        });
        
        canvas.addEventListener('click', (e) => {
            // Só constrói se não for a ferramenta de mover
            if(gameState.currentTool !== 'mover') {
                handleMapClick(e, canvas, camera, gameState, map);
            }
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            handleMapZoom(e, camera);
        });
        
        setInterval(() => {
            runSimulation(gameState, map);
        }, SIMULATION_INTERVAL);

        gameLoop();
    }

    function gameLoop() {
        drawMap(ctx, canvas, map, images, camera, gameState);
        updateStats(gameState);
        requestAnimationFrame(gameLoop);
    }
}
