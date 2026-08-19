import React from 'react';
import { Check, Sparkles, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Servicio', icon: Sparkles },
  { id: 2, name: 'Día', icon: Calendar },
  { id: 3, name: 'Horario', icon: Clock },
  { id: 4, name: 'Datos', icon: User },
  { id: 5, name: 'Confirmación', icon: CheckCircle2 }
];

export default function StepProgress({ currentStep, onSelectStep }) {
  return (
    <nav className="step-progress-wrapper" aria-label="Progreso de reserva">
      <style>{`
        .step-progress-wrapper {
          margin-bottom: 35px;
        }
        .steps-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          max-width: 780px;
          margin: 0 auto;
          padding: 0 10px;
        }
        .progress-line-bg {
          position: absolute;
          top: 22px;
          left: 40px;
          right: 40px;
          height: 3px;
          background-color: var(--pink-200);
          z-index: 1;
          border-radius: 4px;
        }
        .progress-line-active {
          position: absolute;
          top: 22px;
          left: 40px;
          height: 3px;
          background: linear-gradient(90deg, var(--pink-300) 0%, var(--gold-primary) 100%);
          z-index: 2;
          transition: width var(--transition-smooth);
          border-radius: 4px;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 3;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .step-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid var(--pink-200);
          color: var(--text-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all var(--transition-smooth);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
        }
        .step-item.active .step-circle {
          border-color: var(--gold-primary);
          background: var(--pink-100);
          color: var(--gold-primary);
          box-shadow: var(--shadow-gold);
          transform: scale(1.1);
        }
        .step-item.completed .step-circle {
          background: linear-gradient(135deg, #f7d1da 0%, #e8a2b1 100%);
          border-color: #f0b6c4;
          color: #3d2229;
        }
        .step-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-light);
          margin-top: 8px;
          transition: all var(--transition-fast);
        }
        .step-item.active .step-label {
          color: var(--text-dark);
          font-weight: 700;
        }
        .step-item.completed .step-label {
          color: var(--text-medium);
        }
        @media (max-width: 640px) {
          .step-circle {
            width: 36px;
            height: 36px;
            font-size: 0.8rem;
          }
          .progress-line-bg, .progress-line-active {
            top: 18px;
            left: 20px;
            right: 20px;
          }
          .step-label {
            font-size: 0.72rem;
          }
        }
      `}</style>

      <div className="steps-container">
        {/* Background Line */}
        <div className="progress-line-bg" />
        
        {/* Active Progress Line Width */}
        <div
          className="progress-line-active"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 90}%`
          }}
        />

        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <button
              key={step.id}
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => isCompleted && onSelectStep(step.id)}
              disabled={!isCompleted && !isActive}
              title={`Paso ${step.id}: ${step.name}`}
            >
              <div className="step-circle">
                {isCompleted ? <Check size={20} strokeWidth={2.5} /> : <Icon size={18} />}
              </div>
              <span className="step-label">{step.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
