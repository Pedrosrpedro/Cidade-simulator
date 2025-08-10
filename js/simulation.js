// js/simulation.js
import { MAP_SIZE, POPULATION_PER_RESIDENTIAL, INCOME_PER_COMMERCIAL, INCOME_PER_INDUSTRIAL } from './config.js';

function hasRoadConnection(map, startX, startY) {
    // Implementação simples: verifica se há uma estrada em qualquer um dos 4 vizinhos.
    const neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of neighbors) {
        const nx = startX + dx;
        const ny = startY + dy;
        if (nx >= 0 && nx < MAP_SIZE && ny >= 0 && ny < MAP_SIZE && map[ny][nx].type === 'estrada') {
            return true;
        }
    }
    return false;
}

export function runSimulation(gameState, map) {
    let newPopulation = 0;
    let newIncome = 0;

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const tile = map[y][x];
            
            // Edifícios precisam estar conectados a uma estrada para funcionar
            if (hasRoadConnection(map, x, y)) {
                 switch (tile.type) {
                    case 'residencial':
                        newPopulation += POPULATION_PER_RESIDENTIAL;
                        break;
                    case 'comercial':
                        newIncome += INCOME_PER_COMMERCIAL;
                        break;
                    case 'industrial':
                        newIncome += INCOME_PER_INDUSTRIAL;
                        break;
                }
            }
        }
    }
    
    gameState.population = newPopulation;
    gameState.income = newIncome;
    gameState.money += newIncome; // Adiciona a renda ao dinheiro total
}
