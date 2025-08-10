// js/map.js
import { TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH_HALF, TILE_HEIGHT_HALF, MAP_SIZE, COSTS } from './config.js';

// --- Funções de Conversão de Coordenadas ---

// Converte coordenadas do grid (mapa) para a tela (isométrico)
export function mapToScreen(mapX, mapY) {
    const screenX = (mapX - mapY) * TILE_WIDTH_HALF;
    const screenY = (mapX + mapY) * TILE_HEIGHT_HALF;
    return { x: screenX, y: screenY };
}

// Converte coordenadas da tela (clique) para o grid (mapa)
export function screenToMap(screenX, screenY) {
    const mapX = Math.round((screenX / TILE_WIDTH_HALF + screenY / TILE_HEIGHT_HALF) / 2);
    const mapY = Math.round((screenY / TILE_HEIGHT_HALF - screenX / TILE_WIDTH_HALF) / 2);
    return { x: mapX, y: mapY };
}


// --- Lógica de Desenho ---

export function drawMap(ctx, canvas, map, images, camera) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Centraliza a câmera no meio do mapa inicialmente
    const mapCenterX = (MAP_SIZE - 1) * TILE_WIDTH_HALF;
    
    ctx.save();
    ctx.translate(canvas.width / 2 - camera.x, canvas.height / 4 - camera.y);

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const screenCoords = mapToScreen(x, y);
            
            // Desenha o chão (grama)
            ctx.drawImage(images.grama, screenCoords.x, screenCoords.y, TILE_WIDTH, TILE_HEIGHT);

            // Desenha a construção, se houver
            const tile = map[y][x];
            if (tile.type !== 'grama' && images[tile.type]) {
                const buildingImg = images[tile.type];
                // Ajusta a posição Y para que a base da imagem alinhe com o tile
                const imgY = screenCoords.y + TILE_HEIGHT - buildingImg.height;
                ctx.drawImage(buildingImg, screenCoords.x, imgY);
            }
        }
    }
    ctx.restore();
}

// --- Lógica de Construção ---

export function handleMapClick(event, canvas, camera, gameState, map) {
    // Ajusta a posição do mouse pela posição da câmera e o centro do mapa
    const mapCenterX = (MAP_SIZE - 1) * TILE_WIDTH_HALF;
    const worldX = event.offsetX - canvas.width / 2 + camera.x;
    const worldY = event.offsetY - canvas.height / 4 + camera.y;

    const { x: mapX, y: mapY } = screenToMap(worldX, worldY);

    if (mapX >= 0 && mapX < MAP_SIZE && mapY >= 0 && mapY < MAP_SIZE) {
        const cost = COSTS[gameState.currentTool] || 0;
        
        if (gameState.money >= cost) {
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
