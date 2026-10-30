from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class LocationIn(BaseModel):
    name: str
    building: str = ""
    area_type: str = "Other"
    latitude: float
    longitude: float

class BinIn(BaseModel):
    code: str
    location_id: int
    bin_type: str
    capacity_litres: int = 50
    status: str = "Functional"
    notes: str = ""

class ReportIn(BaseModel):
    location_id: int
    bin_id: Optional[int] = None
    issue_type: str
    waste_type: str
    bin_type: str = "Not applicable"
    description: str = ""
    image_url: str = ""

class ReportUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
    resolution_note: Optional[str] = None

class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
