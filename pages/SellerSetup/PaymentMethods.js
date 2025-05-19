import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSellerRegister } from '../../context/SellerRegisterContext';
import './PaymentMethods.css';

function PaymentMethods() {
  const navigate = useNavigate();
  const { registerData, updateRegisterData } = useSellerRegister();
  const [form, setForm] = useState(registerData.payment);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRegisterData('payment', form);
    navigate('/seller/setup/delivery-info');
  };

  return (
    <div className="payment-methods-container">
      <div className="setup-header">
        <h2>Medios de pago</h2>
      </div>
      <form className="payment-methods-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="input-group">
            <label>Nequi</label>
            <input type="text" name="nequi" value={form.nequi} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Tarjeta</label>
            <input type="text" name="card" value={form.card} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Efectivo</label>
            <input type="text" name="cash" value={form.cash} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Otros medios de pago</label>
            <input type="text" name="other" value={form.other} onChange={handleChange} />
          </div>
        </div>
        <button type="submit" className="ok-btn">OK</button>
      </form>
    </div>
  );
}

export default PaymentMethods; 