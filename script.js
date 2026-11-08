const bola = document.querySelector('.bola');
const jogador1 = document.querySelector('.jogador1');
const jogador2 = document.querySelector('.jogador2');

// Seleciona corretamente cada span do placar e dos nomes
const placarJ1 = document.querySelectorAll('.placar span')[0];
const placarJ2 = document.querySelectorAll('.placar span')[1];
const spanNomeJ1 = document.querySelector('.nome-j1');
const spanNomeJ2 = document.querySelector('.nome-j2');
const spanTempoAtual = document.getElementById('tempo-atual');

// Elementos dos Menus (Inicial e Final)
const telaInicial = document.getElementById('tela-inicial');
const telaFinal = document.getElementById('tela-final');
const formNomes = document.getElementById('form-nomes');
const inputJ1 = document.getElementById('inputJ1');
const inputJ2 = document.getElementById('inputJ2');
const inputCorJ1 = document.getElementById('corJ1');
const inputCorJ2 = document.getElementById('corJ2');
const textoVencedor = document.getElementById('texto-vencedor');
const spanTempoFinal = document.getElementById('tempo-final');
const corpoRanking = document.getElementById('corpo-ranking');
const btnJogarNovamente = document.getElementById('btn-jogar-novamente');
const btnTrocarNomes = document.getElementById('btn-trocar-nomes');

// Força a remoção do translate padrão do CSS para que a bola se mova livremente pelas coordenadas X e Y
bola.style.transform = 'none';

const tamanhoBola = 20;
const velocidadeInicial = 4;
const velocidadeMaxima = 16;
const limitePontos = 5;

let bolaX = 390; // Meio da tela (800/2 - metade da bola)
let bolaY = 190; // Meio da tela (400/2 - metade da bola)
let velocidadeBolaX = velocidadeInicial;
let velocidadeBolaY = velocidadeInicial;

// Posição inicial das raquetes
let j1Y = 160;
let j2Y = 160;
const velocidadeRaquete = 7;
const alturaRaquete = 80; // Altura definida no seu CSS
const alturaJogo = 400;   // Altura da área .pong no seu CSS

// Estado e Pontuação dos Jogadores
let nomeJogador1 = 'JOGADOR 1';
let nomeJogador2 = 'JOGADOR 2';
let pontosJ1 = 0;
let pontosJ2 = 0;
let jogoAtivo = false;

// Cronômetro
let tempoInicio = 0;
let intervaloCronometro = null;

// Controle de teclas pressionadas
const teclas = {};
document.addEventListener('keydown', (evento) => teclas[evento.key] = true);
document.addEventListener('keyup', (evento) => teclas[evento.key] = false);

// Evento do formulário inicial para começar a partida
formNomes.addEventListener('submit', (evento) => {
    evento.preventDefault(); // Evita recarregar a página

    nomeJogador1 = inputJ1.value.trim().toUpperCase() || 'JOGADOR 1';
    nomeJogador2 = inputJ2.value.trim().toUpperCase() || 'JOGADOR 2';

    const corEscolhidaJ1 = inputCorJ1.value;
    const corEscolhidaJ2 = inputCorJ2.value;
 
    // Atualiza o nome no cabecalho
    spanNomeJ1.textContent = nomeJogador1;
    spanNomeJ2.textContent = nomeJogador2;

    // Aplica a cor escolhida na raquete e no nome de cada jogador
    jogador1.style.backgroundColor = corEscolhidaJ1;
    spanNomeJ1.style.color = corEscolhidaJ1;

    jogador2.style.backgroundColor = corEscolhidaJ2;
    spanNomeJ2.style.color = corEscolhidaJ2;

    telaInicial.classList.add('oculto');
    iniciarPartida();
});

// Botão para jogar novamente com os mesmos jogadores
btnJogarNovamente.addEventListener('click', () => {
    telaFinal.classList.add('oculto');
    iniciarPartida();
});

// Botão para voltar ao menu inicial e trocar os nomes
btnTrocarNomes.addEventListener('click', () => {
    telaFinal.classList.add('oculto');
    inputJ1.value = '';
    inputJ2.value = '';
    telaInicial.classList.remove('oculto');
});

function iniciarPartida() {
    pontosJ1 = 0;
    pontosJ2 = 0;
    placarJ1.textContent = '0';
    placarJ2.textContent = '0';
    spanTempoAtual.textContent = '0.00';

    j1Y = 160;
    j2Y = 160;
    jogador1.style.top = j1Y + 'px';
    jogador2.style.top = j2Y + 'px';

    resetarBola(Math.random() > 0.5 ? 1 : -1);

    tempoInicio = performance.now();
    jogoAtivo = true;

    clearInterval(intervaloCronometro);
    intervaloCronometro = setInterval(() => {
        if (jogoAtivo) {
            const decorrido = ((performance.now() - tempoInicio) / 1000).toFixed(2);
            spanTempoAtual.textContent = decorrido;
        }
    }, 50);
}

function resetarBola(direcao) {
    bolaX = 390;
    bolaY = 190;
    // Reseta a velocidade mantendo a direção de quem levou o ponto
    velocidadeBolaX = velocidadeInicial * direcao;
    velocidadeBolaY = Math.random() > 0.5 ? velocidadeInicial : -velocidadeInicial;
}

