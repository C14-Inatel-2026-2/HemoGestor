pipeline {
    agent any

    stages {
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh './mvnw clean package'
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run lint'
                    sh 'npm run build'
                }
            }
        }
        stage('Tests Backend') {
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

        stage('Deploy') {
            steps {
                echo 'Deploy será configurado na issue #20.'
            }
        }
    }
}