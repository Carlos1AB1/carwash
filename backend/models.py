from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean, Text
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
    plate_number = Column(String(20), unique=True, index=True)
    vehicle_type = Column(String(50))
    client_name = Column(String(100))
    client_phone = Column(String(20))
    services = relationship("Service", back_populates="vehicle")


class ServiceType(Base):
    __tablename__ = "service_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True)
    description = Column(Text, nullable=True)
    base_duration = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    service_type_id = Column(Integer, ForeignKey("service_types.id"))
    service_type = Column(String(100))
    status = Column(String(20), default=ServiceStatus.PENDING)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    total_cost = Column(Float)
    notes = Column(Text, nullable=True)

    vehicle = relationship("Vehicle", back_populates="services")
    employee = relationship("Employee", back_populates="services")
    used_supplies = relationship("UsedSupply", back_populates="service")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    position = Column(String(50))
    shift = Column(String(20))
    active = Column(Boolean, default=True)
    services = relationship("Service", back_populates="employee")


class Supply(Base):
    __tablename__ = "supplies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True)
    description = Column(Text, nullable=True)
    current_stock = Column(Float)
    minimum_stock = Column(Float)
    unit = Column(String(20))
    usages = relationship("UsedSupply", back_populates="supply")


class UsedSupply(Base):
    __tablename__ = "used_supplies"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    supply_id = Column(Integer, ForeignKey("supplies.id"))
    quantity = Column(Float)

    service = relationship("Service", back_populates="used_supplies")
    supply = relationship("Supply", back_populates="usages")