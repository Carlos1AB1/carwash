from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

class VehicleType(str, enum.Enum):
    CAR = "car"
    SUV = "suv"
    TRUCK = "truck"
    MOTORCYCLE = "motorcycle"

class ServiceStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String, unique=True, index=True)
    vehicle_type = Column(String)
    client_name = Column(String)
    client_phone = Column(String)
    services = relationship("Service", back_populates="vehicle")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    service_type = Column(String)
    status = Column(String, default=ServiceStatus.PENDING)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    total_cost = Column(Float)
    
    vehicle = relationship("Vehicle", back_populates="services")
    employee = relationship("Employee", back_populates="services")
    used_supplies = relationship("UsedSupply", back_populates="service")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    position = Column(String)
    shift = Column(String)
    services = relationship("Service", back_populates="employee")

class Supply(Base):
    __tablename__ = "supplies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    current_stock = Column(Integer)
    minimum_stock = Column(Integer)
    unit = Column(String)
    usages = relationship("UsedSupply", back_populates="supply")

class UsedSupply(Base):
    __tablename__ = "used_supplies"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    supply_id = Column(Integer, ForeignKey("supplies.id"))
    quantity = Column(Float)
    
    service = relationship("Service", back_populates="used_supplies")
    supply = relationship("Supply", back_populates="usages")