// js/map.js
import { TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH_HALF, TILE_HEIGHT_HALF, COSTS } from './config.js';

// --- Funções de Coordenadas (agora levam o zoom em conta) ---
function screenToWorld(screenPos, camera) {
    return {
        x: (screenPos.x / camera.zoom) + camera.x,
        y: (screenPos.y / camera.zoom) + camera.y,
    };
}

export function screenToMap(screenPos, canvas, camera, gameState) {
    const mapCenterX = (gameState.mapWidth - 1) * TILE_WIDTH_HALF;
    const worldX = screenPos.x / camera.zoom - canvas.width / (2 * camera.zoom) + camera.x;
    const worldY = screenPos.y / camera.zoom - canvas.height / (4 * camera.zoom) + camera.y;

    const mapX = Math.round((worldX / TILE_WIDTH_HALF + worldY / TILE_HEIGHT_HALF) / 2);
    const mapY = Math.round((worldY / TILE_HEIGHT_HALF - worldX / TILE_WIDTH_HALF) / 2);
    return { x: mapX, y: mapY };
}

// --- Lógica de Desenho (com correção de bug e zoom) ---
export function drawMap(ctx, canvas, map, images, camera, gameState) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Aplica o zoom e a câmera
    ctx.translate(canvas.width / 2, canvas.height / 4);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    for (let y = 0; y < gameState.mapHeight; y++) {
        for (let x = 0; x < gameState.mapWidth; x++) {
            const screenX = (x - y) * TILE_WIDTH_HALF;
            const screenY = (x + y) * TILE_HEIGHT_HALF;

            // BUGFIX: Se a imagem de grama não carregou, desenha um bloco verde
            if (images.grama && images.grama.complete) {
                ctx.drawImage(images.grama, screenX, screenY, TILE_WIDTH, TILE_HEIGHT);
            } else {
                ctx.fillStyle = '#1a5902';
                ctx.fillRect(screenX, screenY, TILE_WIDTH, TILE_HEIGHT);
            }

            const tile = map[y][x];
            // BUGFIX: Verifica se a imagem do tile existe E se carregou completamente
            if (tile.type !== 'grama' && images[tile.type] && images[tile.type].complete) {
                const buildingImg = images[tile.type];
                const imgY = screenY + TILE_HEIGHT - buildingImg.height;
                ctx.drawImage(buildingImg, screenX, imgY);
            } else if (tile.type !== 'grama') {
                 // Se a imagem falhou (ex: estrada), desenha um bloco cinza no lugar
                ctx.fillStyle = 'rgba(80, 80, 80, 0.8)';
                ctx.fillRect(screenX, screenY, TILE_WIDTH, TILE_HEIGHT);
            }
        }
    }
    ctx.restore();
}

// --- Funções de Interação ---
export function handleMapClick(event, canvas, camera, gameState, map) {
    const screenPos = { x: event.offsetX, y: event.offsetY };
    const { x: mapX, y: mapY } = screenToMap(screenPos, canvas, camera, gameState);

    if (mapX >= 0 && mapX < gameState.mapWidth && mapY >= 0 && mapY < gameState.mapHeight) {
        const cost = COSTS[gameState.currentTool] || 0;
        if (gameState.money >= cost) {
            // Lógica de construção/demolição... (sem alteração)
            if (gameState.currentTool === 'demolir') {
                if (map[mapY][mapX].type !== 'grama') {
                    map[mapY][mapX] = { type: 'grama' };
                    gameState.money -= cost;
                }
            } else {
                 if (map[mapY][mapX].type === 'grama') {
                    map[mapY][mapX] = { type: gameState.currentTool };
                    gameState.money -= cost;
                }
            }
        } else {
            alert("Dinheiro insuficiente!");
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
    // Limita o zoom para não ser excessivo
    camera.zoom = Math.max(0.25, Math.min(camera.zoom, 4));
}
