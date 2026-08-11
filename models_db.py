from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    age = Column(Integer)
    weight_kg = Column(Float)
    height_cm = Column(Float)
    
    predictions = relationship("Prediction", back_populates="user")
    medications = relationship("Medication", back_populates="user")
    appointments = relationship("Appointment", back_populates="user")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symptoms = Column(String) # Stored as comma-separated string
    top_disease = Column(String)
    confidence = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="predictions")

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    dosage = Column(String)
    frequency = Column(String)
    taken_today = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="medications")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    doctor_name = Column(String)
    specialty = Column(String)
    date = Column(String)
    time = Column(String)
    status = Column(String, default="Scheduled")

    user = relationship("User", back_populates="appointments")
