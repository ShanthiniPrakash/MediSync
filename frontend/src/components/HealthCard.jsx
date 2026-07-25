import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { FiDownload } from 'react-icons/fi';

const HealthCard = ({ patient }) => {
  const cardRef = useRef(null);

  const handleDownload = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current, { scale: 2, useCORS: true }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `${patient.name.replace(/\s+/g, '_')}_healthcard.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div className="d-flex flex-column align-items-center gap-3">
      {/* Visual Card Container */}
      <div 
        ref={cardRef} 
        className="physical-health-card text-dark d-flex flex-column justify-content-between p-3"
      >
        {/* Card Header */}
        <div className="d-flex justify-content-between align-items-start border-bottom pb-2 border-primary border-opacity-10">
          <div>
            <h6 className="fw-bold m-0 text-primary" style={{ letterSpacing: '1px' }}>MEDISYNC HEALTH CARD</h6>
            <span style={{ fontSize: '0.65rem' }} className="text-secondary fw-semibold">Universal Medical Record Access</span>
          </div>
          <span className="fs-5">🏥</span>
        </div>

        {/* Card Body */}
        <div className="d-flex align-items-center gap-3 my-2">
          {patient.qrCode ? (
            <img 
              src={patient.qrCode} 
              alt="QR UMRN" 
              className="rounded bg-white p-1 border border-secondary border-opacity-10" 
              style={{ width: '85px', height: '85px' }} 
            />
          ) : (
            <div className="bg-secondary bg-opacity-25 rounded p-2" style={{ width: '85px', height: '85px', fontSize: '0.5rem' }}>No QR</div>
          )}

          <div style={{ minWidth: 0 }}>
            <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: '1rem' }}>{patient.name}</h6>
            <div className="fw-semibold text-primary mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>{patient.umrn}</div>
            
            <div className="d-flex gap-3 text-secondary" style={{ fontSize: '0.7rem' }}>
              <div>
                <span className="d-block fw-semibold text-muted" style={{ fontSize: '0.55rem' }}>BLOOD GROUP</span>
                <strong className="text-dark">{patient.bloodGroup}</strong>
              </div>
              <div>
                <span className="d-block fw-semibold text-muted" style={{ fontSize: '0.55rem' }}>GENDER</span>
                <strong className="text-dark">{patient.gender}</strong>
              </div>
              <div>
                <span className="d-block fw-semibold text-muted" style={{ fontSize: '0.55rem' }}>DOB</span>
                <strong className="text-dark">{patient.dob}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="d-flex justify-content-between align-items-center border-top pt-2 border-primary border-opacity-10" style={{ fontSize: '0.7rem' }}>
          <div>
            <span className="text-muted fw-semibold d-block" style={{ fontSize: '0.55rem' }}>EMERGENCY CONTACT</span>
            <strong className="text-danger">{patient.emergencyContact}</strong>
          </div>
          <div className="text-end text-muted fw-bold" style={{ fontSize: '0.6rem' }}>
            SIH MVP 2026
          </div>
        </div>
      </div>

      <button onClick={handleDownload} className="btn btn-glass-primary d-flex align-items-center gap-2 rounded-3 py-2 px-4 shadow-sm border mt-2">
        <FiDownload /> Download Health Card
      </button>
    </div>
  );
};

export default HealthCard;
