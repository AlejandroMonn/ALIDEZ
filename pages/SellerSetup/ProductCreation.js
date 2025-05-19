import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSellerRegister } from '../../context/SellerRegisterContext';
import './ProductCreation.css';

function ProductCreation() {
  const navigate = useNavigate();
  const { registerData, updateRegisterData } = useSellerRegister();
  const [form, setForm] = useState(registerData.product);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.category) newErrors.category = 'La categoría es obligatoria.';
    if (!form.price) newErrors.price = 'El precio es obligatorio.';
    else if (isNaN(Number(form.price))) newErrors.price = 'El precio debe ser un número.';
    if (!form.inventory) newErrors.inventory = 'El inventario es obligatorio.';
    else if (isNaN(Number(form.inventory))) newErrors.inventory = 'El inventario debe ser un número.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess(false);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    updateRegisterData('product', form);
    setLoading(true);
    try {
      const response = await fetch('/api/seller/full-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...registerData, product: form })
      });
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/seller/dashboard'), 1500);
      } else {
        const data = await response.json();
        setApiError(data.message || 'Error al registrar vendedor');
      }
    } catch (err) {
      setApiError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-creation-container">
      <div className="setup-header">
        <h2>Crear productos</h2>
      </div>
      <form className="product-creation-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="input-group">
            <label>Categoría</label>
            <input type="text" name="category" value={form.category} onChange={handleChange} />
            {errors.category && <span className="error-msg">{errors.category}</span>}
          </div>
          <div className="input-group">
            <label>Subcategoría</label>
            <input type="text" name="subcategory" value={form.subcategory} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Clase</label>
            <input type="text" name="class" value={form.class} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Marca</label>
            <input type="text" name="brand" value={form.brand} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Tamaño</label>
            <input type="text" name="size" value={form.size} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Precio</label>
            <input type="text" name="price" value={form.price} onChange={handleChange} />
            {errors.price && <span className="error-msg">{errors.price}</span>}
          </div>
          <div className="input-group">
            <label>Inventario</label>
            <input type="text" name="inventory" value={form.inventory} onChange={handleChange} />
            {errors.inventory && <span className="error-msg">{errors.inventory}</span>}
          </div>
        </div>
        {apiError && <div className="api-error-msg">{apiError}</div>}
        {success && <div className="success-msg">¡Registro exitoso! Redirigiendo...</div>}
        <button type="submit" className="ok-btn" disabled={loading}>{loading ? 'Registrando...' : 'OK'}</button>
      </form>
    </div>
  );
}

export default ProductCreation; 