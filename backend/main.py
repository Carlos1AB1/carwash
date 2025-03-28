from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import vehicles, services, employees, inventory, reports

app = FastAPI(title="Car Wash Management System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["vehicles"])
app.include_router(services.router, prefix="/api/services", tags=["services"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])