pipeline {
    agent any

    stages {
        stage('Build') {
            parallel {
                stage('Build Back') {
                    steps {
                        dir('backend') {
                            sh 'env -u SPRING_DATASOURCE_URL ./mvnw clean package'
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
                            sh 'env -u SPRING_DATASOURCE_URL ./mvnw verify'
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
            environment {
                BACK_URL = 'https://hemogestor-api.onrender.com'
                FRONT_URL = 'https://hemogestor.onrender.com'
            }

            steps {
                withCredentials([
                    string(credentialsId: 'render-deploy-hook-back', variable: 'RENDER_HOOK_BACK'),
                    string(credentialsId: 'render-deploy-hook-front', variable: 'RENDER_HOOK_FRONT')
                ]) {
                    sh '''
                        curl -fsS -X POST "$RENDER_HOOK_BACK" > /dev/null
                        echo "Deploy do backend solicitado ao Render."

                        curl -fsS -X POST "$RENDER_HOOK_FRONT" > /dev/null
                        echo "Deploy do frontend solicitado ao Render."
                    '''
                }

                sh '''
                    BACK_OK=""

                    for i in $(seq 1 40); do
                        if curl -fs "$BACK_URL/api/health" > /dev/null; then
                            BACK_OK="sim"
                            break
                        fi

                        echo "Aguardando o backend no Render... ($i/40)"
                        sleep 15
                    done

                    if [ -z "$BACK_OK" ]; then
                        echo "O backend publicado não respondeu ao health check."
                        exit 1
                    fi

                    echo "Backend publicado em $BACK_URL"

                    for rota in doadores doacoes bolsas solicitacoes; do
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACK_URL/$rota")

                        if [ "$STATUS" -ne 200 ]; then
                            echo "Falha na rota GET /$rota: HTTP $STATUS"
                            exit 1
                        fi

                        echo "GET /$rota: HTTP 200"
                    done

                    STATUS_FRONT=$(curl -s -o /dev/null -w "%{http_code}" "$FRONT_URL/")

                    if [ "$STATUS_FRONT" -ne 200 ]; then
                        echo "O frontend publicado respondeu HTTP $STATUS_FRONT"
                        exit 1
                    fi

                    echo ""
                    echo "Aplicação publicada:"
                    echo "Frontend: $FRONT_URL"
                    echo "Backend:  $BACK_URL"
                '''
            }
        }
    }
}