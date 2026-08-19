import React, { useState } from 'react';
import { Clock, Tag, ArrowRight, Sparkles, Check } from 'lucide-react';

export default function ServiceStep({ services, selectedService, onSelectService, onNextStep }) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Extract unique categories
  const categories = ['Todos', ...new Set(services.map((s) => s.category).filter(Boolean))];

  const filteredServices = selectedCategory === 'Todos'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="animate-fade-in">
      <style>{`
        .step-header {
          text-align: center;
          margin-bottom: 25px;
        }
        .step-title {
          font-size: 1.8rem;
          color: var(--text-dark);
          margin-bottom: 8px;
        }
        .step-desc {
          color: var(--text-medium);
          font-size: 0.95rem;
        }
        .category-pills {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }
        .pill-btn {
          background: #ffffff;
          border: 1px solid var(--pink-200);
          color: var(--text-medium);
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .pill-btn.active {
          background: var(--pink-100);
          border-color: var(--pink-400);
          color: var(--pink-500);
          font-weight: 600;
          box-shadow: var(--shadow-sm);
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 22px;
          margin-bottom: 35px;
        }
        .service-card {
          background: #ffffff;
          border: 1.5px solid var(--pink-200);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: all var(--transition-smooth);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--pink-300);
        }
        .service-card.selected {
          border-color: var(--gold-primary);
          box-shadow: var(--shadow-gold);
          background: #fffdf8;
        }
        .service-img-wrap {
          height: 160px;
          width: 100%;
          overflow: hidden;
          position: relative;
          background-color: var(--pink-100);
        }
        .service-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .service-card:hover .service-img {
          transform: scale(1.06);
        }
        .category-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-dark);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .selected-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--gold-gradient);
          color: #ffffff;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .service-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .service-name {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--text-dark);
          margin-bottom: 8px;
        }
        .service-desc {
          font-size: 0.88rem;
          color: var(--text-medium);
          margin-bottom: 18px;
          flex-grow: 1;
          line-height: 1.5;
        }
        .service-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1px dashed var(--pink-200);
        }
        .service-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--text-light);
          font-weight: 500;
        }
        .service-price {
          font-family: var(--font-serif);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--gold-primary);
        }
        .actions-footer {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>

      <div className="step-header">
        <h2 className="step-title">Selecciona tu Servicio</h2>
        <p className="step-desc">Elige la experiencia de cuidado y belleza ideal para ti</p>
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Services Grid */}
      <div className="services-grid">
        {filteredServices.map((service) => {
          const isSelected = selectedService?.id === service.id;

          return (
            <div
              key={service.id}
              className={`service-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectService(service)}
            >
              <div className="service-img-wrap">
                <img
                  src={service.image || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop'}
                  alt={service.name}
                  className="service-img"
                />
                <span className="category-tag">{service.category || 'Belleza'}</span>
                {isSelected && (
                  <div className="selected-badge" title="Seleccionado">
                    <Check size={16} />
                  </div>
                )}
              </div>

              <div className="service-body">
                <h3 className="service-name">{service.name}</h3>
                <p className="service-desc">{service.description}</p>
                <div className="service-footer">
                  <div className="service-meta">
                    <Clock size={14} />
                    <span>{service.duration}</span>
                  </div>
                  <span className="service-price">{formatPrice(service.price)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="actions-footer">
        <button
          className="btn-primary"
          disabled={!selectedService}
          onClick={onNextStep}
        >
          <span>Continuar a Selección de Día</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
