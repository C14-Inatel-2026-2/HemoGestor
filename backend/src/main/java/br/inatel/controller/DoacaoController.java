package br.inatel.controller;

import br.inatel.dto.DoacaoMapper;
import br.inatel.dto.DoacaoRequestDTO;
import br.inatel.dto.DoacaoResponseDTO;
import br.inatel.model.Doacao;
import br.inatel.model.Doador;
import br.inatel.service.DoacaoService;
import br.inatel.service.DoadorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/doacoes")
public class DoacaoController {
    private final DoacaoService doacaoService;
    private final DoadorService doadorService;

    public DoacaoController(DoacaoService doacaoService, DoadorService doadorService) {
        this.doacaoService = doacaoService;
        this.doadorService = doadorService;
    }

    @PostMapping
    public ResponseEntity<DoacaoResponseDTO> cadastrar(@Valid @RequestBody DoacaoRequestDTO dto) {
        Doador doador = doadorService.buscarPorId(dto.getDoadorId())
                .orElse(null);
        if (doador == null) {
            return ResponseEntity.notFound().build();
        }
        Doacao doacao = DoacaoMapper.toEntity(dto, doador);
        Doacao doacaoSalva = doacaoService.salvar(doacao);

        return ResponseEntity.status(201).body(DoacaoMapper.toResponseDTO(doacaoSalva));
    }

    @GetMapping
    public ResponseEntity<List<DoacaoResponseDTO>> listarTodas() {
        List<DoacaoResponseDTO> doacoes = doacaoService.listarTodas()
                .stream()
                .map(DoacaoMapper::toResponseDTO)
                .toList();

        return ResponseEntity.ok(doacoes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoacaoResponseDTO> buscarPorId(
            @PathVariable("id") Long id
    ) {
        return doacaoService.buscarPorID(id)
                .map(DoacaoMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/concluir")
    public ResponseEntity<DoacaoResponseDTO> concluir(
            @PathVariable("id") Long id) {

        return doacaoService.concluir(id)
                .map(DoacaoMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/descartar")
    public ResponseEntity<DoacaoResponseDTO> descartar(
            @PathVariable("id") Long id) {

        return doacaoService.descartar(id)
                .map(DoacaoMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doador/{doadorId}")
    public ResponseEntity<List<DoacaoResponseDTO>> buscarPorDoador(
            @PathVariable("doadorId") Long doadorId) {

        List<DoacaoResponseDTO> doacoes = doacaoService.buscarPorDoador(doadorId)
                .stream()
                .map(DoacaoMapper::toResponseDTO)
                .toList();

        return ResponseEntity.ok(doacoes);
    }
}
