import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';

export default function DateStep({ selectedDate, onSelectDate, onNextStep, onPrevStep }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Calendar math
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const formatDateStr = (dayNum) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = dayNum.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const isPastDate = (dayNum) => {
    const checkDate = new Date(year, month, dayNum);
    checkDate.setHours(23, 59, 59, 999);
    return checkDate < today;
  };

  const isSunday = (dayNum) => {
    return new Date(year, month, dayNum).getDay() === 0;
  };

  return (
    <div className="animate-fade-in">
      <style>{`
        .calendar-card {
          background: #ffffff;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--pink-200);
          padding: 28px;
          max-width: 520px;
          margin: 0 auto 30px;
          box-shadow: var(--shadow-sm);
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }
        .month-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: var(--text-dark);
          text-transform: capitalize;
        }
        .month-nav-btn {
          background: var(--pink-100);
          border: 1px solid var(--pink-200);
          color: var(--text-medium);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .month-nav-btn:hover:not(:disabled) {
          background: var(--pink-200);
          color: var(--text-dark);
        }
        .month-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-light);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
        .day-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-dark);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }
        .day-cell:hover:not(:disabled) {
          background: var(--pink-100);
          color: var(--pink-500);
        }
        .day-cell.selected {
          background: var(--gold-gradient) !important;
          color: #ffffff !important;
          font-weight: 700;
          box-shadow: var(--shadow-gold);
        }
        .day-cell.today:not(.selected) {
          border: 1.5px solid var(--gold-primary);
          color: var(--gold-primary);
        }
        .day-cell:disabled {
          color: #d1c4c8;
          cursor: not-allowed;
          background: transparent !important;
          text-decoration: line-through;
          opacity: 0.5;
        }
        .date-recap {
          text-align: center;
          margin-bottom: 25px;
          font-size: 0.95rem;
          color: var(--text-medium);
        }
        .date-recap strong {
          color: var(--gold-primary);
          font-weight: 700;
        }
        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>

      <div className="step-header">
        <h2 className="step-title">Selecciona el Día</h2>
        <p className="step-desc">Elige la fecha ideal para agendar tu atención</p>
      </div>

      <div className="calendar-card">
        <div className="calendar-header">
          <button
            className="month-nav-btn"
            onClick={handlePrevMonth}
            disabled={year === today.getFullYear() && month === today.getMonth()}
            title="Mes anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="month-title">{monthNames[month]} {year}</span>
          <button className="month-nav-btn" onClick={handleNextMonth} title="Mes siguiente">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="days-header">
          {daysOfWeek.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="days-grid">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = formatDateStr(dayNum);
            const disabled = isPastDate(dayNum) || isSunday(dayNum);
            const isSelected = selectedDate === dateStr;
            const isToday =
              dayNum === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <button
                key={dayNum}
                className={`day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                disabled={disabled}
                onClick={() => onSelectDate(dateStr)}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="date-recap">
          Fecha elegida: <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
        </div>
      )}

      <div className="navigation-buttons">
        <button className="btn-secondary" onClick={onPrevStep}>
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <button
          className="btn-primary"
          disabled={!selectedDate}
          onClick={onNextStep}
        >
          <span>Continuar a Horario</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
