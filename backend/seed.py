from app.database import Base, engine, SessionLocal
from app import models
from app.security import hash_password

Base.metadata.create_all(bind=engine)
db=SessionLocal()
locations = [
    # Academic and administrative buildings
    ("Main Building", "Main Building", "Academic", 13.0100, 74.7940),
    ("Central Library", "Central Library", "Academic", 13.0100, 74.7940),
    ("E-Library", "E-Library", "Academic", 13.0100, 74.7940),
    ("CIDS", "CIDS", "Academic", 13.0100, 74.7940),
    ("CRF", "CRF", "Research", 13.0100, 74.7940),

    # Food and shopping spots
    ("Food Court", "Food Court", "Food", 13.0100, 74.7940),
    ("Boys Co-op", "Boys Co-op", "Shopping", 13.0100, 74.7940),
    ("Girls Co-op", "Girls Co-op", "Shopping", 13.0100, 74.7940),
    ("NesCafe", "NesCafe", "Food", 13.0100, 74.7940),
    ("Amul", "Amul", "Food", 13.0100, 74.7940),
    ("Nandini", "Nandini", "Food", 13.0100, 74.7940),
    ("Suprabha", "Suprabha", "Food", 13.0100, 74.7940),

    # Auditoriums and lecture hall complexes
    ("SJA", "Silver Jubilee Auditorium", "Auditorium", 13.0100, 74.7940),
    ("NSC", "NSC", "Academic", 13.0100, 74.7940),
    ("OSC", "OSC", "Academic", 13.0100, 74.7940),
    ("LHC-A", "Lecture Hall Complex A", "Academic", 13.0100, 74.7940),
    ("LHC-D", "Lecture Hall Complex D", "Academic", 13.0100, 74.7940),
    ("LHC-C", "Lecture Hall Complex C", "Academic", 13.0100, 74.7940),

    # Hostels and student facilities
    ("Girl's Block", "Girl's Block", "Hostel", 13.0100, 74.7940),
    ("STEP", "Science and Technology Entrepreneurs Park", "Research", 13.0100, 74.7940),
    ("Swimming Pool", "Swimming Pool", "Sports", 13.0100, 74.7940),

    # Engineering departments
    ("Computer Science and Engineering (CSE)", "CSE Department", "Department", 13.0100, 74.7940),
    ("Information Technology (IT)", "IT Department", "Department", 13.0100, 74.7940),
    ("Electronics and Communication Engineering (ECE)", "ECE Department", "Department", 13.0100, 74.7940),
    ("Electrical and Electronics Engineering (EEE)", "EEE Department", "Department", 13.0100, 74.7940),
    ("Mechanical Engineering", "Mechanical Engineering Department", "Department", 13.0100, 74.7940),
    ("Civil Engineering", "Civil Engineering Department", "Department", 13.0100, 74.7940),
    ("Chemical Engineering", "Chemical Engineering Department", "Department", 13.0100, 74.7940),
    ("Metallurgical and Materials Engineering", "MME Department", "Department", 13.0100, 74.7940),
    ("Mining Engineering", "Mining Engineering Department", "Department", 13.0100, 74.7940),

    # Science and humanities departments
    ("Mathematics Department", "Mathematics Department", "Department", 13.0100, 74.7940),
    ("Physics Department", "Physics Department", "Department", 13.0100, 74.7940),
    ("Chemistry Department", "Chemistry Department", "Department", 13.0100, 74.7940),
    ("Humanities, Social Sciences and Management (HSSM)", "HSSM Department", "Department", 13.0100, 74.7940),
    ("Applied Mechanics and Hydraulics", "AMH Department", "Department", 13.0100, 74.7940),
    ("Department of Marine Engineering", "Marine Engineering Department", "Department", 13.0100, 74.7940),
    ("Department of Biotechnology", "Biotechnology Department", "Department", 13.0100, 74.7940),

    # Other campus facilities
    ("SBI", "State Bank of India", "Bank", 13.0100, 74.7940),
    ("Staff Residential Area", "Staff Residential Area", "Residential", 13.0100, 74.7940),
    ("Beach", "NITK Beach", "Recreation", 13.0100, 74.7940),
]

for name,building,area,lat,lon in locations:
    if not db.query(models.Location).filter_by(name=name).first():
        db.add(models.Location(name=name,building=building,area_type=area,latitude=lat,longitude=lon))
db.commit()
for loc in db.query(models.Location).all():
    code=f"BIN-{loc.id:03d}"
    if not db.query(models.Dustbin).filter_by(code=code).first():
        db.add(models.Dustbin(code=code,location_id=loc.id,bin_type="Wet / Organic",
                              capacity_litres=50,status="Functional"))
db.commit()
if not db.query(models.User).filter_by(email="staff@campus.edu").first():
    db.add(models.User(name="Demo Staff",email="staff@campus.edu",
                       password_hash=hash_password("ChangeMe123!"),role="staff"))
    db.commit()
db.close()
print("Seed complete. Demo staff: staff@campus.edu / ChangeMe123!")
