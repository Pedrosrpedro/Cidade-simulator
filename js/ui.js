// js/ui.js

export function setupTools(gameState) {
    const toolButtons = document.querySelectorAll('.ferramenta');
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            toolButtons.forEach(btn => btn.classList.remove('selecionada'));
            button.classList.add('selecionada');
            gameState.currentTool = button.dataset.tool;
        });
    });
}

export function updateStats(gameState) {
    document.getElementById('dinheiro-valor').textContent = gameState.money;
    document.getElementById('populacao-valor').textContent = gameState.population;
    document.getElementById('renda-valor').textContent = gameState.income;
}
