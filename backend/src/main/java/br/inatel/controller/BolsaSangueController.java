package br.inatel.controller;

import br.inatel.dto.BolsaSangueMapper;
import br.inatel.dto.BolsaSangueResponseDTO;
import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.service.BolsaSangueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bolsas")
public class BolsaSangueController {
    private final BolsaSangueService service;

    public BolsaSangueController(BolsaSangueService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> listarTodas(){
        List<BolsaSangueResponseDTO> resposta = service.listarTodas().stream().map(BolsaSangueMapper::toResponseDTO).toList();

        if (resposta.isEmpty()) {
            return ResponseEntity.ok(Map.of("mensagem", "Não existem bolsas cadastradas."));
        }

        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/tipo")
    public ResponseEntity<?> listarPorTipoSanguineo(@RequestParam("tipoSanguineo") String tipoSanguineo){
        List<BolsaSangueResponseDTO> resposta = service.listarPorTipoSanguineo(tipoSanguineo).stream().map(BolsaSangueMapper::toResponseDTO).toList();

        if (resposta.isEmpty()) {
            return ResponseEntity.ok(Map.of("mensagem", "Não existem bolsas cadastradas para este tipo sanguíneo."));
        }

        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/validas")
    public ResponseEntity<?> listarValidas(){
        List<BolsaSangueResponseDTO> resposta = service.listarValidas().stream().map(BolsaSangueMapper::toResponseDTO).toList();

        if (resposta.isEmpty()) {
            return ResponseEntity.ok(Map.of("mensagem", "Não existem bolsas válidas cadastradas."));
        }

        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/vencidas")
    public ResponseEntity<?> listarVencidas() {
        List<BolsaSangueResponseDTO> resposta = service.listarVencidas().stream().map(BolsaSangueMapper::toResponseDTO).toList();

        if (resposta.isEmpty()) {
            return ResponseEntity.ok(Map.of("mensagem", "Não existem bolsas vencidas cadastradas."));
        }

        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/situacao")
    public ResponseEntity<?> listarPorSituacao(@RequestParam("situacao")SituacaoBolsa situacao){
        List<BolsaSangueResponseDTO> resposta = service.listarPorSituacao(situacao).stream().map(BolsaSangueMapper::toResponseDTO).toList();
        if(resposta.isEmpty()){
            return ResponseEntity.ok(Map.of("mensagem", "Não existem bolsas cadastradas com esta situação."));
        }
        return ResponseEntity.ok(resposta);
    }
}
