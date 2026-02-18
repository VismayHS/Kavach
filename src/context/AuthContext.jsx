import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
    CognitoUserAttribute,
} from 'amazon-cognito-identity-js'
import config from '../config'

const AuthContext = createContext(null)

// Only create the pool if Cognito is configured — prevents crash when .env isn't set up
const cognitoConfigured = !!(config.cognito.userPoolId && config.cognito.clientId)
let userPool = null

if (cognitoConfigured) {
    userPool = new CognitoUserPool({
        UserPoolId: config.cognito.userPoolId,
        ClientId: config.cognito.clientId,
    })
}

function requirePool() {
    if (!userPool) {
        throw new Error(
            'AWS Cognito is not configured. Please set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID in your .env file.'
        )
    }
    return userPool
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        if (!userPool) {
            setLoading(false)
            return
        }
        const cognitoUser = userPool.getCurrentUser()

        if (cognitoUser) {
            cognitoUser.getSession((err, session) => {
                if (err || !session?.isValid()) {
                    setLoading(false)
                    return
                }
                setUser({
                    username: cognitoUser.getUsername(),
                    sub: session.getIdToken().payload.sub,
                    email: session.getIdToken().payload.email,
                })
                setToken(session.getIdToken().getJwtToken())
                setLoading(false)
            })
        } else {
            setLoading(false)
        }
    }, [])

    const signup = useCallback(async (email, password, name, phone) => {
        const pool = requirePool()
        return new Promise((resolve, reject) => {
            const attributes = [
                new CognitoUserAttribute({ Name: 'email', Value: email }),
                new CognitoUserAttribute({ Name: 'name', Value: name }),
            ]
            if (phone) {
                attributes.push(new CognitoUserAttribute({ Name: 'phone_number', Value: phone }))
            }

            pool.signUp(email, password, attributes, null, (err, result) => {
                if (err) return reject(err)
                resolve(result)
            })
        })
    }, [])

    const verify = useCallback(async (email, code) => {
        const pool = requirePool()
        return new Promise((resolve, reject) => {
            const cognitoUser = new CognitoUser({ Username: email, Pool: pool })
            cognitoUser.confirmRegistration(code, true, (err, result) => {
                if (err) return reject(err)
                resolve(result)
            })
        })
    }, [])

    const login = useCallback(async (email, password) => {
        const pool = requirePool()
        return new Promise((resolve, reject) => {
            const cognitoUser = new CognitoUser({ Username: email, Pool: pool })
            const authDetails = new AuthenticationDetails({ Username: email, Password: password })

            cognitoUser.authenticateUser(authDetails, {
                onSuccess: (session) => {
                    const userData = {
                        username: cognitoUser.getUsername(),
                        sub: session.getIdToken().payload.sub,
                        email: session.getIdToken().payload.email,
                    }
                    setUser(userData)
                    setToken(session.getIdToken().getJwtToken())
                    resolve(userData)
                },
                onFailure: (err) => reject(err),
            })
        })
    }, [])

    const logout = useCallback(() => {
        if (userPool) {
            const cognitoUser = userPool.getCurrentUser()
            if (cognitoUser) cognitoUser.signOut()
        }
        setUser(null)
        setToken(null)
    }, [])

    const refreshToken = useCallback(async () => {
        const pool = requirePool()
        return new Promise((resolve, reject) => {
            const cognitoUser = pool.getCurrentUser()
            if (!cognitoUser) return reject(new Error('No user'))
            cognitoUser.getSession((err, session) => {
                if (err) return reject(err)
                setToken(session.getIdToken().getJwtToken())
                resolve(session.getIdToken().getJwtToken())
            })
        })
    }, [])

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        cognitoConfigured,
        signup,
        verify,
        login,
        logout,
        refreshToken,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

export default AuthContext

