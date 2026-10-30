import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from .database import Base, engine, get_db, SessionLocal
from . import models, schemas
from .security import hash_password, verify_password, create_token, current_user, require_staff

app = FastAPI(title="Campus Waste Management API", version="1.0.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

origins = [x.strip() for x in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",") if x.strip()]

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    email, password = os.getenv("BOOTSTRAP_STAFF_EMAIL"), os.getenv("BOOTSTRAP_STAFF_PASSWORD")
    if email and password:
        db = SessionLocal()
        try:
            if not db.query(models.User).filter_by(email=email.lower()).first():
                db.add(models.User(name="Campus Staff Admin", email=email.lower(),
                                   password_hash=hash_password(password), role="staff"))
                db.commit()
        finally:
            db.close()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/v1/auth/register")
def register(data: schemas.RegisterIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.query(models.User).filter_by(email=email).first():
        raise HTTPException(409, "Email already registered")
    user = models.User(name=data.name, email=email, password_hash=hash_password(data.password), role="student")
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token": create_token(user), "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@app.post("/api/v1/auth/login")
def login(data: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(email=data.email.lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return {"access_token": create_token(user), "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@app.get("/api/v1/auth/me")
def me(user=Depends(current_user)):
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}

@app.get("/api/v1/locations")
def locations(db: Session = Depends(get_db), user=Depends(current_user)):
    return db.query(models.Location).filter_by(active=1).order_by(models.Location.name).all()

@app.post("/api/v1/locations")
def create_location(data: schemas.LocationIn, db: Session = Depends(get_db), staff=Depends(require_staff)):
    if db.query(models.Location).filter_by(name=data.name).first():
        raise HTTPException(409, "Location already exists")
    obj = models.Location(**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return obj


@app.post("/api/v1/auth/register-staff")
def register_staff(data: schemas.RegisterIn, db: Session = Depends(get_db)):
    email = data.email.lower()

    if db.query(models.User).filter_by(email=email).first():
        raise HTTPException(409, "Email already registered")

    user = models.User(
        name=data.name,
        email=email,
        password_hash=hash_password(data.password),
        role="staff"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "access_token": create_token(user),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

@app.get("/api/v1/bins")
def bins(location_id: int | None = None, db: Session = Depends(get_db), user=Depends(current_user)):
    q = db.query(models.Dustbin)
    if location_id: q = q.filter_by(location_id=location_id)
    return q.order_by(models.Dustbin.code).all()

@app.post("/api/v1/bins")
def create_bin(data: schemas.BinIn, db: Session = Depends(get_db), staff=Depends(require_staff)):
    if db.query(models.Dustbin).filter_by(code=data.code).first():
        raise HTTPException(409, "Bin code already exists")
    if not db.get(models.Location, data.location_id): raise HTTPException(404, "Location not found")
    obj = models.Dustbin(**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return obj

@app.patch("/api/v1/bins/{bin_id}")
def update_bin(bin_id: int, data: schemas.BinIn, db: Session = Depends(get_db), staff=Depends(require_staff)):
    obj = db.get(models.Dustbin, bin_id)
    if not obj: raise HTTPException(404, "Bin not found")
    for k,v in data.model_dump().items(): setattr(obj,k,v)
    db.commit(); db.refresh(obj); return obj

def report_dict(r):
    return {"id":r.id, "reporter_id":r.reporter_id, "reporter_name":r.reporter.name,
            "location_id":r.location_id, "location_name":r.location.name,
            "bin_id":r.bin_id, "issue_type":r.issue_type, "waste_type":r.waste_type,
            "bin_type":r.bin_type, "description":r.description, "image_url":r.image_url,
            "status":r.status, "priority":r.priority, "assigned_to":r.assigned_to,
            "assignee_name":r.assignee.name if r.assignee else None,
            "resolution_note":r.resolution_note, "created_at":r.created_at, "updated_at":r.updated_at}

@app.get("/api/v1/reports")
def reports(db: Session = Depends(get_db), user=Depends(current_user)):
    q = db.query(models.WasteReport).order_by(models.WasteReport.created_at.desc())
    if user.role != "staff": q = q.filter_by(reporter_id=user.id)
    return [report_dict(r) for r in q.all()]

@app.post("/api/v1/reports")
def create_report(data: schemas.ReportIn, db: Session = Depends(get_db), user=Depends(current_user)):
    if not db.get(models.Location, data.location_id): raise HTTPException(404, "Location not found")
    if data.bin_id and not db.get(models.Dustbin, data.bin_id): raise HTTPException(404, "Bin not found")
    report = models.WasteReport(reporter_id=user.id, **data.model_dump())
    db.add(report); db.commit(); db.refresh(report)
    db.add(models.ReportHistory(report_id=report.id, actor_id=user.id, old_status="", new_status="Submitted", note="Report created"))
    db.commit()
    return report_dict(report)

@app.patch("/api/v1/reports/{report_id}")
def update_report(report_id: int, data: schemas.ReportUpdate, db: Session = Depends(get_db), staff=Depends(require_staff)):
    report = db.get(models.WasteReport, report_id)
    if not report: raise HTTPException(404, "Report not found")
    changes = data.model_dump(exclude_unset=True)
    old = report.status
    for k,v in changes.items(): setattr(report,k,v)
    if "status" in changes:
        db.add(models.ReportHistory(report_id=report.id, actor_id=staff.id, old_status=old,
                                    new_status=report.status, note=changes.get("resolution_note","")))
    db.commit(); db.refresh(report); return report_dict(report)

@app.get("/api/v1/analytics")
def analytics(db: Session = Depends(get_db), staff=Depends(require_staff)):
    total_bins = db.query(models.Dustbin).count()
    bin_counts = {s: db.query(models.Dustbin).filter_by(status=s).count()
                  for s in ["Functional","Damaged","Overflowing","Under Maintenance","Missing"]}
    report_counts = {s: db.query(models.WasteReport).filter_by(status=s).count()
                     for s in ["Submitted","Under Review","Assigned","In Progress","Resolved","Rejected"]}
    return {"total_bins":total_bins, "bin_status":bin_counts, "report_status":report_counts,
            "total_reports":db.query(models.WasteReport).count(),
            "locations":db.query(models.Location).count()}

@app.get("/api/v1/hotspots")
def hotspots(db: Session = Depends(get_db), user=Depends(current_user)):
    locations = db.query(models.Location).filter_by(active=1).all()
    results=[]
    for loc in locations:
        reports = db.query(models.WasteReport).filter_by(location_id=loc.id).all()
        counts = {"Overflowing":0,"Damaged":0,"Missing":0,"Insufficient bins":0}
        for r in reports:
            if r.issue_type in counts and r.status != "Rejected": counts[r.issue_type]+=1
        score = 3*counts["Overflowing"] + 2*counts["Damaged"] + 2*counts["Missing"] + counts["Insufficient bins"]
        results.append({"location_id":loc.id,"name":loc.name,"building":loc.building,
                        "latitude":loc.latitude,"longitude":loc.longitude,"reports":len(reports),
                        "score":score,"level":"High" if score>=15 else "Moderate" if score>=5 else "Low",
                        "counts":counts})
    return sorted(results,key=lambda x:x["score"],reverse=True)

@app.get("/api/v1/staff")
def staff_list(db: Session = Depends(get_db), staff=Depends(require_staff)):
    return db.query(models.User).filter_by(role="staff").order_by(models.User.name).all()
