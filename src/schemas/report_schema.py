from pydantic import BaseModel, Field
from typing import List, Optional

class PatientInfo(BaseModel):
    name: Optional[str] = Field(None, description="Name of the patient")
    age: Optional[str] = Field(None, description="Age of the patient")
    gender: Optional[str] = Field(None, description="Gender of the patient")
    lab_name: Optional[str] = Field(None, description="Name of the diagnostic lab")
    doctor_name: Optional[str] = Field(None, description="Referring doctor name")
    sample_date: Optional[str] = Field(None, description="Date of sample collection")
    report_date: Optional[str] = Field(None, description="Date of report issue")
    report_status: Optional[str] = Field(None, description="Status of the report, e.g. Final, Interim")

class TestItem(BaseModel):
    name: str = Field(..., description="Name of the medical test or parameter")
    value: str = Field(..., description="Measured value of the test parameter")
    unit: Optional[str] = Field(None, description="Measurement unit, e.g. g/dL, mg/dL")
    reference: Optional[str] = Field(None, description="Reference range or interval")
    status: str = Field(..., description="Classification of result, e.g. Normal, High, Low")

class MedicalSummary(BaseModel):
    abnormal_tests: List[str] = Field(default_factory=list, description="List of abnormal test names")
    critical_values: List[str] = Field(default_factory=list, description="List of test names with critical values")
    overall_summary: str = Field(..., description="Clinical summary and explanation of findings")

class MedicalReportResponse(BaseModel):
    patient: PatientInfo
    tests: List[TestItem]
    summary: MedicalSummary
    organ: str = Field(..., description="Affected organ: Heart, Liver, Kidneys, Lungs, Blood, Thyroid, Diabetes, General, etc.")
    risk_level: str = Field(..., description="Risk level: Low, Moderate, High, Critical")
    recommendations: List[str] = Field(default_factory=list, description="List of recommendations, diet plans, next steps")
    raw_text: Optional[str] = Field(None, description="Raw extracted text from the PDF report")
