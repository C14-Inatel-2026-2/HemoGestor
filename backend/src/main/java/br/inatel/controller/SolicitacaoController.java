package br.inatel.controller;

import br.inatel.dto.SolicitacaoRequestDTO;
import br.inatel.dto.SolicitacaoResponseDTO;
import br.inatel.service.SolicitacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/solicitacoes")
public class SolicitacaoController {
    private final SolicitacaoService service;

    public SolicitacaoController(SolicitacaoService service){
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SolicitacaoResponseDTO> cadastrar(@RequestBody SolicitacaoRequestDTO dto){
        SolicitacaoResponseDTO resposta = service.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }
}
