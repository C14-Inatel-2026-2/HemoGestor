pipeline {
    agent any

    stages {
        stage('Build') {
            parallel {
                stage('Build Back') {
                    steps {
                        dir('backend') {
                            sh './mvnw clean package'
                        }
                    }
                }

                stage('Build Front') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run lint'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Testes') {
            parallel {
                stage('Testes Back') {
                    steps {
                        dir('backend') {
                            sh './mvnw verify'
                        }
                    }

                    post {
                        always {
                            junit 'backend/target/surefire-reports/*.xml'
                            recordCoverage(
                                            id: 'cobertura-backend',
                                            name: 'Cobertura Backend',
                                            tools: [[
                                                parser: 'JACOCO',
                                                pattern: 'backend/target/site/jacoco/jacoco.xml'
                                            ]]
                                        )
                            archiveArtifacts artifacts: 'backend/target/site/jacoco/**',
                                             fingerprint: true
                        }
                    }
                }

                stage('Testes Front') {
                    steps {
                        dir('frontend') {
                            sh 'npm run test:ci'
                        }
                    }

                    post {
                        always {
                            junit 'frontend/test-results/junit.xml'

                            recordCoverage(
                                id: 'cobertura-frontend',
                                name: 'Cobertura Frontend',
                                tools: [[parser: 'COBERTURA', pattern: 'frontend/coverage/cobertura-coverage.xml']]
                            )

                            archiveArtifacts artifacts: 'frontend/coverage/**',
                                             fingerprint: true
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'cp .env.example .env'

                sh 'docker compose -p hemogestor up -d --build mysql backend frontend'

                sh '''
                    BASE_URL=""

                    for i in $(seq 1 30); do
                        if curl -fs http://backend:8080/api/health > /dev/null; then
                            BASE_URL="http://backend:8080"
                            break
                        fi

                        if curl -fs http://host.docker.internal:8081/api/health > /dev/null; then
                            BASE_URL="http://host.docker.internal:8081"
                            break
                        fi

                        echo "Aguardando o backend subir... ($i/30)"
                        sleep 5
                    done

                    if [ -z "$BASE_URL" ]; then
                        echo "O backend não respondeu ao health check."
                        exit 1
                    fi

                    echo "Backend disponível em $BASE_URL"

                    for rota in doadores doacoes bolsas solicitacoes; do
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$rota")

                        if [ "$STATUS" -ne 200 ]; then
                            echo "Falha na rota GET /$rota: HTTP $STATUS"
                            exit 1
                        fi

                        echo "GET /$rota: HTTP 200"
                    done

                    echo ""
                    echo "Todas as rotas principais responderam corretamente."
                    echo "Aplicação no ar: frontend em http://localhost:5173"
                '''
            }
        }
    }
}