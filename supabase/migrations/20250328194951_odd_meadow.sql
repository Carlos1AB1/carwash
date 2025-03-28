-- MySQL Schema for Car Wash Management System

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS carwash_db;
USE carwash_db;

-- Vehicle types enum
CREATE TABLE vehicle_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    base_price DECIMAL(10,2) NOT NULL
);

-- Employees table
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    shift VARCHAR(20) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type_id INT NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
);

-- Service types table
CREATE TABLE service_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    base_duration INT NOT NULL COMMENT 'Duration in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    employee_id INT NOT NULL,
    service_type_id INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    notes TEXT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (service_type_id) REFERENCES service_types(id)
);

-- Supplies/Inventory table
CREATE TABLE supplies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    current_stock DECIMAL(10,2) NOT NULL,
    minimum_stock DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Used supplies in services
CREATE TABLE used_supplies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    supply_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (supply_id) REFERENCES supplies(id)
);

-- Insert initial vehicle types
INSERT INTO vehicle_types (name, base_price) VALUES
    ('car', 15.00),
    ('suv', 20.00),
    ('truck', 25.00),
    ('motorcycle', 10.00);

-- Insert initial service types
INSERT INTO service_types (name, description, base_duration) VALUES
    ('basic_wash', 'Exterior wash and basic interior cleaning', 30),
    ('full_service', 'Complete interior and exterior cleaning', 60),
    ('premium_detail', 'Full detailing service including wax and polish', 120),
    ('express_wash', 'Quick exterior wash only', 15);

-- Create indexes for better performance
CREATE INDEX idx_vehicle_plate ON vehicles(plate_number);
CREATE INDEX idx_service_status ON services(status);
CREATE INDEX idx_service_dates ON services(start_time, end_time);
CREATE INDEX idx_supply_stock ON supplies(current_stock);

-- Create view for pending services
CREATE VIEW pending_services AS
SELECT 
    s.id as service_id,
    v.plate_number,
    v.client_name,
    st.name as service_type,
    e.name as employee_name,
    s.start_time,
    s.status
FROM services s
JOIN vehicles v ON s.vehicle_id = v.id
JOIN service_types st ON s.service_type_id = st.id
JOIN employees e ON s.employee_id = e.id
WHERE s.status != 'completed'
ORDER BY s.start_time;

-- Create view for low stock supplies
CREATE VIEW low_stock_supplies AS
SELECT 
    id,
    name,
    current_stock,
    minimum_stock,
    unit
FROM supplies
WHERE current_stock <= minimum_stock;