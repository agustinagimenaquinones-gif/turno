import React from 'react';
import { User, Mail, Phone, ArrowRight, ArrowLeft } from 'lucide-react';

export default function InfoStep({ formData, onChangeForm, onNextStep, onPrevStep }) {
  const handleChange = (field, value) => {
    onChangeForm({ ...formData, [field]: value });
  };

  const isValid =
    formData.firstname?.trim() &&
    formData.lastname?.trim() &&
    formData.email?.trim() &&
    formData.email.includes('@') &&
    formData.phone?.trim();

  return (
    <div className="animate-fade-in">
      <style>{`
        .info-card {
          background: #ffffff;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--pink-200);
          padding: 32px;
          margin-bottom: 30px;
          box-shadow: var(--shadow-sm);
          max-width: 620px;
          margin-left: auto;
          margin-right: auto;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .input-icon-wrap {
          position: relative;
        }
        .input-icon-wrap svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--pink-400);
          pointer-events: none;
        }
        .input-icon-wrap input {
          padding-left: 46px;
        }
        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .info-card {
            padding: 20px;
          }
        }
      `}</style>

      <div className="step-header">
        <h2 className="step-title">Ingresa tus Datos Personales</h2>
        <p className="step-desc">Completa tus datos para enviarte la confirmación del turno por correo</p>
      </div>

      <div className="info-card">
        <form onSubmit={(e) => { e.preventDefault(); if (isValid) onNextStep(); }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <div className="input-icon-wrap">
                <User size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Valentina"
                  value={formData.firstname || ''}
                  onChange={(e) => handleChange('firstname', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <div className="input-icon-wrap">
                <User size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Gómez"
                  value={formData.lastname || ''}
                  onChange={(e) => handleChange('lastname', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico *</label>
            <div className="input-icon-wrap">
              <Mail size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="Ej. valentina@ejemplo.com"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono / WhatsApp *</label>
            <div className="input-icon-wrap">
              <Phone size={18} />
              <input
                type="tel"
                className="form-input"
                placeholder="Ej. +54 9 11 1234-5678"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </div>

      <div className="navigation-buttons">
        <button className="btn-secondary" onClick={onPrevStep}>
          <ArrowLeft size={18} />
          <span>Volver a Horarios</span>
        </button>

        <button
          className="btn-primary"
          disabled={!isValid}
          onClick={onNextStep}
        >
          <span>Revisar y Confirmar</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
