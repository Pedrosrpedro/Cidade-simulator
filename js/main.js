// js/main.js
import { initGame } from './game.js';
import { initIslandEditor } from './islandEditor.js'; // IMPORTA O EDITOR


window.onload = () => {
    const mainMenu = document.getElementById('main-menu');
    const newGameModal = document.getElementById('new-game-modal');
    const gameContainer = document.getElementById('container-principal');

    const btnNewGame = document.getElementById('btn-new-game');
    const btnCancelNewGame = document.getElementById('btn-cancel-new-game');
    const btnStartNewGame = document.getElementById('btn-start-new-game');
    
    // Mostra o modal de novo jogo
    btnNewGame.addEventListener('click', () => {
        newGameModal.classList.remove('hidden');
    });

    // Esconde o modal
    btnCancelNewGame.addEventListener('click', () => {
        newGameModal.classList.add('hidden');
    });
    
    // Inicia o jogo com as configurações do modal
    btnStartNewGame.addEventListener('click', () => {
        const mapWidth = parseInt(document.getElementById('map-width').value);
        const mapHeight = parseInt(document.getElementById('map-height').value);
        
        mainMenu.classList.add('hidden');
        newGameModal.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        
        // Inicia o jogo passando as configurações
        initGame({ mapWidth, mapHeight });
    });

    document.getElementById('btn-exit').addEventListener('click', () => {
        // Em um app de verdade, fecharia a janela. Aqui, apenas damos um alerta.
        alert("Imagine que o jogo fechou! :)");
    });
};
