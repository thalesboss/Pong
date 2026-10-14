const bola = document.querySelector('.bola');
const jogador1 = document.querySelector('.jogador1');
const jogador2 = document.querySelector('.jogador2');

// Seleciona corretamente cada span do placar
const placarJ1 = document.querySelectorAll('.placar span')[0];
const placarJ2 = document.querySelectorAll('.placar span')[1];

// Força a remoção do translate padrão do CSS para que a bola se mova livremente pelas coordenadas X e Y
bola.style.transform = 'none';

const tamanhoBola = 20;
const velocidadeInicial = 4;
const velocidadeMaxima = 16;

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

// Pontuação dos Jogadores
let pontosJ1 = 0;
let pontosJ2 = 0;

// Controle de teclas pressionadas
const teclas = {};
document.addEventListener('keydown', (evento) => teclas[evento.key] = true);
document.addEventListener('keyup', (evento) => teclas[evento.key] = false);

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

function atualizarJogo() {
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
    // Verifica se a bola tocou a frente da raquete 1
    if (bolaX <= 20 && bolaX >= 10 && velocidadeBolaX < 0) {
        if (bolaY + tamanhoBola >= j1Y && bolaY <= j1Y + alturaRaquete) {
            velocidadeBolaX = Math.abs(velocidadeBolaX); // Rebate para a direita
            aumentarVelocidade();
        }
    }

    // --- COLISÃO COM A RAQUETE 2 (Direita) ---
    // Verifica se a bola tocou a frente da raquete 2
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
        resetarBola(1);
    }
    // Ponto do Jogador 1 (Bola passou da direita)
    if (bolaX > 800) {
        pontosJ1++;
        if (placarJ1) placarJ1.textContent = pontosJ1;
        resetarBola(-1);
    }

    // Aplica a nova posição no CSS da bola
    bola.style.left = bolaX + 'px';
    bola.style.top = bolaY + 'px';

    // Executa a função continuamente a cada frame do navegador
    requestAnimationFrame(atualizarJogo);
}

// Inicia o loop do jogo pela primeira vez
requestAnimationFrame(atualizarJogo);