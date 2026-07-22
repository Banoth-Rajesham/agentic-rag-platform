import fitz

def extract_text_from_pdf(file_path: str):
    """
    Extracts text from a PDF file using PyMuPDF (fitz) and decodes PUA font mappings.
    """
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    doc.close()
    
    # Simple decode of PUA character mapping (common in some embedded PDFs)
    decoded = "".join(chr(ord(c) - 0xF000) if 0xF000 <= ord(c) <= 0xF8FF else c for c in text)
    return decoded.strip(), "PyMuPDF"