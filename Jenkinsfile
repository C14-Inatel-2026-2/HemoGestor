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
                echo 'Deploy será configurado na issue #20.'
            }
        }
    }
}