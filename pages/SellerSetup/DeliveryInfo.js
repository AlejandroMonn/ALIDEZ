import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSellerRegister } from '../../context/SellerRegisterContext';
import './DeliveryInfo.css';

function DeliveryInfo() {
  const navigate = useNavigate();
  const { registerData, updateRegisterData } = useSellerRegister();
  const [form, setForm] = useState(registerData.delivery);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRegisterData('delivery', form);
    navigate('/seller/setup/product-creation');
  };

  return (
    <div className="delivery-info-container">
      <div className="setup-header">
        <h2>Domicilios</h2>
      </div>
      <form className="delivery-info-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="input-group">
            <label>Horario de domicilios</label>
            <input type="text" name="schedule" value={form.schedule} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Valor mínimo</label>
            <input type="text" name="minValue" value={form.minValue} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Qué transporte usas para hacer domicilios</label>
            <input type="text" name="transport" value={form.transport} onChange={handleChange} />
          </div>
        </div>
        <button type="submit" className="ok-btn">OK</button>
      </form>
    </div>
  );
}

export default DeliveryInfo; 