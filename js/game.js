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
    
    // --- MAPA DO JOGO (Com a lógica para criar o mapa costeiro) ---
    const map = [];
    // Define que a faixa de terra ocupará a parte central do mapa
    const LAND_START_Y = Math.floor(gameState.mapHeight * 0.4); 
    const LAND_END_Y = Math.floor(gameState.mapHeight * 0.6);   

    for (let y = 0; y < gameState.mapHeight; y++) {
        map[y] = [];
        for (let x = 0; x < gameState.mapWidth; x++) {
            // Se o bloco 'y' está dentro da faixa de terra, é grama. Senão, é água.
            if (y >= LAND_START_Y && y <= LAND_END_Y) {
                map[y][x] = { type: 'grama' };
            } else {
                map[y][x] = { type: 'agua' };
            }
        }
    }
    
    // --- CARREGAMENTO DE IMAGENS (Incluindo a imagem da água) ---
    const images = {};
    const imageSources = ['grama', 'agua', 'estrada', 'residencial', 'comercial', 'industrial', 'energia'];
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
        
        // Inicia o ciclo de simulação
        setInterval(() => {
            runSimulation(gameState, map);
        }, SIMULATION_INTERVAL);

        // Inicia o loop de renderização
        gameLoop();
    }

    function gameLoop() {
        drawMap(ctx, canvas, map, images, camera, gameState);
        updateStats(gameState);
        requestAnimationFrame(gameLoop);
    }
}
