// App shell: renders the nav bar and routes between the store, cart, wallet, gateway, and orders pages.
import { Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar/NavBar';
import { StorePage } from './pages/StorePage/StorePage';
import { CartPage } from './pages/CartPage/CartPage';
import { WalletPage } from './pages/WalletPage/WalletPage';
import { MockGatewayPage } from './pages/MockGatewayPage/MockGatewayPage';
import { OrdersPage } from './pages/OrdersPage/OrdersPage';

// Defines the page routes under a shared nav bar.
export function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<StorePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/checkout/mock/:paymentId" element={<MockGatewayPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </>
  );
}
