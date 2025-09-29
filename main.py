# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship, joinedload
from pydantic import BaseModel
import logging
from typing import List, Optional
import os

# Logging setup
logging.basicConfig(filename='logfile', level=logging.INFO)

# Prefer environment DATABASE_URL, fall back to placeholder
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -------------------------
# SQLAlchemy Models
# -------------------------
class PatientDB(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    gender = Column(String)
    weight = Column(Float)
    height = Column(Float)
    bmi = Column(Float)
    history = relationship("ClinicalHistoryDB", back_populates="patient", uselist=False)
    medications = relationship("MedicationDB", back_populates="patient", cascade="all, delete-orphan")
    lab_results = relationship("LabResultsDB", back_populates="patient", uselist=False)
    functional_status = relationship("FunctionalStatusDB", back_populates="patient", uselist=False)

class ClinicalHistoryDB(Base):
    __tablename__ = "clinical_history"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    diabetes_duration = Column(Integer, nullable=True)
    complications = Column(String, nullable=True)
    comorbidities = Column(String, nullable=True)
    patient = relationship("PatientDB", back_populates="history")

class MedicationDB(Base):
    __tablename__ = "medications"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    drug_name = Column(String)
    dosage = Column(String, nullable=True)
    frequency = Column(String, nullable=True)
    patient = relationship("PatientDB", back_populates="medications")

class LabResultsDB(Base):
    __tablename__ = "lab_results"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    hba1c = Column(Float, nullable=True)
    glucose = Column(Integer, nullable=True)
    lipids = Column(String, nullable=True)
    kidney_function = Column(String, nullable=True)
    patient = relationship("PatientDB", back_populates="lab_results")

class FunctionalStatusDB(Base):
    __tablename__ = "functional_status"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    frailty_assessment = Column(String, nullable=True)
    adl_independence = Column(String, nullable=True)
    patient = relationship("PatientDB", back_populates="functional_status")

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# -------------------------
# Pydantic models (input)
# -------------------------
class MedicationCreate(BaseModel):
    drug_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None

class PatientCreate(BaseModel):
    age: int
    gender: str
    weight: float
    height: float
    bmi: float
    diabetes_duration: Optional[int] = None
    complications: Optional[str] = None
    comorbidities: Optional[str] = None
    medications: List[MedicationCreate] = []
    hba1c: Optional[float] = None
    glucose: Optional[int] = None
    lipids: Optional[str] = None
    kidney_function: Optional[str] = None
    frailty_assessment: Optional[str] = None
    adl_independence: Optional[str] = None

# -------------------------
# Pydantic models (output) - with orm_mode
# -------------------------
class MedicationOut(BaseModel):
    id: int
    drug_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None

    class Config:
        orm_mode = True

class ClinicalHistoryOut(BaseModel):
    id: int
    diabetes_duration: Optional[int] = None
    complications: Optional[str] = None
    comorbidities: Optional[str] = None

    class Config:
        orm_mode = True

class LabResultsOut(BaseModel):
    id: int
    hba1c: Optional[float] = None
    glucose: Optional[int] = None
    lipids: Optional[str] = None
    kidney_function: Optional[str] = None

    class Config:
        orm_mode = True

class FunctionalStatusOut(BaseModel):
    id: int
    frailty_assessment: Optional[str] = None
    adl_independence: Optional[str] = None

    class Config:
        orm_mode = True

class PatientOut(BaseModel):
    id: int
    age: int
    gender: str
    weight: float
    height: float
    bmi: float
    history: Optional[ClinicalHistoryOut] = None
    medications: List[MedicationOut] = []
    lab_results: Optional[LabResultsOut] = None
    functional_status: Optional[FunctionalStatusOut] = None

    class Config:
        orm_mode = True

# -------------------------
# App setup
# -------------------------
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def read_index():
    return FileResponse('static/index.html')

# -------------------------
# Endpoints
# -------------------------
@app.post("/api/patients", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    logging.info(f"Received patient data: {patient.dict()}")
    try:
        db_patient = PatientDB(
            age=patient.age,
            gender=patient.gender,
            weight=patient.weight,
            height=patient.height,
            bmi=patient.bmi
        )
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)

        # create clinical history
        db_history = ClinicalHistoryDB(
            patient_id=db_patient.id,
            diabetes_duration=patient.diabetes_duration,
            complications=patient.complications,
            comorbidities=patient.comorbidities,
        )
        db.add(db_history)

        # medications
        for med in patient.medications:
            db_med = MedicationDB(patient_id=db_patient.id, **med.dict())
            db.add(db_med)

        # labs
        db_labs = LabResultsDB(
            patient_id=db_patient.id,
            hba1c=patient.hba1c,
            glucose=patient.glucose,
            lipids=patient.lipids,
            kidney_function=patient.kidney_function
        )
        db.add(db_labs)

        # functional status
        db_functional = FunctionalStatusDB(
            patient_id=db_patient.id,
            frailty_assessment=patient.frailty_assessment,
            adl_independence=patient.adl_independence
        )
        db.add(db_functional)
        
        db.commit()

        # load the patient back with relationships populated
        patient_out = db.query(PatientDB) \
            .options(
                joinedload(PatientDB.history),
                joinedload(PatientDB.medications),
                joinedload(PatientDB.lab_results),
                joinedload(PatientDB.functional_status),
            ) \
            .filter(PatientDB.id == db_patient.id) \
            .first()

        logging.info(f"Successfully created patient with id: {db_patient.id}")
        return patient_out
    except Exception as e:
        logging.error(f"Error creating patient: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/patients", response_model=List[PatientOut])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = db.query(PatientDB) \
        .options(
            joinedload(PatientDB.history),
            joinedload(PatientDB.medications),
            joinedload(PatientDB.lab_results),
            joinedload(PatientDB.functional_status),
        ) \
        .offset(skip).limit(limit).all()
    return patients
