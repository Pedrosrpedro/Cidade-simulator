// js/map.js
import { TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH_HALF, TILE_HEIGHT_HALF, COSTS } from './config.js';

export function screenToMap(screenPos, canvas, camera, gameState) {
    const worldX = screenPos.x / camera.zoom - canvas.width / (2 * camera.zoom) + camera.x;
    const worldY = screenPos.y / camera.zoom - canvas.height / (4 * camera.zoom) + camera.y;

    const mapX = Math.round((worldX / TILE_WIDTH_HALF + worldY / TILE_HEIGHT_HALF) / 2);
    const mapY = Math.round((worldY / TILE_HEIGHT_HALF - worldX / TILE_WIDTH_HALF) / 2);
    return { x: mapX, y: mapY };
}

// --- Lógica de Desenho (Totalmente Corrigida) ---
export function drawMap(ctx, canvas, map, images, camera, gameState) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    ctx.translate(canvas.width / 2, canvas.height / 4);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    for (let y = 0; y < gameState.mapHeight; y++) {
        for (let x = 0; x < gameState.mapWidth; x++) {
            const screenX = (x - y) * TILE_WIDTH_HALF;
            const screenY = (x + y) * TILE_HEIGHT_HALF;
            const tile = map[y][x];

            // Pega a imagem correspondente ao tipo do tile (ex: 'agua' ou 'grama_n')
            const tileImg = images[tile.type];

            // CORREÇÃO ANTI-CRASH E LÓGICA DE DESENHO
            // Só tenta desenhar se a imagem existir no nosso objeto E se ela carregou sem erros.
            if (tileImg && tileImg.complete) {
                // Lógica de redimensionamento que já tínhamos
                const aspectRatio = tileImg.height / tileImg.width;
                const scaledHeight = TILE_WIDTH * aspectRatio;
                const imgX = screenX;
                const imgY = screenY + TILE_HEIGHT - scaledHeight;
                
                ctx.drawImage(tileImg, imgX, imgY, TILE_WIDTH, scaledHeight);
            } 
            // Se a imagem falhou ao carregar, não fazemos nada, evitando o crash.
            // O espaço ficará em branco (transparente), mostrando o oceano do fundo.
        }
    }
    ctx.restore();
}

// --- Funções de Interação (sem alterações) ---
export function handleMapClick(event, canvas, camera, gameState, map) {
    const screenPos = { x: event.offsetX, y: event.offsetY };
    const { x: mapX, y: mapY } = screenToMap(screenPos, canvas, camera, gameState);

    if (mapX >= 0 && mapX < gameState.mapWidth && mapY >= 0 && mapY < gameState.mapHeight) {
        const currentTile = map[mapY][mapX];
        const cost = COSTS[gameState.currentTool] || 0;
        const isBuildable = currentTile.type.startsWith('grama_');

        if (gameState.currentTool === 'demolir') {
            if (currentTile.type !== 'agua' && !isBuildable) {
                if (gameState.money >= COSTS.demolir) {
                    map[mapY][mapX] = { type: 'grama_all' };
                    gameState.money -= COSTS.demolir;
                }
            }
        } else if (isBuildable) {
            if (gameState.money >= cost) {
                currentTile.type = gameState.currentTool;
                gameState.money -= cost;
            } else {
                alert("Dinheiro insuficiente!");
            }
        }
    }
}

export function handleMapMove(event, lastMousePos, camera) {
    const dx = event.offsetX - lastMousePos.x;
    const dy = event.offsetY - lastMousePos.y;
    camera.x -= dx / camera.zoom;
    camera.y -= dy / camera.zoom;
}

export function handleMapZoom(event, camera) {
    const zoomIntensity = 0.1;
    const wheel = event.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);
    camera.zoom *= zoom;
    camera.zoom = Math.max(0.25, Math.min(camera.zoom, 4));
}
