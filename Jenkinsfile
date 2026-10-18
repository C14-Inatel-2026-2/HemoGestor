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
                    for i in $(seq 1 30); do
                        if curl -fs http://backend:8080/api/health ||
                           curl -fs http://host.docker.internal:8081/api/health; then
                            echo ""
                            echo "Aplicação no ar: frontend em http://localhost:5173"
                            exit 0
                        fi

                        echo "Aguardando o backend subir... ($i/30)"
                        sleep 5
                    done

                    echo "O backend não respondeu ao health check."
                    exit 1
                '''
            }
        }
    }
}