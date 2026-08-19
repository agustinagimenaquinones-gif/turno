import React, { useEffect, useState } from 'react';
import { fetchAvailableSlots } from '../services/api';
import { Clock, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function TimeStep({ selectedDate, selectedTime, onSelectTime, onNextStep, onPrevStep }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setError('');

    fetchAvailableSlots(selectedDate)
      .then((data) => {
        setSlots(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('No se pudieron cargar los horarios. Inténtalo nuevamente.');
        setLoading(false);
      });
  }, [selectedDate]);

  const formattedDateStr = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    : '';

  return (
    <div className="animate-fade-in">
      <style>{`
        .time-slots-card {
          background: #ffffff;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--pink-200);
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: var(--shadow-sm);
        }
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 14px;
          margin-top: 20px;
        }
        .slot-btn {
          background: #ffffff;
          border: 1.5px solid var(--pink-200);
          color: var(--text-dark);
          padding: 14px 10px;
          border-radius: var(--radius-sm);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .slot-btn:hover:not(:disabled) {
          border-color: var(--pink-400);
          background: var(--pink-100);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
        .slot-btn.selected {
          background: var(--gold-gradient) !important;
          color: #ffffff !important;
          border-color: transparent !important;
          box-shadow: var(--shadow-gold);
          transform: translateY(-2px);
        }
        .slot-btn:disabled {
          background: #faf6f7;
          border-color: #eee4e7;
          color: #bda6ad;
          cursor: not-allowed;
          opacity: 0.75;
        }
        .slot-status-text {
          font-size: 0.72rem;
          font-weight: 500;
        }
        .slot-btn.selected .slot-status-text {
          color: rgba(255, 255, 255, 0.9);
        }
        .loading-wrap {
          text-align: center;
          padding: 40px 20px;
          color: var(--pink-400);
        }
        .error-banner {
          background-color: #fff0f3;
          border: 1px solid #f8c4ce;
          color: #9c2b45;
          padding: 12px 18px;
          border-radius: var(--radius-sm);
          margin-bottom: 20px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div className="step-header">
        <h2 className="step-title">Selecciona el Horario</h2>
        <p className="step-desc">Disponibilidad para el <strong>{formattedDateStr}</strong></p>
      </div>

      <div className="time-slots-card">
        {loading ? (
          <div className="loading-wrap">
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p>Cargando horarios disponibles...</p>
          </div>
        ) : error ? (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="slots-grid">
            {slots.map((slotObj) => {
              const isSelected = selectedTime === slotObj.time;
              const isAvailable = slotObj.available;

              return (
                <button
                  key={slotObj.time}
                  className={`slot-btn ${isSelected ? 'selected' : ''}`}
                  disabled={!isAvailable}
                  onClick={() => onSelectTime(slotObj.time)}
                >
                  <span style={{ fontSize: '1.05rem' }}>{slotObj.time} hs</span>
                  <span className="slot-status-text">
                    {!isAvailable ? 'Ocupado' : isSelected ? 'Seleccionado' : 'Disponible'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        <button className="btn-secondary" onClick={onPrevStep}>
          <ArrowLeft size={18} />
          <span>Volver a Fecha</span>
        </button>

        <button
          className="btn-primary"
          disabled={!selectedTime}
          onClick={onNextStep}
        >
          <span>Continuar a Tus Datos</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
