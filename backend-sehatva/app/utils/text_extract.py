"""Best-effort local text extraction, used as a fallback / supplement to
Gemini's native multimodal reading of PDFs and images."""
import io

from pypdf import PdfReader


def extract_text_from_pdf(raw_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(raw_bytes))
        return "\n".join((page.extract_text() or "") for page in reader.pages).strip()
    except Exception:
        return ""


def extract_text_from_docx(raw_bytes: bytes) -> str:
    try:
        from docx import Document

        doc = Document(io.BytesIO(raw_bytes))
        return "\n".join(p.text for p in doc.paragraphs).strip()
    except Exception:
        return ""
