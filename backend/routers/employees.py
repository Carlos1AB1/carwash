from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
from pydantic import BaseModel

router = APIRouter()


class EmployeeCreate(BaseModel):
    name: str
    position: str
    shift: str


class EmployeeUpdate(BaseModel):
    active: bool


class EmployeeResponse(BaseModel):
    id: int
    name: str
    position: str
    shift: str
    active: bool = True
    current_workload: int = 0

    class Config:
        from_attributes = True


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    new_employee = models.Employee(
        name=employee.name,
        position=employee.position,
        shift=employee.shift,
        active=True
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    # Calculate current workload (number of pending/in-progress services)
    workload = db.query(models.Service).filter(
        models.Service.employee_id == new_employee.id,
        models.Service.status.in_(["pending", "in_progress"])
    ).count()

    response = EmployeeResponse(
        id=new_employee.id,
        name=new_employee.name,
        position=new_employee.position,
        shift=new_employee.shift,
        active=new_employee.active,
        current_workload=workload
    )

    return response


@router.get("/", response_model=List[EmployeeResponse])
def get_all_employees(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).all()

    response = []
    for employee in employees:
        # Calculate current workload (number of pending/in-progress services)
        workload = db.query(models.Service).filter(
            models.Service.employee_id == employee.id,
            models.Service.status.in_(["pending", "in_progress"])
        ).count()

        response.append(
            EmployeeResponse(
                id=employee.id,
                name=employee.name,
                position=employee.position,
                shift=employee.shift,
                active=employee.active,
                current_workload=workload
            )
        )

    return response


@router.get("/{employee_id}/workload", response_model=dict)
def get_employee_workload(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Get employee's pending and in-progress services
    pending_services = db.query(models.Service).filter(
        models.Service.employee_id == employee_id,
        models.Service.status == "pending"
    ).count()

    in_progress_services = db.query(models.Service).filter(
        models.Service.employee_id == employee_id,
        models.Service.status == "in_progress"
    ).count()

    completed_services = db.query(models.Service).filter(
        models.Service.employee_id == employee_id,
        models.Service.status == "completed"
    ).count()

    return {
        "employee_id": employee_id,
        "employee_name": employee.name,
        "pending_services": pending_services,
        "in_progress_services": in_progress_services,
        "completed_services": completed_services,
        "total_workload": pending_services + in_progress_services
    }


@router.patch("/{employee_id}/status", response_model=EmployeeResponse)
def update_employee_status(employee_id: int, status_update: EmployeeUpdate, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee.active = status_update.active
    db.commit()
    db.refresh(employee)

    # Calculate current workload
    workload = db.query(models.Service).filter(
        models.Service.employee_id == employee.id,
        models.Service.status.in_(["pending", "in_progress"])
    ).count()

    response = EmployeeResponse(
        id=employee.id,
        name=employee.name,
        position=employee.position,
        shift=employee.shift,
        active=employee.active,
        current_workload=workload
    )

    return response