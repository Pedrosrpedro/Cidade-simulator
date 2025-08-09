window.onload = function() {
    const canvas = document.getElementById('canvas-jogo');
    const ctx = canvas.getContext('2d');

    // --- CONFIGURAÇÕES DO JOGO ---
    const TAMANHO_BLOCO = 40;
    const MAPA_LARGURA_BLOCOS = canvas.width / TAMANHO_BLOCO;
    const MAPA_ALTURA_BLOCOS = canvas.height / TAMANHO_BLOCO;

    // --- ESTADO DO JOGO ---
    let dinheiro = 20000;
    let populacao = 0;
    let ferramentaAtual = 'estrada';

    const CUSTOS = {
        estrada: 10,
        residencial: 50,
        comercial: 50,
        industrial: 50,
        energia: 500,
        demolir: 5,
    };

    // --- ELEMENTOS DA UI ---
    const dinheiroEl = document.getElementById('dinheiro-valor');
    const populacaoEl = document.getElementById('populacao-valor');
    const botoesFerramenta = document.querySelectorAll('.ferramenta');

    // --- IMAGENS DO JOGO ---
    const imagens = {};
    const fontesImagens = {
        grama: 'imagens/grama.png',
        estrada: 'imagens/estrada.png',
        residencial: 'imagens/residencial.png',
        comercial: 'imagens/comercial.png',
        industrial: 'imagens/industrial.png',
        energia: 'imagens/usina_eletrica.png',
    };

    let imagensCarregadas = 0;
    const totalImagens = Object.keys(fontesImagens).length;

    for (const key in fontesImagens) {
        imagens[key] = new Image();
        imagens[key].src = fontesImagens[key];
        imagens[key].onload = () => {
            imagensCarregadas++;
            if (imagensCarregadas === totalImagens) {
                iniciarJogo();
            }
        };
    }

    // --- MAPA DO JOGO ---
    const mapa = [];
    for (let y = 0; y < MAPA_ALTURA_BLOCOS; y++) {
        mapa[y] = [];
        for (let x = 0; x < MAPA_LARGURA_BLOCOS; x++) {
            mapa[y][x] = { tipo: 'grama' };
        }
    }

    // --- LÓGICA DE SELEÇÃO DE FERRAMENTA ---
    botoesFerramenta.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesFerramenta.forEach(b => b.classList.remove('selecionada'));
            botao.classList.add('selecionada');
            ferramentaAtual = botao.id.replace('ferramenta-', '');
        });
    });

    // --- LÓGICA DE CONSTRUÇÃO ---
    canvas.addEventListener('click', function(evento) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = evento.clientX - rect.left;
        const mouseY = evento.clientY - rect.top;

        const gridX = Math.floor(mouseX / TAMANHO_BLOCO);
        const gridY = Math.floor(mouseY / TAMANHO_BLOCO);

        const custo = CUSTOS[ferramentaAtual] || 0;

        if (dinheiro >= custo) {
             if (ferramentaAtual === 'demolir') {
                if (mapa[gridY][gridX].tipo !== 'grama') {
                    mapa[gridY][gridX] = { tipo: 'grama' };
                    dinheiro -= custo;
                }
            } else {
                 if (mapa[gridY][gridX].tipo === 'grama') {
                    mapa[gridY][gridX] = { tipo: ferramentaAtual };
                    dinheiro -= custo;
                }
            }
            atualizarUI();
            desenharMapa();
        } else {
            alert("Dinheiro insuficiente!");
        }
    });

    // --- FUNÇÕES PRINCIPAIS ---
    function atualizarUI() {
        dinheiroEl.textContent = dinheiro;
        populacaoEl.textContent = populacao;
    }

    function desenharMapa() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < MAPA_ALTURA_BLOCOS; y++) {
            for (let x = 0; x < MAPA_LARGURA_BLOCOS; x++) {
                const bloco = mapa[y][x];
                const imagem = imagens[bloco.tipo] || imagens['grama'];
                ctx.drawImage(imagem, x * TAMANHO_BLOCO, y * TAMANHO_BLOCO, TAMANHO_BLOCO, TAMANHO_BLOCO);
            }
        }
    }

    function gameLoop() {
        // Futuramente, a lógica de simulação (crescimento da população, impostos, etc.) virá aqui.
        requestAnimationFrame(gameLoop);
    }

    function iniciarJogo() {
        atualizarUI();
        desenharMapa();
        gameLoop();
    }
};
