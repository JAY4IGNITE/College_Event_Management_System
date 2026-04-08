import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const API_BASE_URL = ''; 

const VerifyCertificate = () => {
    const [searchParams] = useSearchParams();
    const [certId, setCertId] = useState(searchParams.get('cert_id') || '');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('cert_id')) {
            handleVerify(searchParams.get('cert_id'));
        }
    }, [searchParams]);

    const handleVerify = async (idToVerify) => {
        const id = idToVerify || certId;
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/certificates/verify/${id}`);
            const data = await res.json();
            setResult(data);
        } catch (error) {
            setResult({ valid: false, message: 'Verification service unavailable.' });
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                <Link to="/" style={{ color: 'var(--info)', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Home
                </Link>
                <h1 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '20px' }}><i className="fa-solid fa-shield-halved" style={{ color: 'var(--info)' }}></i> Verify Certificate</h1>
                <p style={{ color: '#64748b', marginBottom: '30px' }}>Enter the Certificate ID to verify its authenticity and details.</p>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <input 
                        type="text" 
                        value={certId} 
                        onChange={(e) => setCertId(e.target.value)} 
                        placeholder="e.g. CERT-A1B2C3D4"
                        style={{ flex: 1, padding: '12px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--info)'}
                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    />
                    <button 
                        onClick={() => handleVerify()} 
                        disabled={loading}
                        style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--info)', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </div>

                {result && (
                    <div style={{ padding: '24px', borderRadius: '16px', background: result.valid ? '#f0fdf4' : '#fef2f2', border: `1px solid ${result.valid ? '#bbf7d0' : '#fecaca'}`, textAlign: 'left', animation: 'fadeInUp 0.3s' }}>
                        {result.valid ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontSize: '20px', fontWeight: '700', marginBottom: '15px' }}>
                                    <i className="fa-solid fa-circle-check"></i> Certificate is Valid
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', fontSize: '15px' }}>
                                    <div style={{ color: '#64748b' }}>Student Name:</div><div style={{ fontWeight: '600', color: '#334155' }}>{result.certificate.studentName}</div>
                                    <div style={{ color: '#64748b' }}>Event Name:</div><div style={{ fontWeight: '600', color: '#334155' }}>{result.certificate.eventName}</div>
                                    <div style={{ color: '#64748b' }}>Issuer:</div><div style={{ fontWeight: '600', color: '#334155' }}>{result.certificate.issuerName}</div>
                                    <div style={{ color: '#64748b' }}>Issue Date:</div><div style={{ fontWeight: '600', color: '#334155' }}>{new Date(result.certificate.issueDate).toLocaleDateString()}</div>
                                    <div style={{ color: '#64748b' }}>Certificate ID:</div><div style={{ fontWeight: '600', color: '#334155', wordBreak: 'break-all' }}>{result.certificate.certificateId}</div>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', fontSize: '18px', fontWeight: '700' }}>
                                <i className="fa-solid fa-circle-xmark"></i> {result.message || 'Invalid Certificate ID'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyCertificate;
