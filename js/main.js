// js/main.js
import { initGame } from './game.js';
import { initIslandEditor } from './islandEditor.js';

// SUBSTITUÍMOS 'window.onload' POR ESTE MÉTODO MAIS MODERNO E SEGURO.
// Este evento espera apenas o HTML ser carregado, o que é mais rápido e confiável
// para encontrar elementos com getElementById.
document.addEventListener('DOMContentLoaded', () => {

    // Agora, temos certeza de que todos os elementos abaixo existem na página.
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('container-principal');
    const btnNewGame = document.getElementById('btn-new-game');
    const btnExit = document.getElementById('btn-exit');

    // Se qualquer um desses elementos ainda for nulo, significa que há um erro de digitação
    // no ID dentro do arquivo index.html.
    if (!mainMenu || !gameContainer || !btnNewGame || !btnExit) {
        console.error("ERRO: Um ou mais elementos do menu principal não foram encontrados. Verifique os IDs no seu arquivo index.html!");
        return;
    }

    btnNewGame.addEventListener('click', async () => {
        // Valores para o tamanho do mapa no editor.
        const mapWidth = 50;
        const mapHeight = 50;

        // Chama o editor de ilha e espera o resultado.
        const mapData = await initIslandEditor(mapWidth, mapHeight);

        if (mapData) { // Se o usuário concluiu (não cancelou)
            mainMenu.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            
            // Passa os dados do mapa desenhado para iniciar o jogo.
            initGame({ mapWidth, mapHeight, mapData });
        }
    });

    btnExit.addEventListener('click', () => {
        // Apenas um alerta, já que não podemos fechar a aba do navegador com segurança.
        alert("Obrigado por jogar!");
    });
});
