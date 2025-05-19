import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSellerRegister } from '../../context/SellerRegisterContext';
import './PersonalInfo.css';

function PersonalInfo() {
  const navigate = useNavigate();
  const { registerData, updateRegisterData } = useSellerRegister();
  const [form, setForm] = useState({
    username: '',
    age: '',
    email: '',
    phone: '',
    profilePic: ''
  });

  useEffect(() => {
    // Prellenar el correo si ya existe en el contexto
    setForm(prev => ({ ...prev, email: registerData.personal.email }));
  }, [registerData.personal.email]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePic' && files.length > 0) {
      setForm(prev => ({ ...prev, profilePic: URL.createObjectURL(files[0]) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRegisterData('personal', form);
    navigate('/seller/setup/business-profile');
  };

  return (
    <div className="personal-info-container">
      <div className="setup-header">
        <h2>Tu perfil</h2>
      </div>
      <form className="personal-info-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="input-group">
            <label>Nombre</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Edad</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Correo</label>
            <input type="email" name="email" value={form.email} disabled />
          </div>
          <div className="input-group">
            <label>Celular</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Foto de perfil</label>
            <input type="file" name="profilePic" accept="image/*" onChange={handleChange} />
            {form.profilePic && <img src={form.profilePic} alt="preview" className="profile-pic-preview" />}
          </div>
        </div>
        <button type="submit" className="ok-btn">OK</button>
      </form>
    </div>
  );
}

export default PersonalInfo; 