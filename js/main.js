// js/main.js
import { initGame } from './game.js';
import { initIslandEditor } from './islandEditor.js';

// Espera o HTML da página ser completamente carregado antes de executar o código.
// Isso previne os erros de 'null' que você viu anteriormente.
document.addEventListener('DOMContentLoaded', () => {

    // Busca os elementos principais da interface.
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('container-principal');
    const btnNewGame = document.getElementById('btn-new-game');
    const btnExit = document.getElementById('btn-exit');

    // Uma verificação de segurança para garantir que todos os IDs no HTML estão corretos.
    if (!mainMenu || !gameContainer || !btnNewGame || !btnExit) {
        console.error("ERRO: Um ou mais elementos do menu principal não foram encontrados. Verifique os IDs no seu arquivo index.html!");
        return;
    }

    // Define o que acontece ao clicar no botão "Novo Jogo".
    btnNewGame.addEventListener('click', async () => {
        // 1. Esconde o menu principal imediatamente para evitar sobreposição.
        mainMenu.classList.add('hidden');

        // Configurações para o tamanho do mapa no editor.
        const mapWidth = 50;
        const mapHeight = 50;

        // 2. Chama a função que abre o editor de ilha e espera o jogador terminar.
        const mapData = await initIslandEditor(mapWidth, mapHeight);

        // 3. Avalia o que o jogador fez.
        if (mapData) { 
            // Se 'mapData' existe, o jogador clicou em "Concluir".
            // Mostra o container do jogo e inicia o jogo com os dados da ilha.
            gameContainer.classList.remove('hidden');
            initGame({ mapWidth, mapHeight, mapData });
        } else { 
            // Se 'mapData' é 'null', o jogador clicou em "Cancelar".
            // Mostra o menu principal novamente.
            mainMenu.classList.remove('hidden');
        }
    });

    // Define o que acontece ao clicar no botão "Sair".
    btnExit.addEventListener('click', () => {
        alert("Obrigado por jogar!");
    });
});
