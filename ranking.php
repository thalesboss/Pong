<?php
// 1. Define o cabeçalho HTTP informando ao navegador (e ao fetch) que a resposta é JSON puro em UTF-8
header('Content-Type: application/json; charset=utf-8');

// 2. Define o nome do arquivo que funciona como "banco de dados" leve do ranking
$arquivo = 'ranking.json';

// 3. Proteção para a primeira execução: se o arquivo ainda não existir, cria um com uma lista vazia []
if (!file_exists($arquivo)) {
    file_put_contents($arquivo, '[]');
}

// 4. Lê o conteúdo em texto do arquivo ranking.json e converte para um Array manipulável no PHP
$conteudo = file_get_contents($arquivo);
$ranking = json_decode($conteudo, true);

// Garante que $ranking seja sempre um array válido, evitando erros caso o arquivo esteja vazio ou corrompido
if (!is_array($ranking)) {
    $ranking = [];
}

// 5. Verifica se o JavaScript enviou dados novos via POST (ou seja, alguém acabou de vencer uma partida)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Lê o pacote JSON bruto enviado no corpo da requisição fetch()
    $inputJSON = file_get_contents('php://input');
    $dadosRecebidos = json_decode($inputJSON, true);

    // Valida se os campos 'nome' e 'tempo' realmente vieram no pacote
    if (isset($dadosRecebidos['nome']) && isset($dadosRecebidos['tempo'])) {
        
        // Remove espaços nas pontas e arranca tags HTML/JS para evitar ataques XSS
        $nome = trim(strip_tags($dadosRecebidos['nome']));
        if (empty($nome)) {
            $nome = 'Anônimo';
        }
        
        // Converte forçadamente o tempo para número inteiro (type casting)
        $tempo = (int) $dadosRecebidos['tempo'];

        // Adiciona o novo vencedor ao final da lista $ranking
        $ranking[] = [
            'nome'  => $nome,
            'tempo' => $tempo
        ];

        // 6. Ordenação Speedrun: coloca os MENORES tempos no topo da lista ($a - $b)
        usort($ranking, function($a, $b) {
            return $a['tempo'] - $b['tempo'];
        });

        // 7. Limita o ranking ao Top 5, descartando do 6º lugar para baixo
        $ranking = array_slice($ranking, 0, 5);

        // 8. Grava a lista atualizada e formatada de volta no arquivo ranking.json
        file_put_contents($arquivo, json_encode($ranking, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}

// 9. Devolve o Top 5 atualizado em formato JSON para o JavaScript (funciona tanto para GET quanto para POST)
echo json_encode($ranking, JSON_UNESCAPED_UNICODE);
?>