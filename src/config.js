/**
 * RAKSHAK Application Configuration
 * All values sourced from environment variables (Vite injects VITE_ prefixed vars)
 */

const config = {
    // AWS Cognito
    cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
        clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    },

    // API Gateway
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
}

export default config
