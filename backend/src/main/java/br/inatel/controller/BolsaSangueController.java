package br.inatel.controller;

import br.inatel.dto.BolsaSangueMapper;
import br.inatel.dto.BolsaSangueResponseDTO;
import br.inatel.service.BolsaSangueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
        List<BolsaSangueResponseDTO> bolsas = service.listarTodas().stream().map(BolsaSangueMapper::toResponseDTO).toList();
        return ResponseEntity.ok(bolsas);
    }
}
