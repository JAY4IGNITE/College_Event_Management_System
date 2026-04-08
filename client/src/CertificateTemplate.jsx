import React from 'react';

const CertificateTemplate = ({ certificate }) => {
    if (!certificate) return null;

    return (
        <div 
            id={`certificate-node-${certificate.certificateId}`}
            style={{
                width: '1122px', 
                height: '793px',
                padding: '40px',
                position: 'fixed',
                top: '-9999px',
                left: '-9999px',
                background: 'white',
                color: '#333',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            <div style={{
                border: '15px solid #1e3a8a',
                height: '100%',
                padding: '40px',
                textAlign: 'center',
                boxSizing: 'border-box',
                position: 'relative'
            }}>
                <div style={{ border: '2px solid #1e3a8a', height: '100%', padding: '40px', position: 'relative' }}>
                    
                    <h1 style={{ fontSize: '54px', color: '#1e3a8a', margin: '20px 0', fontFamily: 'serif', letterSpacing: '2px' }}>CERTIFICATE OF COMPLETION</h1>
                    <p style={{ fontSize: '24px', fontStyle: 'italic', color: '#64748b', marginTop: '50px' }}>This is to certify that</p>
                    <h2 style={{ fontSize: '42px', borderBottom: '2px solid #cbd5e1', display: 'inline-block', paddingBottom: '10px', marginTop: '20px', color: '#0f172a', fontWeight: '800' }}>
                        {certificate.studentName}
                    </h2>
                    <p style={{ fontSize: '22px', color: '#64748b', marginTop: '40px' }}>has successfully participated and completed</p>
                    <h3 style={{ fontSize: '32px', color: '#1e3a8a', marginTop: '20px', fontWeight: '700' }}>
                        {certificate.eventName}
                    </h3>

                    <div style={{ position: 'absolute', bottom: '60px', left: '40px', textAlign: 'left' }}>
                        <p style={{ fontSize: '18px', fontWeight: '600', color: '#334155' }}>Date: {new Date(certificate.issueDate).toLocaleDateString()}</p>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Certificate ID: {certificate.certificateId}</p>
                    </div>

                    <div style={{ position: 'absolute', bottom: '60px', right: '40px', textAlign: 'center' }}>
                        <div style={{ borderBottom: '2px solid #1e293b', width: '220px', marginBottom: '15px' }}></div>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: '#334155', margin: 0 }}>{certificate.issuerName}</p>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Authorized Signatory</p>
                    </div>

                    <div style={{ position: 'absolute', bottom: '15px', left: '0', width: '100%', textAlign: 'center', fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
                        Verify this certificate at: <span style={{color: '#1e3a8a'}}>{window.location.origin}/verify?cert_id={certificate.certificateId}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateTemplate;
