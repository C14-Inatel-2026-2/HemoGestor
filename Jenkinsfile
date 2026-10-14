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
    }
}