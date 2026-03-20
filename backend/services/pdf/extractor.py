"""
TalentIQ PDF Extraction Service
Handles all PDF parsing and text extraction logic.
"""
import io
import PyPDF2
from fastapi import HTTPException


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract raw text content from a PDF file."""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")
