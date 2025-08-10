// js/map.js
import { TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH_HALF, TILE_HEIGHT_HALF, COSTS } from './config.js';

export function screenToMap(screenPos, canvas, camera, gameState) {
    const worldX = screenPos.x / camera.zoom - canvas.width / (2 * camera.zoom) + camera.x;
    const worldY = screenPos.y / camera.zoom - canvas.height / (4 * camera.zoom) + camera.y;

    const mapX = Math.round((worldX / TILE_WIDTH_HALF + worldY / TILE_HEIGHT_HALF) / 2);
    const mapY = Math.round((worldY / TILE_HEIGHT_HALF - worldX / TILE_WIDTH_HALF) / 2);
    return { x: mapX, y: mapY };
}

// --- Lógica de Desenho com Fallback para Imagens Faltantes ---
export function drawMap(ctx, canvas, map, images, camera, gameState) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    ctx.translate(canvas.width / 2, canvas.height / 4);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // Guarda a imagem de grama padrão para usar como fallback
    const fallbackGrass = images['grama_all'];

    for (let y = 0; y < gameState.mapHeight; y++) {
        for (let x = 0; x < gameState.mapWidth; x++) {
            const screenX = (x - y) * TILE_WIDTH_HALF;
            const screenY = (x + y) * TILE_HEIGHT_HALF;
            const tile = map[y][x];

            // Pega a imagem que deveria ser usada
            let tileImg = images[tile.type];

            // **SISTEMA DE FALLBACK**
            // Se a imagem específica do tile (ex: grama_nw) não foi encontrada ou está quebrada...
            if (!tileImg || !tileImg.complete) {
                // ...e se o tile for algum tipo de grama...
                if (tile.type.startsWith('grama_')) {
                    // ...usa a imagem de grama padrão como plano B.
                    tileImg = fallbackGrass;
                }
            }

            // Agora, só desenha se 'tileImg' for uma imagem válida (a específica ou o fallback)
            if (tileImg && tileImg.complete) {
                const aspectRatio = tileImg.height / tileImg.width;
                const scaledHeight = TILE_WIDTH * aspectRatio;
                const imgX = screenX;
                const imgY = screenY + TILE_HEIGHT - scaledHeight;
                
                ctx.drawImage(tileImg, imgX, imgY, TILE_WIDTH, scaledHeight);
            }
            // Se mesmo assim não houver imagem (ex: 'agua.png' faltando),
            // o espaço ficará transparente, mostrando o fundo do oceano da página.
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
