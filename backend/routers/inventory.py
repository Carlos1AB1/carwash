from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
from sqlalchemy import func, and_
from datetime import datetime, date, timedelta

router = APIRouter()


@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Get the current date
    today = date.today()

    # Count pending services
    pending_services = db.query(models.Service).filter(
        models.Service.status.in_(["pending", "in_progress"])
    ).count()

    # Calculate daily revenue (completed services for today)
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())

    daily_revenue = db.query(func.sum(models.Service.total_cost)).filter(
        and_(
            models.Service.status == "completed",
            models.Service.end_time >= today_start,
            models.Service.end_time <= today_end
        )
    ).scalar() or 0

    # Count active employees
    active_employees = db.query(models.Employee).filter(models.Employee.active == True).count()

    # Count total vehicles
    total_vehicles = db.query(models.Vehicle).count()

    return {
        "pendingServices": pending_services,
        "dailyRevenue": float(daily_revenue),
        "activeEmployees": active_employees,
        "totalVehicles": total_vehicles
    }


@router.get("/daily-income")
def get_daily_income(date: str = Query(..., description="Date in YYYY-MM-DD format"), db: Session = Depends(get_db)):
    try:
        # Parse the date
        report_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Calculate start and end of the day
    day_start = datetime.combine(report_date, datetime.min.time())
    day_end = datetime.combine(report_date, datetime.max.time())

    # Calculate total income for the day
    total_income = db.query(func.sum(models.Service.total_cost)).filter(
        and_(
            models.Service.status == "completed",
            models.Service.end_time >= day_start,
            models.Service.end_time <= day_end
        )
    ).scalar() or 0

    # Count completed services for the day
    services_count = db.query(models.Service).filter(
        and_(
            models.Service.status == "completed",
            models.Service.end_time >= day_start,
            models.Service.end_time <= day_end
        )
    ).count()

    return {
        "date": date,
        "total_income": float(total_income),
        "services_count": services_count
    }


@router.get("/average-service-time")
def get_average_service_time(db: Session = Depends(get_db)):
    # Get all service types
    service_types = db.query(models.ServiceType).all()

    results = []
    for service_type in service_types:
        # Calculate average time for completed services of this type
        # We need to convert timestamp difference to minutes
        completed_services = db.query(models.Service).filter(
            and_(
                models.Service.service_type == service_type.name,
                models.Service.status == "completed",
                models.Service.end_time != None
            )
        ).all()

        if completed_services:
            total_minutes = 0
            for service in completed_services:
                # Calculate time difference in minutes
                time_diff = (service.end_time - service.start_time).total_seconds() / 60
                total_minutes += time_diff

            avg_time = total_minutes / len(completed_services)
        else:
            # If no completed services, use the base duration from service_types
            avg_time = service_type.base_duration

        results.append({
            "service_type": service_type.name,
            "average_time": avg_time
        })

    return results


@router.get("/vehicle-history/{plate_number}")
def get_vehicle_history(plate_number: str, db: Session = Depends(get_db)):
    # Find the vehicle
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.plate_number == plate_number).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Get all services for this vehicle
    services = db.query(models.Service).filter(models.Service.vehicle_id == vehicle.id).all()

    result = []
    for service in services:
        employee = db.query(models.Employee).filter(models.Employee.id == service.employee_id).first()
        result.append({
            "service_date": service.start_time,
            "service_type": service.service_type,
            "total_cost": float(service.total_cost),
            "employee_name": employee.name if employee else "Unknown",
            "status": service.status
        })

    # Sort by date (newest first)
    result.sort(key=lambda x: x["service_date"], reverse=True)

    return result