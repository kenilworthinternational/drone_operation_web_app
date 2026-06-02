pipeline {
    agent any

    environment {
        SERVER_PATH = "${env.WORKSPACE}"
        PROD_SITE_PATH = 'C:\\inetpub\\wwwroot\\dsms-prod'
        DEV_SITE_PATH = 'C:\\inetpub\\wwwroot\\dsms-dev'
        IS_PROD = "${env.BRANCH_NAME == 'main'}"
        BUILD_COMMAND = "${env.BRANCH_NAME == 'main' ? 'build:prod' : 'build:dev'}"
        TARGET_SITE_PATH = "${env.BRANCH_NAME == 'main' ? PROD_SITE_PATH : DEV_SITE_PATH}"
        TARGET_ENV = "${env.BRANCH_NAME == 'main' ? 'prod' : 'dev'}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out branch: ${env.BRANCH_NAME}"
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat """
                    cd /d ${SERVER_PATH}
                    if not exist package.json (
                        echo package.json not found in workspace path: ${SERVER_PATH}
                        exit /b 1
                    )
                    call npm install --legacy-peer-deps
                """
            }
        }

        stage('Build Frontend') {
            steps {
                echo "Building ${TARGET_ENV} bundle with npm run ${BUILD_COMMAND}"
                bat """
                    cd /d ${SERVER_PATH}
                    call npm run ${BUILD_COMMAND}
                """
            }
        }

        stage('Deploy To IIS Root') {
            steps {
                echo "Deploying build output to ${TARGET_SITE_PATH}"
                bat """
                    if not exist "${SERVER_PATH}\\build\\index.html" (
                        echo Build output missing at ${SERVER_PATH}\\build
                        exit /b 1
                    )
                    if not exist "${TARGET_SITE_PATH}" mkdir "${TARGET_SITE_PATH}"
                    powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Test-Path '${TARGET_SITE_PATH}') { Get-ChildItem -Path '${TARGET_SITE_PATH}' -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue }"
                    xcopy /E /Y /I "${SERVER_PATH}\\build\\*" "${TARGET_SITE_PATH}\\"
                    if exist "${SERVER_PATH}\\deployment\\web.config" copy /Y "${SERVER_PATH}\\deployment\\web.config" "${TARGET_SITE_PATH}\\web.config"
                """
            }
        }

        stage('Verify Deployment') {
            steps {
                bat """
                    if exist "${TARGET_SITE_PATH}\\index.html" (
                        echo Deployment verification passed for ${TARGET_ENV}
                    ) else (
                        echo Deployment verification failed: index.html missing
                        exit /b 1
                    )
                """
            }
        }
    }

    post {
        success {
            echo "Frontend ${TARGET_ENV} deployment completed successfully."
        }
        failure {
            echo "Frontend deployment failed. Check build logs."
        }
    }
}
