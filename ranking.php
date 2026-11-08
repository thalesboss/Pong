<?php
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Sao_Paulo');

$arquivoBanco = __DIR__ . '/ranking_dados.json';

if (file_exists($arquivoBanco)) {
    $ranking = json_decode(file_get_contents($arquivoBanco), true) ?? [];
} else {
    $ranking = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);

    if (!empty($dados['vencedor']) && isset($dados['tempo'])) {
        $ranking[] = [
            'vencedor' => htmlspecialchars(strip_tags($dados['vencedor'])),
            'perdedor' => htmlspecialchars(strip_tags($dados['perdedor'] ?? '')),
            'tempo_segundos' => (float)$dados['tempo'],
            'data' => date('d/m/Y H:i')
        ];

        // Ordena pelo menor tempo (ordem crescente)
        usort($ranking, function ($a, $b) {
            // <=> Spaceship - retorna se ele é maior, igual ou menor
            return $a['tempo_segundos'] <=> $b['tempo_segundos'];
        });

        file_put_contents($arquivoBanco, json_encode($ranking, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}

echo json_encode(array_slice($ranking, 0, 10));