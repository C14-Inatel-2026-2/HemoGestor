package br.inatel.controller;

import br.inatel.dto.BolsaSangueMapper;
import br.inatel.dto.BolsaSangueResponseDTO;
import br.inatel.service.BolsaSangueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/bolsas")
public class BolsaSangueController {
    private final BolsaSangueService service;

    public BolsaSangueController(BolsaSangueService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<BolsaSangueResponseDTO>> listarTodas(){
        List<BolsaSangueResponseDTO> resposta = service.listarTodas().stream().map(BolsaSangueMapper::toResponseDTO).toList();
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/tipo")
    public ResponseEntity<List<BolsaSangueResponseDTO>> listarPorTipoSanguineo(@RequestParam("tipoSanguineo") String tipoSanguineo){
        List<BolsaSangueResponseDTO> resposta = service.listarPorTipoSanguineo(tipoSanguineo).stream().map(BolsaSangueMapper::toResponseDTO).toList();
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/validas")
    public ResponseEntity<List<BolsaSangueResponseDTO>> listarValidas(){
        List<BolsaSangueResponseDTO> resposta = service.listarValidas().stream().map(BolsaSangueMapper::toResponseDTO).toList();
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/vencidas")
    public ResponseEntity<List<BolsaSangueResponseDTO>> listarVencidas() {
        List<BolsaSangueResponseDTO> resposta = service.listarVencidas().stream().map(BolsaSangueMapper::toResponseDTO).toList();
        return ResponseEntity.ok(resposta);
    }
}
