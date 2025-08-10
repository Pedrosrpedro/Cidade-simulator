// js/map.js
import { TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH_HALF, TILE_HEIGHT_HALF, COSTS } from './config.js';

export function screenToMap(screenPos, canvas, camera, gameState) {
    const worldX = screenPos.x / camera.zoom - canvas.width / (2 * camera.zoom) + camera.x;
    const worldY = screenPos.y / camera.zoom - canvas.height / (4 * camera.zoom) + camera.y;

    const mapX = Math.round((worldX / TILE_WIDTH_HALF + worldY / TILE_HEIGHT_HALF) / 2);
    const mapY = Math.round((worldY / TILE_HEIGHT_HALF - worldX / TILE_WIDTH_HALF) / 2);
    return { x: mapX, y: mapY };
}

// --- Lógica de Desenho ---
export function drawMap(ctx, canvas, map, images, camera, gameState) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas transparente
    ctx.save();
    
    // Aplica o zoom e a câmera
    ctx.translate(canvas.width / 2, canvas.height / 4);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    for (let y = 0; y < gameState.mapHeight; y++) {
        for (let x = 0; x < gameState.mapWidth; x++) {
            const screenX = (x - y) * TILE_WIDTH_HALF;
            const screenY = (x + y) * TILE_HEIGHT_HALF;
            const tile = map[y][x];

            // 1. Desenha a água como base para todos os tiles
            const waterImg = images['agua'];
            if (waterImg && waterImg.complete) {
                ctx.drawImage(waterImg, screenX, screenY, TILE_WIDTH, TILE_HEIGHT);
            }

            // 2. Se o tile não for água, desenha a imagem correspondente por cima
            if (tile.type !== 'agua') {
                const tileImg = images[tile.type];
                if (tileImg && tileImg.complete) {
                    // Lógica para redimensionar mantendo a proporção
                    const aspectRatio = tileImg.height / tileImg.width;
                    const scaledHeight = TILE_WIDTH * aspectRatio;
                    const imgX = screenX;
                    const imgY = screenY + TILE_HEIGHT - scaledHeight; // Alinha a base da imagem
                    
                    ctx.drawImage(tileImg, imgX, imgY, TILE_WIDTH, scaledHeight);
                }
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
        const currentTile = map[mapY][mapX];
        const cost = COSTS[gameState.currentTool] || 0;

        // Verifica se é um local construível (qualquer tipo de grama)
        const isBuildable = currentTile.type.startsWith('grama_');

        if (gameState.currentTool === 'demolir') {
            // Não pode demolir água ou grama vazia
            if (currentTile.type !== 'agua' && !isBuildable) {
                if (gameState.money >= COSTS.demolir) {
                    map[mapY][mapX] = { type: 'grama_all' }; // Transforma em grama simples (será reprocessado no futuro)
                    gameState.money -= COSTS.demolir;
                    // Idealmente, aqui chamaríamos uma função para reprocessar os vizinhos
                }
            }
        } else if (isBuildable) {
            // Lógica para construir
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
