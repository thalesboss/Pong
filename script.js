// ==================== 1. CAPTURA DOS ELEMENTOS DO HTML (DOM) ====================
// Aqui criamos "ponteiros" (referências) para os elementos da tela que o JS vai controlar
const bola = document.querySelector('.bola');
const jogador1 = document.querySelector('.jogador1');
const jogador2 = document.querySelector('.jogador2');

// querySelectorAll pega TODOS os <span> dentro de .placar como uma lista (array): [0] é o J1 e [1] é o J2
const placarJ1 = document.querySelectorAll('.placar span')[0];
const placarJ2 = document.querySelectorAll('.placar span')[1];
const spanNomeJ1 = document.querySelector('.nome-j1');
const spanNomeJ2 = document.querySelector('.nome-j2');
const spanTempoAtual = document.getElementById('tempo-atual');

// Captura das telas de menu, campos do formulário e botões da tela final
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

// ==================== 2. CONFIGURAÇÕES E VARIÁVEIS DO JOGO ====================
// Desliga o "transform: translate(-50%, -50%)" do CSS para que a posição da bola seja 100% controlada por pixels (left e top)
bola.style.transform = 'none';

// Constantes (regras fixas que não mudam durante a partida)
const tamanhoBola = 20;      // Largura e altura da bola (20px)
const velocidadeInicial = 4; // Quantos pixels a bola anda por frame no começo
const velocidadeMaxima = 16; // Limite máximo de velocidade para não atravessar a raquete
const limitePontos = 5;      // Quem fizer 5 pontos primeiro vence

// Variáveis de posição e velocidade da bola (mudam a cada quadro/frame)
let bolaX = 390; // Centro horizontal exato: (800px da quadra / 2) - (20px da bola / 2) = 390px
let bolaY = 190; // Centro vertical exato: (400px da quadra / 2) - (20px da bola / 2) = 190px
let velocidadeBolaX = velocidadeInicial;
let velocidadeBolaY = velocidadeInicial;

// Variáveis das raquetes
let j1Y = 160; // Posição vertical inicial da raquete 1 (meio da quadra)
let j2Y = 160; // Posição vertical inicial da raquete 2
const velocidadeRaquete = 7; // Quantos pixels a raquete sobe ou desce por frame
const alturaRaquete = 80;    // Mesma altura definida no style.css
const alturaJogo = 400;      // Mesma altura da .pong definida no style.css

// Estado da partida (nomes, placar e flag se o jogo está rodando ou pausado no menu)
let nomeJogador1 = 'JOGADOR 1';
let nomeJogador2 = 'JOGADOR 2';
let pontosJ1 = 0;
let pontosJ2 = 0;
let jogoAtivo = false; // Começa falso porque o menu inicial está aberto

// Variáveis do cronômetro
let tempoInicio = 0;           // Guarda o carimbo de tempo exato em milissegundos de quando a partida começou
let intervaloCronometro = null; // Guarda o ID do temporizador (setInterval) para podermos pará-lo depois

// ==================== 3. CONTROLE DO TECLADO ====================
// Objeto que guarda o estado de cada tecla (ex: teclas['w'] = true enquanto estiver segurando)
const teclas = {};
// Quando aperta uma tecla, marca como true
document.addEventListener('keydown', (evento) => teclas[evento.key] = true);
// Quando solta a tecla, marca como false
document.addEventListener('keyup', (evento) => teclas[evento.key] = false);

// ==================== 4. EVENTOS DE BOTÕES E FORMULÁRIO ====================
// Dispara quando o usuário clica em "INICIAR JOGO" ou aperta Enter no formulário
formNomes.addEventListener('submit', (evento) => {
    evento.preventDefault(); // Impede o navegador de recarregar a página (comportamento padrão de formulários)

    // Pega o texto digitado, tira espaços extras (trim) e deixa tudo em MAIÚSCULO (toUpperCase)
    nomeJogador1 = inputJ1.value.trim().toUpperCase() || 'JOGADOR 1';
    nomeJogador2 = inputJ2.value.trim().toUpperCase() || 'JOGADOR 2';

    // Pega os códigos das cores escolhidas nos inputs type="color"
    const corEscolhidaJ1 = inputCorJ1.value;
    const corEscolhidaJ2 = inputCorJ2.value;
 
    // Atualiza os nomes lá no cabeçalho acima da quadra
    spanNomeJ1.textContent = nomeJogador1;
    spanNomeJ2.textContent = nomeJogador2;

    // Pinta as raquetes e os nomes do cabeçalho com as cores escolhidas
    jogador1.style.backgroundColor = corEscolhidaJ1;
    spanNomeJ1.style.color = corEscolhidaJ1;

    jogador2.style.backgroundColor = corEscolhidaJ2;
    spanNomeJ2.style.color = corEscolhidaJ2;

    // Esconde a tela inicial e inicia a partida
    telaInicial.classList.add('oculto');
    iniciarPartida();
});

