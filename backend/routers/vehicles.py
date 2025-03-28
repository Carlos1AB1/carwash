from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
from pydantic import BaseModel

router = APIRouter()


class VehicleCreate(BaseModel):
    plate_number: str
    vehicle_type: str
    client_name: str
    client_phone: str


class VehicleResponse(BaseModel):
    id: int
    plate_number: str
    vehicle_type: str
    client_name: str
    client_phone: str

    class Config:
        from_attributes = True


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    # Check if vehicle with this plate already exists
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.plate_number == vehicle.plate_number).first()
    if db_vehicle:
        raise HTTPException(status_code=400, detail="Vehicle with this plate number already registered")

    # Create new vehicle
    new_vehicle = models.Vehicle(
        plate_number=vehicle.plate_number,
        vehicle_type=vehicle.vehicle_type,
        client_name=vehicle.client_name,
        client_phone=vehicle.client_phone
    )
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle


@router.get("/", response_model=List[VehicleResponse])
def get_all_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(models.Vehicle).all()
    return vehicles


@router.get("/{plate_number}", response_model=VehicleResponse)
def get_vehicle_by_plate(plate_number: str, db: Session = Depends(get_db)):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.plate_number == plate_number).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle