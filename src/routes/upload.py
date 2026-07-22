from fastapi import APIRouter, UploadFile, File, HTTPException
from src.services.pdf_service import extract_text_from_pdf
from src.schemas.report_schema import MedicalReportResponse
import os
import shutil


router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/", response_model=MedicalReportResponse)
async def upload_report(file: UploadFile = File(...)):

    allowed_extensions = [".pdf", ".png", ".jpg", ".jpeg"]

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, PNG, JPG and JPEG files are allowed."
        )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    from src.services.ocr_service import extract_text_from_image
    from src.agent.medical_agent import run_medical_agent

    extracted_text = ""
    method = ""
    
    if extension == ".pdf":
        extracted_text, method = extract_text_from_pdf(file_path)
    elif extension in [".png", ".jpg", ".jpeg"]:
        extracted_text = extract_text_from_image(file_path)
        method = "EasyOCR"
        
    with open("output.txt", "w", encoding="utf-8") as f:
        f.write(extracted_text)
    print("Text saved to output.txt")    
       
    # Run structured parsing through local RAG / Agent pipeline
    structured_data = run_medical_agent(extracted_text)
    
    return structured_data