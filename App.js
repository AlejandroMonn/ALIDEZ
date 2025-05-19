import { SellerRegisterProvider } from '../context/SellerRegisterContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PersonalInfo from './pages/SellerSetup/PersonalInfo';
import BusinessProfile from './pages/SellerSetup/BusinessProfile';
import PaymentMethods from './pages/SellerSetup/PaymentMethods';
import DeliveryInfo from './pages/SellerSetup/DeliveryInfo';
import ProductCreation from './pages/SellerSetup/ProductCreation';

function App() {
  return (
    <SellerRegisterProvider>
      <Router>
        <Routes>
          <Route path="/seller/setup/personal-info" element={<PersonalInfo />} />
          <Route path="/seller/setup/business-profile" element={<BusinessProfile />} />
          <Route path="/seller/setup/payment-methods" element={<PaymentMethods />} />
          <Route path="/seller/setup/delivery-info" element={<DeliveryInfo />} />
          <Route path="/seller/setup/product-creation" element={<ProductCreation />} />
          {/* ... otras rutas ... */}
        </Routes>
      </Router>
    </SellerRegisterProvider>
  );
}

export default App; 