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
    }
}