import { useState, useEffect } from 'react'
import { getHealth } from '../../services/api'
import { HardDrive, Shield, CheckCircle, XCircle } from 'lucide-react'

export default function Evidence() {
    const [s3Ready, setS3Ready] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function check() {
            try {
                const res = await getHealth()
                setS3Ready(res.data?.services?.s3 === 'ready')
            } catch {
                setS3Ready(false)
            } finally {
                setLoading(false)
            }
        }
        check()
    }, [])

    return (
        <div>
            <h1 className="dash-page-title">Evidence Vault</h1>
            <p className="dash-page-desc">
                Securely stored evidence from real distress events. Files are encrypted using AES-256
                and automatically deleted after 30 days.
            </p>

            <div className="dash-card">
                <div className="dash-card__title">
                    <HardDrive size={18} /> S3 Storage Status
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    {loading ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Checking storage status...</span>
                    ) : s3Ready ? (
                        <>
                            <CheckCircle size={18} style={{ color: 'var(--accent-emerald)' }} />
                            <span style={{ color: 'var(--accent-emerald)', fontSize: '0.88rem', fontWeight: 500 }}>
                                S3 evidence bucket is configured and ready
                            </span>
                        </>
                    ) : (
                        <>
                            <XCircle size={18} style={{ color: 'var(--accent-saffron)' }} />
                            <span style={{ color: 'var(--accent-saffron)', fontSize: '0.88rem', fontWeight: 500 }}>
                                S3 evidence bucket not yet configured
                            </span>
                        </>
                    )}
                </div>

                <div style={{
                    padding: 32,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(79, 110, 247, 0.03)',
                    border: '1px solid var(--border-card)',
                    textAlign: 'center',
                }}>
                    <Shield size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
                        Evidence files will appear here during real distress events.
                        Uploads use <strong>pre-signed S3 URLs</strong> with AES-256 encryption
                        and a <strong>30-day lifecycle</strong> auto-delete policy.
                    </p>
                </div>
            </div>

            <div className="dash-card">
                <div className="dash-card__title">
                    <Shield size={18} /> Encryption Details
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="simulate-result__item">
                        <span className="simulate-result__label">Encryption</span>
                        <span className="simulate-result__value">AES-256 (Server-Side)</span>
                    </div>
                    <div className="simulate-result__item">
                        <span className="simulate-result__label">Retention</span>
                        <span className="simulate-result__value">30 days auto-delete</span>
                    </div>
                    <div className="simulate-result__item">
                        <span className="simulate-result__label">Access Control</span>
                        <span className="simulate-result__value">Pre-signed URLs only</span>
                    </div>
                    <div className="simulate-result__item">
                        <span className="simulate-result__label">Upload Method</span>
                        <span className="simulate-result__value">Direct-to-S3 (no server proxy)</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