// Botão "JOGAR NOVAMENTE" na tela final: esconde o ranking e reinicia direto com os mesmos nomes/cores
btnJogarNovamente.addEventListener('click', () => {
    telaFinal.classList.add('oculto');
    iniciarPartida();
});

// Botão "TROCAR JOGADORES" na tela final: limpa os campos de texto e volta para a tela inicial
btnTrocarNomes.addEventListener('click', () => {
    telaFinal.classList.add('oculto');
    inputJ1.value = '';
    inputJ2.value = '';
    telaInicial.classList.remove('oculto');
});

// ==================== 5. FUNÇÕES DE CONTROLE DA PARTIDA ====================
// Zera placar, centraliza raquetes, lança a bola e liga o cronômetro
function iniciarPartida() {
    pontosJ1 = 0;
    pontosJ2 = 0;
    placarJ1.textContent = '0';
    placarJ2.textContent = '0';
    spanTempoAtual.textContent = '0.00';

    // Volta as duas raquetes para o meio da quadra
    j1Y = 160;
    j2Y = 160;
    jogador1.style.top = j1Y + 'px';
    jogador2.style.top = j2Y + 'px';

    // Sorteia aleatoriamente se a bola começa indo para a direita (1) ou esquerda (-1)
    resetarBola(Math.random() > 0.5 ? 1 : -1);

    // Marca o horário exato de início em milissegundos de alta precisão
    tempoInicio = performance.now();
    jogoAtivo = true;

    // Limpa qualquer cronômetro anterior e cria um novo que atualiza o visor a cada 50ms (0.05s)
    clearInterval(intervaloCronometro);
    intervaloCronometro = setInterval(() => {
        if (jogoAtivo) {
            const decorrido = ((performance.now() - tempoInicio) / 1000).toFixed(2);
            spanTempoAtual.textContent = decorrido;
        }
    }, 50);
}

// Coloca a bola no centro da quadra após cada ponto e restaura a velocidade inicial
function resetarBola(direcao) {
    bolaX = 390;
    bolaY = 190;
    // Multiplica pela direção (1 = direita, -1 = esquerda) para sacar na direção de quem sofreu o ponto
    velocidadeBolaX = velocidadeInicial * direcao;
    // Sorteia se a bola vai sair na diagonal para baixo (+) ou para cima (-)
    velocidadeBolaY = Math.random() > 0.5 ? velocidadeInicial : -velocidadeInicial;
}

// Aumenta a dificuldade progressivamente a cada vez que alguém rebate a bola
function aumentarVelocidade() {
    if (Math.abs(velocidadeBolaX) < velocidadeMaxima) {
        velocidadeBolaX *= 1.12; // Multiplica por 1.12 (aumento de 12% na velocidade)
        velocidadeBolaY *= 1.12;
    }
}

// Checa se algum jogador atingiu os 5 pontos
function verificarVitoria() {
    if (pontosJ1 >= limitePontos || pontosJ2 >= limitePontos) {
        jogoAtivo = false;               // Pausa a movimentação na quadra
        clearInterval(intervaloCronometro); // Para o relógio

        // Calcula o tempo final exato
        const tempoTotal = ((performance.now() - tempoInicio) / 1000).toFixed(2);
        spanTempoAtual.textContent = tempoTotal;

        // Define quem ganhou e quem perdeu usando operador ternário (? :)
        const vencedor = pontosJ1 >= limitePontos ? nomeJogador1 : nomeJogador2;
        const perdedor = pontosJ1 >= limitePontos ? nomeJogador2 : nomeJogador1;

        // Preenche a tela final e remove a classe "oculto" para exibi-la
        textoVencedor.textContent = `${vencedor} VENCEU!`;
        spanTempoFinal.textContent = tempoTotal;
        telaFinal.classList.remove('oculto');

        // Envia o resultado para o PHP e busca o ranking atualizado
        salvarECarregarRanking(vencedor, perdedor, tempoTotal);
    }
}

// ==================== 6. COMUNICAÇÃO COM O BACK-END (PHP) ====================
// Função assíncrona (async/await) para conversar com o servidor sem travar o navegador
async function salvarECarregarRanking(vencedor, perdedor, tempo) {
    corpoRanking.innerHTML = '<tr><td colspan="4">Salvando tempo...</td></tr>';

    try {
        // Envia uma requisição HTTP POST com os dados da partida convertidos em texto JSON
        const resposta = await fetch('ranking.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vencedor, perdedor, tempo })
        });

        // Aguarda o PHP responder e converte o JSON recebido de volta para um array JavaScript
        const ranking = await resposta.json();
        corpoRanking.innerHTML = ''; // Limpa a mensagem "Salvando tempo..."

        // Percorre cada partida do Top 10 e cria uma linha <tr> na tabela HTML
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
        // Caso o servidor PHP esteja desligado ou ocorra erro de rede, avisa na tabela sem quebrar o jogo
        corpoRanking.innerHTML = '<tr><td colspan="4">Erro ao conectar com ranking.php</td></tr>';
    }
}

