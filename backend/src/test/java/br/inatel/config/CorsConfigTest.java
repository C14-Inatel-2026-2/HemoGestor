package br.inatel.config;

import br.inatel.controller.HealthController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
@TestPropertySource(properties = "CORS_ALLOWED_ORIGINS=https://hemogestor.onrender.com,http://localhost:5173")
class CorsConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void devePermitirOrigemPublicaConfigurada() throws Exception {
        mockMvc.perform(options("/api/health")
                        .header("Origin", "https://hemogestor.onrender.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://hemogestor.onrender.com"));
    }

    @Test
    void devePermitirOrigemLocalDaLista() throws Exception {
        mockMvc.perform(options("/api/health")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void deveBloquearOrigemNaoConfigurada() throws Exception {
        mockMvc.perform(options("/api/health")
                        .header("Origin", "https://site-desconhecido.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }
}