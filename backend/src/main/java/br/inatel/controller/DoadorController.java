package br.inatel.controller;

import br.inatel.dto.DoadorMapper;
import br.inatel.dto.DoadorRequestDTO;
import br.inatel.dto.DoadorResponseDTO;
import br.inatel.model.Doador;
import br.inatel.service.DoadorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/doadores")
public class DoadorController {
    // lógica relacionada aos doadores
    private final DoadorService service;

    public DoadorController(DoadorService service) {
        this.service = service;
    }

    // cadastra um novo doador
    @PostMapping
    public ResponseEntity<DoadorResponseDTO> cadastrar(
            @Valid @RequestBody DoadorRequestDTO dto) {

        Doador doador = DoadorMapper.toEntity(dto);

        Doador doadorSalvo = service.salvar(doador);

        return ResponseEntity
                .status(201)
                .body(DoadorMapper.toResponseDTO(doadorSalvo));
    }

    // atualiza um doador existente
    @PutMapping("/{id}")
    public ResponseEntity<DoadorResponseDTO> atualizar(
            @PathVariable ("id") Long id,
            @Valid @RequestBody DoadorRequestDTO dto) {

        Doador novosDados = DoadorMapper.toEntity(dto);

        return service.atualizar(id, novosDados)
                .map(DoadorMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // lista todos os doadores
    @GetMapping
    public ResponseEntity<List<DoadorResponseDTO>> listarTodos() {

        List<DoadorResponseDTO> doadores = service.listarTodos()
                .stream()
                .map(DoadorMapper::toResponseDTO)
                .toList();

        return ResponseEntity.ok(doadores);
    }

    // busca um doador pelo id
    @GetMapping("/{id}")
    public ResponseEntity<DoadorResponseDTO> buscarPorId(
            @PathVariable("id") Long id) {

        return service.buscarPorId(id)
                .map(DoadorMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // remove um doador pelo id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable ("id") Long id) {

        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        service.deletar(id);

        return ResponseEntity.noContent().build();
    }
}
