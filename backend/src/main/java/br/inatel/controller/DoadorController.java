package br.inatel.controller;

import br.inatel.model.Doador;
import br.inatel.service.DoadorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doadores")
public class DoadorController {
    // lógica relacionada aos doadores
    private final DoadorService service;

    //construtor usado pelo Spring para injetar o doadorService
    public DoadorController(DoadorService service){
        this.service = service;
    }

    //endpoint POST para cadastrar um novo doador
    @PostMapping
    public ResponseEntity<Doador> cadastrar(@RequestBody Doador doador){
       // envia o doador recebido para o service salvar no bd
        Doador doadorSalvo = service.salvar(doador);
        // retorna o doador salvo na resposta da requisição
        return ResponseEntity.ok(doadorSalvo);
    }

    // Endpoint PUT para atualizar um doador pelo id
    @PutMapping("/{id}")
    public ResponseEntity<Doador> atualizar(
            @PathVariable("id") Long id,
            @RequestBody Doador doador) {

        return service.atualizar(id, doador)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //endpoint GET para listar todos os doadores
    @GetMapping
    public ResponseEntity<List<Doador>> listarTodos() {
        List<Doador> doadores = service.listarTodos();

        return ResponseEntity.ok(doadores);
    }

    // endpoint GET para buscar um doador pelo id
    @GetMapping("/{id}")
    public ResponseEntity<Doador> buscarPorId(@PathVariable("id") Long id) {

        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //endpoint DELETE para remover um doador pelo id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id) {

        //verifica se o doador existe antes de excluir
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        //exclui o doador
        service.deletar(id);

        //retorna 204 No Content quando a exclusão é realizada
        return ResponseEntity.noContent().build();
    }
}
