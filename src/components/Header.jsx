import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function Header({ onOpenAdmin }) {
  return (
    <header className="header-coquette">
      <style>{`
        .header-coquette {
          text-align: center;
          padding: 30px 20px 20px;
          margin-bottom: 25px;
          position: relative;
        }
        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          padding: 6px 18px;
          border-radius: 30px;
          border: 1px solid var(--pink-300);
          box-shadow: 0 4px 14px rgba(230, 180, 195, 0.2);
          font-size: 0.85rem;
          color: var(--text-medium);
          margin-bottom: 12px;
          font-weight: 500;
        }
        .brand-title {
          font-family: var(--font-serif);
          font-size: 2.6rem;
          font-weight: 500;
          color: var(--text-dark);
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .brand-subtitle {
          font-size: 0.95rem;
          color: var(--text-medium);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 400;
        }
        .admin-trigger-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid var(--pink-200);
          color: var(--text-medium);
          padding: 8px 14px;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all var(--transition-fast);
        }
        .admin-trigger-btn:hover {
          background: #ffffff;
          border-color: var(--gold-primary);
          color: var(--gold-primary);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.18);
        }
        @media (max-width: 640px) {
          .brand-title {
            font-size: 2rem;
          }
          .admin-trigger-btn {
            position: static;
            margin: 15px auto 0;
          }
        }
      `}</style>

      <button className="admin-trigger-btn" onClick={onOpenAdmin} title="Acceso Administrador">
        <ShieldCheck size={16} />
        <span>Panel Admin</span>
      </button>

      <div className="brand-badge">
        <span>🎀</span>
        <span>Studio & Beauty Boutique</span>
        <Sparkles size={14} className="text-gold-gradient" />
      </div>

      <h1 className="brand-title">Maison Coquette</h1>
      <p className="brand-subtitle">Reserva de Turnos</p>
    </header>
  );
}