// ==================== 7. LOOP PRINCIPAL DO JOGO (FÍSICA E COLISÃO) ====================
function atualizarJogo() {
    if (jogoAtivo) {
        // --- MOVIMENTAÇÃO DAS RAQUETES ---
        // Jogador 1 (W sobe / S desce). Checa > 0 e < (400 - 80) para a raquete não sair da quadra
        if ((teclas['w'] || teclas['W']) && j1Y > 0) {
            j1Y -= velocidadeRaquete; // No navegador, Y = 0 é o topo, então diminuir Y faz subir
        }
        if ((teclas['s'] || teclas['S']) && j1Y < (alturaJogo - alturaRaquete)) {
            j1Y += velocidadeRaquete; // Aumentar Y faz descer
        }

        // Jogador 2 (Setas para cima e para baixo)
        if (teclas['ArrowUp'] && j2Y > 0) {
            j2Y -= velocidadeRaquete;
        }
        if (teclas['ArrowDown'] && j2Y < (alturaJogo - alturaRaquete)) {
            j2Y += velocidadeRaquete;
        }

        // Atualiza a posição visual das raquetes no CSS
        jogador1.style.top = j1Y + 'px';
        jogador2.style.top = j2Y + 'px';

        // --- MOVIMENTAÇÃO DA BOLA ---
        bolaX += velocidadeBolaX;
        bolaY += velocidadeBolaY;

        // Colisão com teto (Y <= 0) e chão (Y >= 400 - 20): inverte o sinal da velocidade vertical
        if (bolaY <= 0 || bolaY >= (alturaJogo - tamanhoBola)) {
            velocidadeBolaY = -velocidadeBolaY;
        }

        // --- COLISÃO COM A RAQUETE 1 (Esquerda) ---
        // Verifica se a bola está na faixa horizontal da frente da raquete (entre 10px e 20px) e indo para a esquerda (< 0)
        if (bolaX <= 20 && bolaX >= 10 && velocidadeBolaX < 0) {
            // Verifica se a altura da bola cruza com a altura atual da raquete 1
            if (bolaY + tamanhoBola >= j1Y && bolaY <= j1Y + alturaRaquete) {
                // Math.abs garante o valor absoluto positivo da velocidade, 
                // evitando que a bola inverta o sinal duas vezes seguidas e fique presa dentro da raquete.
                velocidadeBolaX = Math.abs(velocidadeBolaX); // Força velocidade positiva (vai para a direita)
                aumentarVelocidade();
            }
        }

        // --- COLISÃO COM A RAQUETE 2 (Direita) ---
        // Como a quadra tem 800px, a raquete está a 10px da direita (780px) e a bola tem 20px (780 - 20 = 760px)
        if (bolaX >= 760 && bolaX <= 770 && velocidadeBolaX > 0) {
            // Verifica se a altura da bola cruza com a altura atual da raquete 2
            if (bolaY + tamanhoBola >= j2Y && bolaY <= j2Y + alturaRaquete) {
                // Força o valor negativo absoluto (-Math.abs) para rebate obrigatório à esquerda
                velocidadeBolaX = -Math.abs(velocidadeBolaX); // Força velocidade negativa (vai para a esquerda)
                aumentarVelocidade();
            }
        }

        // --- SISTEMA DE PONTOS (GOL) ---
        // Se passou da parede esquerda (X < 0), ponto do Jogador 2
        if (bolaX < 0) {
            pontosJ2++;
            if (placarJ2) placarJ2.textContent = pontosJ2;
            verificarVitoria();
            if (jogoAtivo) resetarBola(1); // Saca para a direita (em direção ao J2)
        }
        // Se passou da parede direita (X > 800), ponto do Jogador 1
        if (bolaX > 800) {
            pontosJ1++;
            if (placarJ1) placarJ1.textContent = pontosJ1;
            verificarVitoria();
            if (jogoAtivo) resetarBola(-1); // Saca para a esquerda (em direção ao J1)
        }

        // Atualiza a posição visual da bola no CSS
        bola.style.left = bolaX + 'px';
        bola.style.top = bolaY + 'px';
    }

    // Agenda a próxima execução sincronizada com a taxa de atualização do monitor (60fps, 120fps, etc.)
    requestAnimationFrame(atualizarJogo);
}

// Posiciona a bola no centro inicial e dá a partida no loop infinito de frames
bola.style.left = bolaX + 'px';
bola.style.top = bolaY + 'px';
requestAnimationFrame(atualizarJogo);