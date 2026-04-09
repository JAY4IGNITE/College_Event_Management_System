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
                background: '#ffffff',
                color: '#333',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box'
            }}
        >
            {/* Outer Premium Border */}
            <div style={{
                position: 'relative',
                border: '14px solid #1e293b', /* Deep navy/slate border */
                height: '100%',
                padding: '12px',
                boxSizing: 'border-box',
                background: 'linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%)',
                boxShadow: 'inset 0 0 0 4px #d4af37' /* Golden inner line */
            }}>
                {/* Inner Delicate Border */}
                <div style={{
                    border: '1px solid #d4af37',
                    height: '100%',
                    padding: '45px 50px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    position: 'relative',
                    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}>
                    
                    {/* Elegant Corner Accents */}
                    <div style={{ position: 'absolute', top: '-6px', left: '-6px', width: '60px', height: '60px', borderTop: '4px solid #d4af37', borderLeft: '4px solid #d4af37' }}></div>
                    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '60px', height: '60px', borderTop: '4px solid #d4af37', borderRight: '4px solid #d4af37' }}></div>
                    <div style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '60px', height: '60px', borderBottom: '4px solid #d4af37', borderLeft: '4px solid #d4af37' }}></div>
                    <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '60px', height: '60px', borderBottom: '4px solid #d4af37', borderRight: '4px solid #d4af37' }}></div>

                    {/* Logo Section */}
                    <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <img src="/aditya.jpg" alt="Aditya University Logo" style={{ height: '110px', mixBlendMode: 'multiply' }} />
                        <div style={{ marginTop: '15px', color: '#d4af37', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Excellence in Education</div>
                    </div>

                    <h1 style={{ 
                        fontSize: '48px', 
                        color: '#1e293b', 
                        margin: '10px 0 25px', 
                        fontFamily: "'Playfair Display', Georgia, serif", 
                        textTransform: 'uppercase', 
                        letterSpacing: '8px' 
                    }}>
                        Certificate of Completion
                    </h1>

                    <div style={{ margin: 'auto', width: '80px', height: '3px', background: '#d4af37', marginBottom: '35px' }}></div>

                    <p style={{ fontSize: '22px', fontStyle: 'italic', color: '#64748b', marginBottom: '20px', fontFamily: "Georgia, serif" }}>
                        This is proudly presented to
                    </p>
                    
                    <h2 style={{ 
                        fontSize: '56px', 
                        color: '#c2410c', /* A beautiful warm terracotta/brand red accent */
                        margin: '15px 0', 
                        fontFamily: "'Dancing Script', cursive, serif", 
                        fontWeight: '700',
                        lineHeight: '1.2'
                    }}>
                        {certificate.studentName}
                    </h2>

                    <p style={{ fontSize: '20px', color: '#475569', marginTop: '20px', maxWidth: '85%', margin: '20px auto 0', lineHeight: '1.6', fontFamily: "Georgia, serif" }}>
                        for successfully participating and demonstrating excellence in the event 
                    </p>

                    <h3 style={{ 
                        fontSize: '34px', 
                        color: '#1e293b', 
                        marginTop: '25px', 
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontWeight: '800' 
                    }}>
                        {certificate.eventName}
                    </h3>

                    {/* Footer Section (Signatures & Dates) */}
                    <div style={{ position: 'absolute', bottom: '60px', left: '60px', textAlign: 'left', width: '220px' }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '10px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Date of Issue</p>
                    </div>

                    {/* Badge/Seal middle bottom */}
                    <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                         <div style={{ width: '85px', height: '85px', borderRadius: '50%', border: '3px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #fff 0%, #fef3c7 100%)', boxShadow: '0 4px 15px rgba(212,175,55,0.2)' }}>
                            <i className="fa-solid fa-award" style={{ fontSize: '42px', color: '#d4af37' }}></i>
                         </div>
                         <div style={{ marginTop: '18px', fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '1px', fontFamily: "'Inter', sans-serif" }}>
                            VERIFIED AUTHENTIC - ID: {certificate.certificateId}
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '60px', right: '60px', textAlign: 'center', width: '220px' }}>
                        <p style={{ fontSize: '28px', fontWeight: '400', fontFamily: "'Dancing Script', cursive", color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', margin: '0 0 10px', lineHeight: '0.8' }}>
                            {certificate.issuerName}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Authorized Signatory</p>
                    </div>

                    {/* Verification Link */}
                    <div style={{ position: 'absolute', bottom: '-45px', left: '0', width: '100%', textAlign: 'center', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                        Verify this certificate online at: <span style={{color: '#d4af37'}}>{window.location.host}/verify?cert_id={certificate.certificateId}</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CertificateTemplate;
