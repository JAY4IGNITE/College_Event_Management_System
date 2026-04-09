import React from 'react';

const CertificateTemplate = ({ certificate }) => {
    if (!certificate) return null;

    // We can use the organizer's signature if passed via the certificate object, or fallback safely
    const coordinatorSignature = certificate.coordinatorSignature || null; // Will be empty until uploaded
    const hodSignature = certificate.hodSignature || null;

    return (
        <div 
            id={`certificate-node-${certificate.certificateId}`}
            style={{
                width: '1122px', 
                height: '793px',
                position: 'fixed',
                top: '-9999px',
                left: '-9999px',
                background: '#ffffff',
                color: '#333',
                fontFamily: "'Inter', Arial, sans-serif",
                boxSizing: 'border-box'
            }}
        >
            {/* Outer Blue Border */}
            <div style={{
                position: 'relative',
                border: '25px solid #004c99', /* Strong Aditya Blue */
                height: '100%',
                boxSizing: 'border-box',
                background: '#ffffff'
            }}>
                {/* Gray Corner Block - Top Left */}
                <div style={{ position: 'absolute', top: '0', left: '0', width: '0', height: '0', borderTop: '70px solid #e2e8f0', borderRight: '70px solid transparent' }}></div>
                <div style={{ position: 'absolute', top: '0', left: '0', width: '70px', height: '14px', background: '#e2e8f0' }}></div>
                <div style={{ position: 'absolute', top: '0', left: '0', height: '70px', width: '14px', background: '#e2e8f0' }}></div>
                
                {/* Gray Corner Block - Top Right */}
                <div style={{ position: 'absolute', top: '0', right: '0', width: '0', height: '0', borderTop: '70px solid #e2e8f0', borderLeft: '70px solid transparent' }}></div>
                <div style={{ position: 'absolute', top: '0', right: '0', width: '70px', height: '14px', background: '#e2e8f0' }}></div>
                <div style={{ position: 'absolute', top: '0', right: '0', height: '70px', width: '14px', background: '#e2e8f0' }}></div>

                {/* Gray Corner Block - Bottom Left */}
                <div style={{ position: 'absolute', bottom: '0', left: '0', width: '0', height: '0', borderBottom: '70px solid #e2e8f0', borderRight: '70px solid transparent' }}></div>
                <div style={{ position: 'absolute', bottom: '0', left: '0', width: '70px', height: '14px', background: '#e2e8f0' }}></div>
                <div style={{ position: 'absolute', bottom: '0', left: '0', height: '70px', width: '14px', background: '#e2e8f0' }}></div>

                {/* Gray Corner Block - Bottom Right */}
                <div style={{ position: 'absolute', bottom: '0', right: '0', width: '0', height: '0', borderBottom: '70px solid #e2e8f0', borderLeft: '70px solid transparent' }}></div>
                <div style={{ position: 'absolute', bottom: '0', right: '0', width: '70px', height: '14px', background: '#e2e8f0' }}></div>
                <div style={{ position: 'absolute', bottom: '0', right: '0', height: '70px', width: '14px', background: '#e2e8f0' }}></div>


                {/* Main Content Container */}
                <div style={{
                    padding: '40px 60px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    position: 'relative',
                    height: '100%',
                    zIndex: 2
                }}>
                    
                    {/* Header Section */}
                    <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {/* Assuming the logo has "ADITYA UNIVERSITY" text as seen in your template */}
                        <img src="/aditya.jpg" alt="Aditya University" style={{ height: '80px', mixBlendMode: 'multiply' }} />
                    </div>

                    <p style={{ fontSize: '15px', color: '#475569', margin: '15px 0 20px', fontWeight: '500' }}>
                        Aditya Nagar, ADB Road, Surampalem-533 437, Kakinada Dist, A.P. India.
                    </p>

                    <h1 style={{ 
                        fontSize: '66px', 
                        color: '#d95a1a', /* Orange/Rust color matching image */
                        margin: '10px 0 30px', 
                        fontFamily: "'Dancing Script', cursive, serif", 
                        fontWeight: '700',
                        letterSpacing: '1px'
                    }}>
                        Certificate of Participation
                    </h1>

                    {/* Formatted Paragraph Layout */}
                    <div style={{ 
                        fontSize: '22px', 
                        lineHeight: '2.4', 
                        textAlign: 'left', 
                        marginTop: '35px', 
                        color: '#1e293b',
                        fontFamily: "Arial, sans-serif"
                    }}>
                        {/* Line 1 */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px' }}>
                            <span style={{ whiteSpace: 'nowrap', marginRight: '15px' }}>This Certificate is presented to</span>
                            <span style={{ 
                                flex: 1, 
                                borderBottom: '2px solid #64748b', 
                                textAlign: 'center', 
                                color: '#d95a1a', 
                                fontWeight: 'bold', 
                                paddingBottom: '2px',
                                textTransform: 'uppercase'
                            }}>
                                {certificate.studentName}
                            </span>
                        </div>

                        {/* Line 2 */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px' }}>
                            <span style={{ whiteSpace: 'nowrap', marginRight: '15px' }}>Bearing Roll number</span>
                            <span style={{ 
                                width: '380px', 
                                borderBottom: '2px solid #64748b', 
                                textAlign: 'center', 
                                color: '#d95a1a', 
                                fontWeight: 'bold', 
                                paddingBottom: '2px',
                                textTransform: 'uppercase'
                            }}>
                                {certificate.studentId}
                            </span>
                            <span style={{ whiteSpace: 'nowrap', marginLeft: '15px' }}>in recognition of their active participation</span>
                        </div>

                        {/* Line 3 */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px' }}>
                            <span style={{ whiteSpace: 'nowrap', marginRight: '15px' }}>in the</span>
                            <span style={{ 
                                flex: 1, 
                                borderBottom: '2px solid #64748b', 
                                textAlign: 'center', 
                                color: '#d95a1a', 
                                fontWeight: 'bold', 
                                paddingBottom: '2px',
                                textTransform: 'uppercase'
                            }}>
                                {certificate.eventName}
                            </span>
                            <span style={{ whiteSpace: 'nowrap', marginLeft: '15px' }}>organized by</span>
                        </div>

                        {/* Line 4 */}
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <span style={{ whiteSpace: 'nowrap', marginRight: '15px' }}>the Department of Computer Science and Engineering on</span>
                            <span style={{ 
                                width: '250px', 
                                borderBottom: '2px solid #64748b', 
                                textAlign: 'center', 
                                color: '#004c99', 
                                fontWeight: 'bold', 
                                paddingBottom: '2px'
                            }}>
                                {new Date(certificate.issueDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
                            </span>
                        </div>
                    </div>

                    {/* Footer / Signatures Section */}
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '40px', 
                        left: '60px', 
                        right: '60px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-end' 
                    }}>
                        
                        {/* Coordinator Signature */}
                        <div style={{ textAlign: 'center', minWidth: '220px' }}>
                            {coordinatorSignature ? (
                                <img src={coordinatorSignature} alt="Coordinator Signature" style={{ height: '60px', marginBottom: '5px' }} />
                            ) : (
                                <div style={{ height: '60px', marginBottom: '5px' }}></div> /* Empty space placeholder for extracted signature */
                            )}
                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#004c99', margin: '0 0 5px' }}>{certificate.issuerName}</p>
                            <p style={{ fontSize: '16px', color: '#d95a1a', margin: '0', fontWeight: '600' }}>Coordinator</p>
                        </div>

                        {/* Certificate Verify Text */}
                        <div style={{ textAlign: 'center', opacity: 0.6 }}>
                            <p style={{ fontSize: '11px', margin: 0 }}>Certificate ID: {certificate.certificateId}</p>
                            <p style={{ fontSize: '11px', margin: 0 }}>Verify at: {window.location.host}/verify?cert_id={certificate.certificateId}</p>
                        </div>

                        {/* HOD Signature */}
                        <div style={{ textAlign: 'center', minWidth: '220px' }}>
                            {hodSignature ? (
                                <img src={hodSignature} alt="HOD Signature" style={{ height: '60px', marginBottom: '5px' }} />
                            ) : (
                                <div style={{ height: '60px', marginBottom: '5px' }}></div> 
                            )}
                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#004c99', margin: '0 0 5px' }}>Dr. T. Sudha Rani</p>
                            <p style={{ fontSize: '16px', color: '#d95a1a', margin: '0', fontWeight: '600' }}>Head of the Department</p>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default CertificateTemplate;
