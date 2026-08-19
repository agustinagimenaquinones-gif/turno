import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, User, Mail, Phone, ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import { createAppointment } from '../services/api';

export default function ConfirmStep({ bookingData, onPrevStep, onSuccessBooking }) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { service, date, time, formData } = bookingData;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formattedDateStr = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const response = await createAppointment({
        client_firstname: formData.firstname,
        client_lastname: formData.lastname,
        client_email: formData.email,
        client_phone: formData.phone,
        service_id: service.id,
        date: date,
        time_slot: time
      });

      onSuccessBooking(response);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo confirmar la reserva. Intenta nuevamente.');
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <style>{`
        .recap-card {
          background: #ffffff;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--pink-200);
          padding: 35px;
          margin-bottom: 30px;
          box-shadow: var(--shadow-md);
          max-width: 640px;
          margin-left: auto;
          margin-right: auto;
        }
        .recap-header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px dashed var(--pink-200);
          margin-bottom: 25px;
        }
        .recap-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--pink-100);
          color: var(--pink-500);
          padding: 4px 14px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .recap-section {
          margin-bottom: 22px;
        }
        .recap-section-title {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-light);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .recap-box {
          background: #fcf9f5;
          border-radius: var(--radius-sm);
          padding: 18px 20px;
          border: 1px solid #f5efe6;
        }
        .recap-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }
        .recap-label {
          font-size: 0.9rem;
          color: var(--text-medium);
        }
        .recap-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-dark);
          text-align: right;
        }
        .recap-price {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          color: var(--gold-primary);
          font-weight: 700;
        }
        .error-box {
          background-color: #fff0f3;
          border: 1.5px solid #f8c4ce;
          color: #9c2b45;
          padding: 16px 20px;
          border-radius: var(--radius-sm);
          margin-bottom: 25px;
          font-size: 0.92rem;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
      `}</style>

      <div className="step-header">
        <h2 className="step-title">Resumen y Confirmación</h2>
        <p className="step-desc">Revisa los detalles de tu turno antes de agendar</p>
      </div>

      {errorMsg && (
        <div className="error-box">
          <AlertCircle size={22} style={{ shrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Atención:</strong> {errorMsg}
          </div>
        </div>
      )}

      <div className="recap-card">
        <div className="recap-header">
          <span className="recap-badge">
            <Sparkles size={14} />
            <span>Maison Coquette Studio</span>
          </span>
          <h3 className="font-serif" style={{ fontSize: '1.6rem', color: 'var(--text-dark)' }}>
            {service.name}
          </h3>
        </div>

        <div className="recap-section">
          <div className="recap-section-title">
            <Calendar size={15} />
            <span>Fecha & Horario</span>
          </div>
          <div className="recap-box">
            <div className="recap-row">
              <span className="recap-label">Día Agendado</span>
              <span className="recap-value" style={{ textTransform: 'capitalize' }}>
                {formattedDateStr}
              </span>
            </div>
            <div className="recap-row">
              <span className="recap-label">Horario</span>
              <span className="recap-value">{time} hs</span>
            </div>
            <div className="recap-row">
              <span className="recap-label">Duración estimada</span>
              <span className="recap-value">{service.duration}</span>
            </div>
          </div>
        </div>

        <div className="recap-section">
          <div className="recap-section-title">
            <User size={15} />
            <span>Datos del Cliente</span>
          </div>
          <div className="recap-box">
            <div className="recap-row">
              <span className="recap-label">Nombre Completo</span>
              <span className="recap-value">{formData.firstname} {formData.lastname}</span>
            </div>
            <div className="recap-row">
              <span className="recap-label">Correo Electrónico</span>
              <span className="recap-value">{formData.email}</span>
            </div>
            <div className="recap-row">
              <span className="recap-label">Teléfono</span>
              <span className="recap-value">{formData.phone}</span>
            </div>
          </div>
        </div>

        <div className="recap-section">
          <div className="recap-box" style={{ background: 'var(--pink-100)', borderColor: 'var(--pink-200)' }}>
            <div className="recap-row">
              <span className="recap-label" style={{ fontWeight: '600', color: 'var(--text-dark)' }}>Precio Total</span>
              <span className="recap-price">{formatPrice(service.price)}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            className="btn-gold"
            style={{ width: '100%', padding: '16px', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Confirmando y generando comprobante...</span>
              </>
            ) : (
              <>
                <Check size={20} />
                <span>Confirmar turno</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="navigation-buttons">
        <button className="btn-secondary" disabled={submitting} onClick={onPrevStep}>
          <ArrowLeft size={18} />
          <span>Modificar Datos</span>
        </button>
      </div>
    </div>
  );
}
