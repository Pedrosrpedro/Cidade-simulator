// js/config.js

// Configurações do mapa e da visão isométrica
export const TILE_WIDTH = 80;
export const TILE_HEIGHT = 40;
export const TILE_WIDTH_HALF = TILE_WIDTH / 2;
export const TILE_HEIGHT_HALF = TILE_HEIGHT / 2;

export const MAP_SIZE = 30; // 30x30 blocos

// Custos de construção
export const COSTS = {
    estrada: 10,
    residencial: 50,
    comercial: 50,
    industrial: 50,
    energia: 500,
    demolir: 5,
};

// Configurações da simulação
export const SIMULATION_INTERVAL = 5000; // a cada 5 segundos
export const POPULATION_PER_RESIDENTIAL = 5;
export const INCOME_PER_COMMERCIAL = 10;
export const INCOME_PER_INDUSTRIAL = 15;
