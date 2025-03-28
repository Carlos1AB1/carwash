import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Droplets, Package, Users, BarChart2, LayoutDashboard } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8" />
            <span className="font-bold text-xl">CarWash Pro</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <NavLink to="/" icon={<LayoutDashboard className="h-5 w-5" />} text="Dashboard" />
            <NavLink to="/vehicles" icon={<Car className="h-5 w-5" />} text="Vehicles" />
            <NavLink to="/services" icon={<Droplets className="h-5 w-5" />} text="Services" />
            <NavLink to="/inventory" icon={<Package className="h-5 w-5" />} text="Inventory" />
            <NavLink to="/employees" icon={<Users className="h-5 w-5" />} text="Employees" />
            <NavLink to="/reports" icon={<BarChart2 className="h-5 w-5" />} text="Reports" />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-1 hover:text-blue-200 transition-colors duration-200"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

export default Navbar;