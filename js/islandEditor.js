// js/islandEditor.js

const TILE_SIZE = 10; // Tamanho do bloco no editor 2D
let mapData;
let isPainting = false;
let paintMode = 1; // 1 para terra, 0 para água

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((evt.clientX - rect.left) / TILE_SIZE),
        y: Math.floor((evt.clientY - rect.top) / TILE_SIZE)
    };
}

function drawGrid(ctx, canvas, width, height) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            ctx.fillStyle = mapData[y][x] === 1 ? '#2e7d32' : '#0d47a1'; // Verde para terra, azul para água
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

function paint(canvas, pos) {
    const { x, y } = pos;
    if (x >= 0 && x < canvas.width / TILE_SIZE && y >= 0 && y < canvas.height / TILE_SIZE) {
        if (mapData[y][x] !== paintMode) {
            mapData[y][x] = paintMode;
            drawGrid(canvas.getContext('2d'), canvas, canvas.width / TILE_SIZE, canvas.height / TILE_SIZE);
        }
    }
}

export function initIslandEditor(mapWidth, mapHeight) {
    const modal = document.getElementById('island-editor-modal');
    const canvas = document.getElementById('island-editor-canvas');
    const ctx = canvas.getContext('2d');

    // Ajusta o tamanho do canvas do editor para o tamanho do mapa
    canvas.width = mapWidth * TILE_SIZE;
    canvas.height = mapHeight * TILE_SIZE;

    // Reinicia o mapa de dados
    mapData = Array(mapHeight).fill(0).map(() => Array(mapWidth).fill(0));

    drawGrid(ctx, canvas, mapWidth, mapHeight);

    canvas.addEventListener('mousedown', e => {
        isPainting = true;
        paintMode = e.button === 0 ? 1 : 0; // Botão esquerdo = terra, direito = água
        paint(canvas, getMousePos(canvas, e));
    });

    canvas.addEventListener('mousemove', e => {
        if (isPainting) {
            paint(canvas, getMousePos(canvas, e));
        }
    });

    canvas.addEventListener('mouseup', () => {
        isPainting = false;
    });
    
    // Previne o menu de contexto do clique direito
    canvas.oncontextmenu = (e) => e.preventDefault();

    modal.classList.remove('hidden');

    // Retorna uma "Promise" que será resolvida quando o usuário terminar
    return new Promise((resolve) => {
        document.getElementById('btn-finish-drawing').onclick = () => {
            modal.classList.add('hidden');
            resolve(mapData); // Retorna o mapa desenhado
        };
        document.getElementById('btn-cancel-drawing').onclick = () => {
            modal.classList.add('hidden');
            resolve(null); // Retorna nulo se cancelar
        };
    });
}
