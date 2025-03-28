import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard.tsx';
import VehicleRegistration from './pages/VehicleRegistration.tsx';
import ServiceManagement from './pages/ServiceManagement.tsx';
import InventoryManagement from './pages/InventoryManagement.tsx';
import EmployeeManagement from './pages/EmployeeManagement.tsx';
import Reports from './pages/Reports.tsx';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vehicles" element={<VehicleRegistration />} />
              <Route path="/services" element={<ServiceManagement />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;