from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()


class ServiceCreate(BaseModel):
    vehicle_id: int
    employee_id: int
    service_type_id: int
    notes: Optional[str] = None


class ServiceUpdate(BaseModel):
    status: str


class ServiceResponse(BaseModel):
    id: int
    vehicle: dict
    employee: dict
    service_type: str
    status: str
    start_time: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    # Check if vehicle exists
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == service.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Check if employee exists
    employee = db.query(models.Employee).filter(models.Employee.id == service.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Get service type for total_cost calculation
    service_type = db.query(models.ServiceType).filter(models.ServiceType.id == service.service_type_id).first()
    if not service_type:
        raise HTTPException(status_code=404, detail="Service type not found")

    # Calculate approximate cost based on service type
    total_cost = 20.00  # Default cost

    # Create new service
    new_service = models.Service(
        vehicle_id=service.vehicle_id,
        employee_id=service.employee_id,
        service_type_id=service.service_type_id,
        service_type=service_type.name,
        status="pending",
        start_time=datetime.utcnow(),
        total_cost=total_cost,
        notes=service.notes
    )
    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    # Format the response
    response = {
        "id": new_service.id,
        "vehicle": {"plate_number": vehicle.plate_number, "client_name": vehicle.client_name},
        "employee": {"name": employee.name},
        "service_type": service_type.name,
        "status": new_service.status,
        "start_time": new_service.start_time
    }

    return response


@router.get("/", response_model=List[dict])
def get_all_services(db: Session = Depends(get_db)):
    services = db.query(models.Service).all()

    response = []
    for service in services:
        vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == service.vehicle_id).first()
        employee = db.query(models.Employee).filter(models.Employee.id == service.employee_id).first()

        response.append({
            "id": service.id,
            "vehicle": {"plate_number": vehicle.plate_number, "client_name": vehicle.client_name},
            "employee": {"name": employee.name},
            "service_type": service.service_type,
            "status": service.status,
            "start_time": service.start_time
        })

    return response


@router.get("/pending", response_model=List[dict])
def get_pending_services(db: Session = Depends(get_db)):
    services = db.query(models.Service).filter(models.Service.status == "pending").all()

    response = []
    for service in services:
        vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == service.vehicle_id).first()
        employee = db.query(models.Employee).filter(models.Employee.id == service.employee_id).first()

        response.append({
            "id": service.id,
            "vehicle": {"plate_number": vehicle.plate_number, "client_name": vehicle.client_name},
            "employee": {"name": employee.name},
            "service_type": service.service_type,
            "status": service.status,
            "start_time": service.start_time
        })

    return response


@router.patch("/{service_id}/status", response_model=dict)
def update_service_status(service_id: int, status_update: ServiceUpdate, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    if status_update.status not in ["pending", "in_progress", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status value")

    service.status = status_update.status

    # If the service is completed, update the end time
    if status_update.status == "completed":
        service.end_time = datetime.utcnow()

    db.commit()
    db.refresh(service)

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == service.vehicle_id).first()
    employee = db.query(models.Employee).filter(models.Employee.id == service.employee_id).first()

    return {
        "id": service.id,
        "vehicle": {"plate_number": vehicle.plate_number, "client_name": vehicle.client_name},
        "employee": {"name": employee.name},
        "service_type": service.service_type,
        "status": service.status,
        "start_time": service.start_time,
        "end_time": service.end_time
    }