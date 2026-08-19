import React, { useState } from 'react';
import { CheckCircle2, Mail, Calendar, Clock, Sparkles, MapPin, Phone, RefreshCw, Eye, X, AlertTriangle } from 'lucide-react';

export default function SuccessModal({ confirmationData, onReset }) {
  const [showEmailModal, setShowEmailModal] = useState(false);

  const { appointment, emailResult, emailSent, emailError } = confirmationData;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formattedDateStr = appointment.date
    ? new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  const isSent = emailSent !== false && emailResult?.success !== false;

  return (
    <div className="animate-fade-in">
      <style>{`
        .success-card {
          background: #ffffff;
          border-radius: var(--radius-lg);
          border: 2px solid var(--pink-200);
          padding: 40px 30px;
          text-align: center;
          max-width: 650px;
          margin: 0 auto 40px;
          box-shadow: var(--shadow-lg);
          position: relative;
          overflow: hidden;
        }
        .success-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: var(--gold-gradient);
        }
        .check-icon-badge {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #eaf8f0 0%, #d4f2e1 100%);
          color: #2b7a4b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 8px 20px rgba(43, 122, 75, 0.18);
        }
        .success-title-main {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          color: var(--text-dark);
          margin-bottom: 12px;
        }
        .success-email-notice {
          background: var(--pink-100);
          border: 1.5px solid var(--pink-300);
          color: #5c353f;
          padding: 16px 20px;
          border-radius: var(--radius-md);
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: var(--shadow-sm);
        }
        .error-email-notice {
          background: #fff0f3;
          border: 1.5px solid #f8c4ce;
          color: #9c2b45;
          padding: 16px 20px;
          border-radius: var(--radius-md);
          font-size: 0.92rem;
          margin-bottom: 28px;
          text-align: left;
        }
        .receipt-box {
          background: #fbf9f5;
          border-radius: var(--radius-md);
          padding: 24px;
          border: 1px solid #f3eee6;
          text-align: left;
          margin-bottom: 25px;
        }
        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 14px;
          border-bottom: 1px dashed #e6dcd3;
          margin-bottom: 14px;
        }
        .receipt-id {
          font-size: 0.8rem;
          color: var(--text-light);
          font-weight: 600;
        }
        .receipt-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.92rem;
        }
        .receipt-label {
          color: var(--text-medium);
        }
        .receipt-val {
          font-weight: 600;
          color: var(--text-dark);
        }
        .receipt-price {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          color: var(--gold-primary);
          font-weight: 700;
        }
        .email-preview-trigger {
          background: #ffffff;
          border: 1.5px solid var(--gold-primary);
          color: var(--gold-primary);
          padding: 12px 24px;
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .email-preview-trigger:hover {
          background: var(--beige-100);
          box-shadow: var(--shadow-gold);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-content-email {
          background: #ffffff;
          border-radius: var(--radius-md);
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          position: relative;
        }
        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--pink-200);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--pink-100);
        }
      `}</style>

      <div className="success-card">
        <div className="check-icon-badge">
          <CheckCircle2 size={46} strokeWidth={2.5} />
        </div>

        <h2 className="success-title-main">¡Reserva Guardada con Éxito!</h2>

        {/* Email status notice */}
        {isSent ? (
          <div className="success-email-notice">
            <Mail size={22} className="shrink-0" />
            <span>Turno confirmado. Revisá tu correo.</span>
          </div>
        ) : (
          <div className="error-email-notice">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '6px' }}>
              <AlertTriangle size={20} />
              <span>Turno guardado, pero falló el envío de correo real</span>
            </div>
            <p style={{ margin: 0 }}>
              El turno fue registrado en la base de datos para <strong>{appointment.client_email}</strong>. Sin embargo, no se pudo entregar el email real por SMTP.
            </p>
            <div style={{ fontSize: '0.8rem', background: '#fce4e8', padding: '8px 12px', borderRadius: '6px', marginTop: '8px', fontFamily: 'monospace' }}>
              Motivo: {emailError || emailResult?.error || 'Configuración SMTP pendiente en .env'}
            </div>
          </div>
        )}

        <div className="receipt-box">
          <div className="receipt-header">
            <span className="font-serif" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              Comprobante de Turno #{appointment.id}
            </span>
            <span className="receipt-id">ESTADO: CONFIRMADO</span>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">Cliente:</span>
            <span className="receipt-val">{appointment.client_firstname} {appointment.client_lastname}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Correo enviado a:</span>
            <span className="receipt-val" style={{ color: 'var(--gold-primary)' }}>{appointment.client_email}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Servicio:</span>
            <span className="receipt-val">{appointment.service_name}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Fecha:</span>
            <span className="receipt-val" style={{ textTransform: 'capitalize' }}>{formattedDateStr}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Horario:</span>
            <span className="receipt-val">{appointment.time_slot} hs</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Duración:</span>
            <span className="receipt-val">{appointment.duration}</span>
          </div>
          <div className="receipt-row" style={{ paddingTop: '10px', borderTop: '1px dashed #e6dcd3', marginTop: '6px' }}>
            <span className="receipt-label" style={{ fontWeight: '600' }}>Precio:</span>
            <span className="receipt-price">{formatPrice(appointment.price)}</span>
          </div>
        </div>

        <div>
          <button
            className="email-preview-trigger"
            onClick={() => setShowEmailModal(true)}
          >
            <Eye size={18} />
            <span>Ver Plantilla del Correo Enviado</span>
          </button>
        </div>

        <div style={{ marginTop: '10px' }}>
          <button className="btn-primary" onClick={onReset}>
            <RefreshCw size={18} />
            <span>Reservar otro turno</span>
          </button>
        </div>
      </div>

      {/* Modal View for generated Email HTML */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content-email" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: 'var(--text-dark)' }}>
                <Mail size={18} />
                <span>Vista Previa del Correo</span>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-medium)' }}
                onClick={() => setShowEmailModal(false)}
              >
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: '0' }}>
              <iframe
                title="Correo Electrónico de Confirmación"
                srcDoc={emailResult?.html || ''}
                style={{ width: '100%', height: '550px', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
