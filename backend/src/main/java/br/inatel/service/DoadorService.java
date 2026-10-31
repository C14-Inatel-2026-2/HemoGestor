package br.inatel.service;
import br.inatel.exception.ConflitoException;
import br.inatel.model.Doador;
import br.inatel.repository.DoacaoRepository;
import br.inatel.repository.DoadorRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class DoadorService {
    private final DoadorRepository repository;
    private final DoacaoRepository doacaoRepository;

    public DoadorService(DoadorRepository repository, DoacaoRepository doacaoRepository){
        this.repository = repository;
        this.doacaoRepository = doacaoRepository;
    }

    public Optional<Doador> buscarPorId(Long id){
        return repository.findById(id);
    }

    public Doador salvar(Doador doador){
        return repository.save(doador);
    }

    // busca todos os doadores cadastrados no banco
    public List<Doador> listarTodos() {
        return repository.findAll();
    }

    //remove um doador pelo id
    //se tentar remover um doador que já tenha doações, lança exceção
    public void deletar(Long id) {
        if (doacaoRepository.existsByDoadorId(id)) {
            throw new ConflitoException(
                    "Não é possível remover um doador que já tem doações registradas."
            );
        }
        repository.deleteById(id);
    }

    //atualiza os dados de um doador que ja existe
    public Optional<Doador> atualizar(Long id, Doador novosDados) {

        return repository.findById(id).map(doador -> {

            doador.setNome(novosDados.getNome());
            doador.setCpf(novosDados.getCpf());
            doador.setData_nascimento(novosDados.getData_nascimento());
            doador.setSexo(novosDados.getSexo());
            doador.setTipo_sanguineo(novosDados.getTipo_sanguineo());
            doador.setEmail(novosDados.getEmail());
            doador.setTelefone(novosDados.getTelefone());
            doador.setCidade(novosDados.getCidade());
            doador.setBairro(novosDados.getBairro());
            doador.setUltima_doacao(novosDados.getUltima_doacao());
            doador.setQtd_doacoes(novosDados.getQtd_doacoes());
            doador.setObservacoes(novosDados.getObservacoes());

            return repository.save(doador);
        });
    }
}