function aumentarVelocidade() {
    if (Math.abs(velocidadeBolaX) < velocidadeMaxima) {
        velocidadeBolaX *= 1.12; // Aumenta a velocidade em 12% por rebatida
        velocidadeBolaY *= 1.12;
    }
}

function verificarVitoria() {
    if (pontosJ1 >= limitePontos || pontosJ2 >= limitePontos) {
        jogoAtivo = false;
        clearInterval(intervaloCronometro);

        const tempoTotal = ((performance.now() - tempoInicio) / 1000).toFixed(2);
        spanTempoAtual.textContent = tempoTotal;

        const vencedor = pontosJ1 >= limitePontos ? nomeJogador1 : nomeJogador2;
        const perdedor = pontosJ1 >= limitePontos ? nomeJogador2 : nomeJogador1;

        textoVencedor.textContent = `${vencedor} VENCEU!`;
        spanTempoFinal.textContent = tempoTotal;
        telaFinal.classList.remove('oculto');

        salvarECarregarRanking(vencedor, perdedor, tempoTotal);
    }
}

async function salvarECarregarRanking(vencedor, perdedor, tempo) {
    corpoRanking.innerHTML = '<tr><td colspan="4">Salvando tempo...</td></tr>';

    try {
        const resposta = await fetch('ranking.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vencedor, perdedor, tempo })
        });

        const ranking = await resposta.json();
        corpoRanking.innerHTML = '';

        ranking.forEach((partida, index) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>#${index + 1}</td>
                <td>${partida.vencedor}</td>
                <td>${partida.perdedor}</td>
                <td>${Number(partida.tempo_segundos).toFixed(2)}s</td>
            `;
            corpoRanking.appendChild(linha);
        });
    } catch (erro) {
        corpoRanking.innerHTML = '<tr><td colspan="4">Erro ao conectar com ranking.php</td></tr>';
    }
}

function atualizarJogo() {
    if (jogoAtivo) {
        // --- MOVIMENTAÇÃO DAS RAQUETES ---
        // Jogador 1: Teclas 'w' e 's'
        if ((teclas['w'] || teclas['W']) && j1Y > 0) {
            j1Y -= velocidadeRaquete;
        }
        if ((teclas['s'] || teclas['S']) && j1Y < (alturaJogo - alturaRaquete)) {
            j1Y += velocidadeRaquete;
        }

        // Jogador 2: Setinhas 'ArrowUp' e 'ArrowDown'
        if (teclas['ArrowUp'] && j2Y > 0) {
            j2Y -= velocidadeRaquete;
        }
        if (teclas['ArrowDown'] && j2Y < (alturaJogo - alturaRaquete)) {
            j2Y += velocidadeRaquete;
        }

        // Aplica as novas posições no CSS das raquetes
        jogador1.style.top = j1Y + 'px';
        jogador2.style.top = j2Y + 'px';

        // --- MOVIMENTAÇÃO DA BOLA ---
        bolaX += velocidadeBolaX;
        bolaY += velocidadeBolaY;

        // Colisão com as bordas superiores e inferiores (Inverte o eixo Y)
        if (bolaY <= 0 || bolaY >= (alturaJogo - tamanhoBola)) {
            velocidadeBolaY = -velocidadeBolaY;
        }

        // --- COLISÃO COM A RAQUETE 1 (Esquerda) ---
        if (bolaX <= 20 && bolaX >= 10 && velocidadeBolaX < 0) {
            if (bolaY + tamanhoBola >= j1Y && bolaY <= j1Y + alturaRaquete) {
                velocidadeBolaX = Math.abs(velocidadeBolaX); // Rebate para a direita
                aumentarVelocidade();
            }
        }

        // --- COLISÃO COM A RAQUETE 2 (Direita) ---
        if (bolaX >= 760 && bolaX <= 770 && velocidadeBolaX > 0) {
            if (bolaY + tamanhoBola >= j2Y && bolaY <= j2Y + alturaRaquete) {
                velocidadeBolaX = -Math.abs(velocidadeBolaX); // Rebate para a esquerda
                aumentarVelocidade();
            }
        }

        // --- SISTEMA DE PONTOS ---
        // Ponto do Jogador 2 (Bola passou da esquerda)
        if (bolaX < 0) {
            pontosJ2++;
            if (placarJ2) placarJ2.textContent = pontosJ2;
            verificarVitoria();
            if (jogoAtivo) resetarBola(1);
        }
        // Ponto do Jogador 1 (Bola passou da direita)
        if (bolaX > 800) {
            pontosJ1++;
            if (placarJ1) placarJ1.textContent = pontosJ1;
            verificarVitoria();
            if (jogoAtivo) resetarBola(-1);
        }

        // Aplica a nova posição no CSS da bola
        bola.style.left = bolaX + 'px';
        bola.style.top = bolaY + 'px';
    }

    // Executa a função continuamente a cada frame do navegador
    requestAnimationFrame(atualizarJogo);
}

// Posiciona a bola no centro antes de iniciar e começa o loop
bola.style.left = bolaX + 'px';
bola.style.top = bolaY + 'px';
requestAnimationFrame(atualizarJogo);