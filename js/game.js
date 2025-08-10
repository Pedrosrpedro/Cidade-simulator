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
        currentTool: 'mover', // Começa com a ferramenta de mover por padrão
        mapWidth: config.mapWidth,
        mapHeight: config.mapHeight,
    };

    const camera = { x: 0, y: 0, zoom: 1 };
    
    // --- 1. CRIA O MAPA INICIAL A PARTIR DOS DADOS DO EDITOR ---
    const map = [];
    for (let y = 0; y < gameState.mapHeight; y++) {
        map[y] = [];
        for (let x = 0; x < gameState.mapWidth; x++) {
            // Usa o 'mapData' do editor para definir se é grama ou água
            const isLand = config.mapData[y][x] === 1;
            map[y][x] = { type: isLand ? 'grama' : 'agua' };
        }
    }

    // --- 2. PROCESSA O MAPA PARA ADICIONAR AS BORDAS CORRETAS (AUTOTILING) ---
    processTileTypes();
    
    function processTileTypes() {
        const typeMap = {
            15: 'all',      // Vizinhos em: N,S,W,E
            14: 'e_nsw',    // Vizinhos em: N,S,W
            13: 'w_nse',    // Vizinhos em: N,S,E
            12: 'ew',       // Vizinhos em: N,S
            11: 's_new',    // Vizinhos em: N,W,E
            10: 'sw',       // Vizinhos em: N,E
            9: 'se',        // Vizinhos em: N,W
            8: 'ns',        // Vizinhos em: N
            7: 'n_sew',     // Vizinhos em: S,W,E
            6: 'ne',        // Vizinhos em: S,E
            5: 'nw',        // Vizinhos em: S,W
            4: 's',         // Vizinhos em: S
            3: 'e',         // Vizinhos em: W,E
            2: 'w',         // Vizinhos em: W
            1: 'n',         // Vizinhos em: E
            0: 'none'       // Nenhum vizinho
        };

        const newMap = JSON.parse(JSON.stringify(map)); // Cria uma cópia para ler

        for (let y = 0; y < gameState.mapHeight; y++) {
            for (let x = 0; x < gameState.mapWidth; x++) {
                if (newMap[y][x].type === 'grama') {
                    let bitmask = 0;
                    // Checa vizinhos no mapa original e cria um valor de 4 bits (bitmask)
                    if (y > 0 && newMap[y-1][x].type === 'grama') bitmask += 8; // Norte
                    if (y < gameState.mapHeight-1 && newMap[y+1][x].type === 'grama') bitmask += 4; // Sul
                    if (x > 0 && newMap[y][x-1].type === 'grama') bitmask += 2; // Oeste
                    if (x < gameState.mapWidth-1 && newMap[y][x+1].type === 'grama') bitmask += 1; // Leste
                    
                    const borderType = typeMap[bitmask];
                    map[y][x].type = `grama_${borderType}`; // Define o tipo final no mapa real
                }
            }
        }
    }
    
    // --- 3. CARREGA TODAS AS IMAGENS NECESSÁRIAS ---
    const images = {};
    const imageSources = [
        'agua', 'estrada', 'residencial', 'comercial', 'industrial', 'energia',
        'grama_all', 'grama_n', 'grama_s', 'grama_e', 'grama_w', 'grama_ns', 'grama_ew',
        'grama_ne', 'grama_nw', 'grama_se', 'grama_sw', 'grama_n_sew', 'grama_s_new',
        'grama_e_nsw', 'grama_w_nse', 'grama_none'
    ];
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
            imagesLoaded++;
            if (imagesLoaded === imageSources.length) {
                startGame();
            }
        };
    });

    // --- 4. INICIALIZA O LOOP E OS EVENTOS DO JOGO ---
    function startGame() {
        setupTools(gameState, canvas);
        
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
