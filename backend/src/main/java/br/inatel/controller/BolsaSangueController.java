package br.inatel.controller;

import br.inatel.dto.BolsaSangueMapper;
import br.inatel.dto.BolsaSangueResponseDTO;
import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.model.BolsaSangue;
import br.inatel.service.BolsaSangueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bolsas")
public class BolsaSangueController {
    private final BolsaSangueService service;

    public BolsaSangueController(BolsaSangueService service) {
        this.service = service;
    }

    private List<BolsaSangueResponseDTO> mapearParaDTO(List<BolsaSangue> bolsas) {
        return bolsas.stream()
                .map(BolsaSangueMapper::toResponseDTO)
                .toList();
    }

    @GetMapping
    public ResponseEntity<?> listarTodas(){
        List<BolsaSangueResponseDTO> resposta = mapearParaDTO(service.listarTodas());
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/tipo")
    public ResponseEntity<?> listarPorTipoSanguineo(@RequestParam("tipoSanguineo") String tipoSanguineo){
        List<BolsaSangueResponseDTO> resposta = mapearParaDTO(service.listarPorTipoSanguineo(tipoSanguineo));
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/validas")
    public ResponseEntity<?> listarValidas(){
        List<BolsaSangueResponseDTO> resposta = mapearParaDTO(service.listarValidas());
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/vencidas")
    public ResponseEntity<?> listarVencidas() {
        List<BolsaSangueResponseDTO> resposta = mapearParaDTO(service.listarVencidas());
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/situacao")
    public ResponseEntity<?> listarPorSituacao(@RequestParam("situacao")SituacaoBolsa situacao){
        List<BolsaSangueResponseDTO> resposta = mapearParaDTO(service.listarPorSituacao(situacao));
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BolsaSangueResponseDTO> buscarPorId(@PathVariable("id") Long id) {
        BolsaSangue bolsa = service.buscarPorId(id);
        return ResponseEntity.ok(BolsaSangueMapper.toResponseDTO(bolsa));
    }

    @PatchMapping("/{id}/descartar")
    public ResponseEntity<BolsaSangueResponseDTO> descartar(@PathVariable("id") Long id) {
        BolsaSangue bolsa = service.descartar(id);
        return ResponseEntity.ok(BolsaSangueMapper.toResponseDTO(bolsa));
    }
}
