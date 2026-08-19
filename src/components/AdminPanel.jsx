import React, { useState, useEffect } from 'react';
import {
  fetchAdminAppointments,
  cancelAppointment,
  fetchServices,
  addService,
  updateService,
  deleteService,
  updateSlotAvailability,
  testRealEmail
} from '../services/api';
import {
  X, Calendar, Clock, DollarSign, Plus, Trash2, Edit3, Check, Search, Filter, AlertCircle, Sparkles, Shield, Mail, Send, Loader2
} from 'lucide-react';

export default function AdminPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'services' | 'slots' | 'test-email'
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  // Email test state
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  // Service form modal state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'Uñas',
    image: ''
  });

  // Custom slots state
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotTime, setSlotTime] = useState('10:00');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appData, servData] = await Promise.all([
        fetchAdminAppointments(),
        fetchServices()
      ]);
      setAppointments(appData);
      setServices(servData);
    } catch (err) {
      console.error('Error al cargar panel admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailAddress) return;
    setSendingTest(true);
    setTestStatus(null);
    try {
      const res = await testRealEmail(testEmailAddress);
      setTestStatus({ success: true, message: res.message });
    } catch (err) {
      setTestStatus({ success: false, message: err.message });
    } finally {
      setSendingTest(false);
    }
  };

  // Appointment operations
  const handleCancelAppointment = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este turno?')) return;
    try {
      await cancelAppointment(id);
      loadData();
    } catch (err) {
      alert('Error al cancelar turno');
    }
  };

  // Service CRUD operations
  const handleOpenServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category || 'Uñas',
        image: service.image || ''
      });
    } else {
      setEditingService(null);
      setServiceFormData({
        name: '',
        description: '',
        price: '',
        duration: '60 min',
        category: 'Uñas',
        image: ''
      });
    }
    setShowServiceForm(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateService(editingService.id, serviceFormData);
      } else {
        await addService(serviceFormData);
      }
      setShowServiceForm(false);
      loadData();
    } catch (err) {
      alert('Error al guardar el servicio');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('¿Deseas eliminar este servicio?')) return;
    try {
      await deleteService(id);
      loadData();
    } catch (err) {
      alert('Error al eliminar servicio');
    }
  };

  // Slot Management
  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await updateSlotAvailability({
        date: slotDate,
        time_slot: slotTime,
        is_available: 1
      });
      alert(`Horario ${slotTime} agregado para la fecha ${slotDate}`);
    } catch (err) {
      alert('Error al guardar horario');
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      `${app.client_firstname} ${app.client_lastname} ${app.client_email} ${app.service_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'Todos' || app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="admin-modal-overlay">
      <style>{`
        .admin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(5px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .admin-modal-container {
          background: #ffffff;
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 950px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        .admin-header {
          background: linear-gradient(135deg, #fdf2f4 0%, #f7e1e6 100%);
          padding: 20px 28px;
          border-bottom: 1.5px solid var(--pink-200);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .admin-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .admin-tabs {
          display: flex;
          background: #ffffff;
          padding: 6px 28px;
          border-bottom: 1px solid var(--pink-200);
          gap: 12px;
          overflow-x: auto;
        }
        .tab-btn {
          background: none;
          border: none;
          padding: 10px 18px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-medium);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .tab-btn.active {
          color: var(--gold-primary);
          border-bottom-color: var(--gold-primary);
        }
        .admin-content-body {
          padding: 24px 28px;
          overflow-y: auto;
          flex-grow: 1;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }
        .admin-table th {
          background: var(--pink-100);
          padding: 12px 14px;
          color: var(--text-dark);
          font-weight: 600;
          border-bottom: 1px solid var(--pink-200);
        }
        .admin-table td {
          padding: 14px;
          border-bottom: 1px solid #f5efe6;
          color: var(--text-dark);
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-confirmed {
          background: #eaf8f0;
          color: #2b7a4b;
        }
        .status-cancelled {
          background: #fff0f3;
          color: #9c2b45;
        }
        .action-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .action-icon-btn:hover {
          background: var(--pink-100);
        }
      `}</style>

      <div className="admin-modal-container">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-title-wrap">
            <Shield size={22} className="text-gold-gradient" />
            <h2 className="font-serif" style={{ fontSize: '1.4rem', margin: 0 }}>
              Panel de Administración
            </h2>
          </div>
          <button className="action-icon-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Turnos Reservados ({appointments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Gestión de Servicios ({services.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'slots' ? 'active' : ''}`}
            onClick={() => setActiveTab('slots')}
          >
            Agregar Horarios
          </button>
          <button
            className={`tab-btn ${activeTab === 'test-email' ? 'active' : ''}`}
            onClick={() => setActiveTab('test-email')}
          >
            ✉️ Probar Email Real SMTP
          </button>
        </div>

        {/* Content */}
        <div className="admin-content-body">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px' }}>Cargando datos del panel...</p>
          ) : activeTab === 'appointments' ? (
            <div>
              {/* Controls */}
              <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flexGrow: 1, minWidth: '220px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '38px', paddingTop: '10px', paddingBottom: '10px' }}
                    placeholder="Buscar cliente, email o servicio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="form-input"
                  style={{ width: '180px', paddingTop: '10px', paddingBottom: '10px' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#ID</th>
                      <th>Cliente</th>
                      <th>Contacto</th>
                      <th>Servicio</th>
                      <th>Fecha & Hora</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light)' }}>
                          No se encontraron turnos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((app) => (
                        <tr key={app.id}>
                          <td><strong>#{app.id}</strong></td>
                          <td>{app.client_firstname} {app.client_lastname}</td>
                          <td>
                            <div style={{ fontSize: '0.8rem' }}>{app.client_email}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{app.client_phone}</div>
                          </td>
                          <td><strong>{app.service_name}</strong></td>
                          <td>
                            <div>{app.date}</div>
                            <div style={{ fontWeight: '600', color: 'var(--gold-primary)' }}>{app.time_slot} hs</div>
                          </td>
                          <td>{formatPrice(app.price)}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                app.status === 'Confirmado' ? 'status-confirmed' : 'status-cancelled'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td>
                            {app.status === 'Confirmado' && (
                              <button
                                className="action-icon-btn"
                                style={{ color: '#9c2b45' }}
                                title="Cancelar Turno"
                                onClick={() => handleCancelAppointment(app.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'services' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="font-serif" style={{ fontSize: '1.2rem' }}>Servicios Activos</h3>
                <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => handleOpenServiceModal()}>
                  <Plus size={16} />
                  <span>Nuevo Servicio</span>
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Servicio</th>
                      <th>Categoría</th>
                      <th>Duración</th>
                      <th>Precio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((serv) => (
                      <tr key={serv.id}>
                        <td>
                          <strong>{serv.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-medium)', maxWidth: '300px' }}>
                            {serv.description}
                          </div>
                        </td>
                        <td>{serv.category || 'General'}</td>
                        <td>{serv.duration}</td>
                        <td style={{ fontWeight: '600', color: 'var(--gold-primary)' }}>
                          {formatPrice(serv.price)}
                        </td>
                        <td>
                          <button
                            className="action-icon-btn"
                            title="Editar Servicio"
                            onClick={() => handleOpenServiceModal(serv)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="action-icon-btn"
                            style={{ color: '#9c2b45' }}
                            title="Eliminar Servicio"
                            onClick={() => handleDeleteService(serv.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'slots' ? (
            <div>
              <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
                Habilitar Horarios Especiales
              </h3>
              <form onSubmit={handleAddSlot} style={{ maxWidth: '400px', background: 'var(--pink-100)', padding: '20px', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-input"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Horario (HH:MM)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. 13:30"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '10px' }}>
                  Habilitar Horario
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                Probar Configuración SMTP de Envío Real
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', marginBottom: '20px' }}>
                Ingresa una dirección de correo donde desees recibir un email de prueba real para verificar que tus claves SMTP en el archivo <code>.env</code> funcionan correctamente.
              </p>

              <form onSubmit={handleSendTestEmail} style={{ maxWidth: '450px', background: '#fffafc', border: '1px solid var(--pink-200)', padding: '24px', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-group">
                  <label className="form-label">Correo de Destino *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="tu_email@ejemplo.com"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '10px' }}
                  disabled={sendingTest}
                >
                  {sendingTest ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Enviando correo real de prueba...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Enviar Email Real de Prueba</span>
                    </>
                  )}
                </button>
              </form>

              {testStatus && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    maxWidth: '450px',
                    fontSize: '0.9rem',
                    background: testStatus.success ? '#eaf8f0' : '#fff0f3',
                    border: testStatus.success ? '1px solid #c2e9d2' : '1px solid #f8c4ce',
                    color: testStatus.success ? '#2b7a4b' : '#9c2b45'
                  }}
                >
                  <strong>{testStatus.success ? '✅ Éxito:' : '❌ Error:'}</strong> {testStatus.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Service Form */}
      {showServiceForm && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content-email" style={{ padding: '24px', maxWidth: '500px' }}>
            <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '20px' }}>
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <form onSubmit={handleSaveService}>
              <div className="form-group">
                <label className="form-label">Nombre del Servicio *</label>
                <input
                  type="text"
                  className="form-input"
                  value={serviceFormData.name}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción Breve *</label>
                <textarea
                  className="form-input"
                  style={{ height: '80px', resize: 'vertical' }}
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Precio ($) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duración *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. 60 min"
                    value={serviceFormData.duration}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, duration: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select
                  className="form-input"
                  value={serviceFormData.category}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                >
                  <option value="Uñas">Uñas</option>
                  <option value="Pestañas">Pestañas</option>
                  <option value="Cejas">Cejas</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Masajes">Masajes</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">URL de Imagen (Opcional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={serviceFormData.image}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, image: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowServiceForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
