// js/map.js
import { TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH_HALF, TILE_HEIGHT_HALF, COSTS } from './config.js';

// As funções de coordenadas (screenToMap, etc.) permanecem as mesmas...
export function screenToMap(screenPos, canvas, camera, gameState) {
    const worldX = screenPos.x / camera.zoom - canvas.width / (2 * camera.zoom) + camera.x;
    const worldY = screenPos.y / camera.zoom - canvas.height / (4 * camera.zoom) + camera.y;

    const mapX = Math.round((worldX / TILE_WIDTH_HALF + worldY / TILE_HEIGHT_HALF) / 2);
    const mapY = Math.round((worldY / TILE_HEIGHT_HALF - worldX / TILE_WIDTH_HALF) / 2);
    return { x: mapX, y: mapY };
}


// --- Lógica de Desenho (GRANDES ALTERAÇÕES) ---
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

            // --- 1. DESENHA O TERRENO BASE (ÁGUA OU GRAMA) ---
            const baseImageKey = tile.type === 'agua' ? 'agua' : 'grama';
            const baseImage = images[baseImageKey];

            if (baseImage && baseImage.complete) {
                ctx.drawImage(baseImage, screenX, screenY, TILE_WIDTH, TILE_HEIGHT);
            } else {
                // Plano B: Cor sólida se a imagem falhar
                ctx.fillStyle = baseImageKey === 'agua' ? '#0d47a1' : '#1a5902'; // Azul para água, verde para grama
                ctx.beginPath();
                ctx.moveTo(screenX, screenY + TILE_HEIGHT_HALF);
                ctx.lineTo(screenX + TILE_WIDTH_HALF, screenY);
                ctx.lineTo(screenX + TILE_WIDTH, screenY + TILE_HEIGHT_HALF);
                ctx.lineTo(screenX + TILE_WIDTH_HALF, screenY + TILE_HEIGHT);
                ctx.closePath();
                ctx.fill();
            }

            // --- 2. DESENHA A CONSTRUÇÃO (se não for grama ou água) ---
            if (tile.type !== 'grama' && tile.type !== 'agua') {
                const buildingImg = images[tile.type];

                if (buildingImg && buildingImg.complete) {
                    // CÁLCULO PARA REDIMENSIONAR MANTENDO A PROPORÇÃO
                    const aspectRatio = buildingImg.height / buildingImg.width;
                    const scaledHeight = TILE_WIDTH * aspectRatio;

                    // Posiciona a imagem para que sua base se alinhe com o tile
                    const imgX = screenX;
                    const imgY = screenY + TILE_HEIGHT - scaledHeight;
                    
                    // Desenha a imagem com o tamanho corrigido
                    ctx.drawImage(buildingImg, imgX, imgY, TILE_WIDTH, scaledHeight);
                } else {
                    // Plano B: Bloco cinza se a imagem da construção falhar
                    ctx.fillStyle = 'rgba(80, 80, 80, 0.8)';
                    const imgX = screenX;
                    const imgY = screenY;
                    ctx.fillRect(imgX, imgY, TILE_WIDTH, TILE_HEIGHT); // Simplificado para um retângulo
                }
            }
        }
    }
    ctx.restore();
}

// --- Funções de Interação (handleMapClick, handleMapMove, handleMapZoom) continuam as mesmas ---
export function handleMapClick(event, canvas, camera, gameState, map) {
    const screenPos = { x: event.offsetX, y: event.offsetY };
    const { x: mapX, y: mapY } = screenToMap(screenPos, canvas, camera, gameState);

    if (mapX >= 0 && mapX < gameState.mapWidth && mapY >= 0 && mapY < gameState.mapHeight) {
        // A lógica de construção já impede construir fora da grama, então não precisamos mudar nada aqui.
        if (map[mapY][mapX].type === 'grama') {
            const cost = COSTS[gameState.currentTool] || 0;
            if (gameState.money >= cost) {
                 if (gameState.currentTool !== 'demolir') {
                    map[mapY][mapX] = { type: gameState.currentTool };
                    gameState.money -= cost;
                }
            } else {
                alert("Dinheiro insuficiente!");
            }
        } else if (gameState.currentTool === 'demolir' && map[mapY][mapX].type !== 'agua') {
            const cost = COSTS.demolir;
            if (gameState.money >= cost && map[mapY][mapX].type !== 'grama') {
                map[mapY][mapX] = { type: 'grama' };
                gameState.money -= cost;
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
