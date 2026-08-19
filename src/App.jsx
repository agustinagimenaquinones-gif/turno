import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StepProgress from './components/StepProgress';
import ServiceStep from './components/ServiceStep';
import DateStep from './components/DateStep';
import TimeStep from './components/TimeStep';
import InfoStep from './components/InfoStep';
import ConfirmStep from './components/ConfirmStep';
import SuccessModal from './components/SuccessModal';
import AdminPanel from './components/AdminPanel';
import { fetchServices, fetchBusinessInfo } from './services/api';
import { Heart, Sparkles, MapPin, Phone, Instagram, Mail } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState([]);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin Modal
  const [showAdmin, setShowAdmin] = useState(false);

  // Booking Form State
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  });

  // Final Confirmation Data
  const [confirmationData, setConfirmationData] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [servData, infoData] = await Promise.all([
          fetchServices(),
          fetchBusinessInfo()
        ]);
        setServices(servData);
        setBusinessInfo(infoData);
      } catch (err) {
        console.error('Error al inicializar datos:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleResetFlow = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setConfirmationData(null);
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      phone: ''
    });
  };

  const handleSuccessBooking = (data) => {
    setConfirmationData(data);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header onOpenAdmin={() => setShowAdmin(true)} />

      {/* Admin Panel Overlay */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {/* Main Flow Container */}
      <main>
        {confirmationData ? (
          <SuccessModal
            confirmationData={confirmationData}
            onReset={handleResetFlow}
          />
        ) : loading ? (
          <div className="coquette-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Sparkles size={36} className="text-gold-gradient animate-spin" style={{ margin: '0 auto 16px' }} />
            <p className="font-serif" style={{ fontSize: '1.2rem', color: 'var(--text-dark)' }}>
              Cargando catálogo de experiencias...
            </p>
          </div>
        ) : (
          <div>
            {/* Step Bar */}
            <StepProgress
              currentStep={currentStep}
              onSelectStep={(stepId) => setCurrentStep(stepId)}
            />

            {/* Card Body */}
            <div className="coquette-card">
              {currentStep === 1 && (
                <ServiceStep
                  services={services}
                  selectedService={selectedService}
                  onSelectService={(serv) => setSelectedService(serv)}
                  onNextStep={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 2 && (
                <DateStep
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setSelectedTime('');
                  }}
                  onNextStep={() => setCurrentStep(3)}
                  onPrevStep={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && (
                <TimeStep
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSelectTime={(time) => setSelectedTime(time)}
                  onNextStep={() => setCurrentStep(4)}
                  onPrevStep={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 4 && (
                <InfoStep
                  formData={formData}
                  onChangeForm={(updated) => setFormData(updated)}
                  onNextStep={() => setCurrentStep(5)}
                  onPrevStep={() => setCurrentStep(3)}
                />
              )}

              {currentStep === 5 && (
                <ConfirmStep
                  bookingData={{
                    service: selectedService,
                    date: selectedDate,
                    time: selectedTime,
                    formData: formData
                  }}
                  onPrevStep={() => setCurrentStep(4)}
                  onSuccessBooking={handleSuccessBooking}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: '50px', textAlign: 'center', color: 'var(--text-medium)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} className="text-gold-gradient" />
            <span>{businessInfo?.address || 'Av. Libertador 1420, Buenos Aires'}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} className="text-gold-gradient" />
            <span>{businessInfo?.phone || '+54 9 11 5544-3322'}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Instagram size={14} className="text-gold-gradient" />
            <span>{businessInfo?.instagram || '@maison.coquette.studio'}</span>
          </span>
        </div>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <span>Diseñado con</span>
          <Heart size={14} fill="#e8a2b1" color="#e8a2b1" />
          <span>para Maison Coquette Studio — © 2026</span>
        </p>
      </footer>
    </div>
  );
}
