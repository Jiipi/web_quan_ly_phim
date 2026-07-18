---
name: ocr-ai-pipeline
description: OCR and AI processing pipeline guide for DocuMind — Celery worker setup, OCRmyPDF/Tesseract/PaddleOCR integration, Google Document AI parsers, LLM structured extraction, embedding generation, quality gates, and cost optimization.
---

# OCR & AI Pipeline Skill

## Pipeline Overview

```
Upload → Validate → Store Original
  → [OCR Stage] Route by document type:
      ├─ Born-digital PDF → Extract text layer (skip OCR)
      ├─ Scanned PDF/Image → OCRmyPDF + Tesseract
      └─ Difficult docs → PaddleOCR or Google Document AI
  → Store PDF/A archive + page images
  → [Classification Stage]:
      ├─ Static rules (regex, keywords)
      ├─ ML classifier (from history)
      └─ LLM fallback
  → [Extraction Stage]:
      ├─ Specialized parser (Document AI Invoice/Form)
      └─ LLM structured output (schema-driven)
  → [Quality Gate]:
      ├─ High confidence → auto-file
      └─ Low confidence → review queue
  → [Indexing Stage]:
      ├─ FTS update (search_text + tsvector)
      ├─ Vector embedding (chunks → pgvector)
      └─ Entity indexing
  → [Post-processing]:
      ├─ Auto-tagging
      ├─ Reminder scheduling
      └─ User notification
```

## OCR Engine Router

```python
# core/ocr.py
class OCRRouter:
    """Routes documents to the best OCR engine based on type and quality."""

    async def process(self, document_id: str, file_path: Path) -> OCRResult:
        mime = detect_mime(file_path)

        if mime == "application/pdf" and has_text_layer(file_path):
            return await self._extract_existing_text(file_path)

        # Primary: OCRmyPDF + Tesseract
        result = await self._ocrmypdf(file_path)

        if result.confidence < 0.6:
            # Fallback: PaddleOCR for difficult documents
            paddle_result = await self._paddleocr(file_path)
            if paddle_result.confidence > result.confidence:
                result = paddle_result

        return result

    async def _ocrmypdf(self, file_path: Path) -> OCRResult:
        """
        OCRmyPDF modes:
        - skip: Skip pages that already have text
        - redo: Replace existing OCR text with better OCR
        - force: Rasterize everything and OCR from scratch
        """
        # ocrmypdf.ocr(input, output, language='vie+eng', skip_text=True,
        #              output_type='pdfa', optimize=1, deskew=True)
        pass

    async def _paddleocr(self, file_path: Path) -> OCRResult:
        """PaddleOCR for multi-language, dot-matrix, handwriting."""
        pass

    async def _document_ai(self, file_path: Path, parser: str) -> OCRResult:
        """Google Document AI for managed OCR + specialized parsing."""
        pass
```

## OCRmyPDF Configuration

```python
import ocrmypdf

# Standard scan processing
ocrmypdf.ocr(
    input_file="input.pdf",
    output_file="output.pdf",
    language="vie+eng",           # Vietnamese + English
    output_type="pdfa",           # Long-term archive format
    skip_text=True,               # Don't re-OCR born-digital pages
    deskew=True,                  # Fix tilted scans
    clean=True,                   # Clean up noise
    optimize=1,                   # Moderate optimization
    jpg_quality=85,
    png_quality=85,
    tesseract_timeout=120,        # Per-page timeout
    progress_bar=False,           # Disable in worker
)

# Force mode for badly OCR'd documents
ocrmypdf.ocr(
    input_file="input.pdf",
    output_file="output.pdf",
    language="vie+eng",
    force_ocr=True,               # Rasterize and re-OCR everything
    output_type="pdfa",
)
```

## Document Classification

### 3-Tier Classification Strategy

```python
class DocumentClassifier:
    async def classify(self, ocr_text: str, entities: dict) -> Classification:
        # Tier 1: Static rules (highest confidence)
        result = self._rule_based(ocr_text)
        if result and result.confidence > 0.9:
            return result

        # Tier 2: ML model (trained on user corrections)
        result = self._ml_classify(ocr_text)
        if result and result.confidence > 0.7:
            return result

        # Tier 3: LLM fallback (for novel documents)
        return await self._llm_classify(ocr_text)

    def _rule_based(self, text: str) -> Classification | None:
        """Keyword/regex patterns for common document types."""
        patterns = {
            "invoice": [r"hóa đơn", r"invoice", r"VAT", r"thuế"],
            "contract": [r"hợp đồng", r"contract", r"bên A.*bên B"],
            "warranty": [r"bảo hành", r"warranty", r"guarantee"],
            "receipt": [r"biên lai", r"receipt", r"phiếu thu"],
        }
        # Match against patterns
        pass
```

## AI Extraction (Structured Outputs)

### Schema-Driven Extraction

```python
# Always use structured outputs, never free-form "return JSON"

# For OpenAI
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
        {"role": "user", "content": f"Extract from:\n{ocr_text}"},
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "invoice_extraction",
            "schema": INVOICE_SCHEMA,
        }
    },
)

# For Gemini
import google.generativeai as genai
model = genai.GenerativeModel("gemini-2.0-flash")
response = model.generate_content(
    prompt,
    generation_config=genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=InvoiceSchema,
    ),
)
```

### Extraction Schemas by Document Type

```python
INVOICE_SCHEMA = {
    "type": "object",
    "properties": {
        "invoice_number": {"type": "string"},
        "invoice_date": {"type": "string", "format": "date"},
        "due_date": {"type": "string", "format": "date"},
        "vendor_name": {"type": "string"},
        "vendor_tax_id": {"type": "string"},
        "buyer_name": {"type": "string"},
        "subtotal": {"type": "number"},
        "tax_amount": {"type": "number"},
        "total_amount": {"type": "number"},
        "currency": {"type": "string", "default": "VND"},
        "line_items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "description": {"type": "string"},
                    "quantity": {"type": "number"},
                    "unit_price": {"type": "number"},
                    "amount": {"type": "number"},
                }
            }
        }
    },
    "required": ["invoice_number", "total_amount", "vendor_name"]
}

CONTRACT_SCHEMA = {
    "type": "object",
    "properties": {
        "contract_number": {"type": "string"},
        "contract_type": {"type": "string"},
        "party_a": {"type": "string"},
        "party_b": {"type": "string"},
        "effective_date": {"type": "string", "format": "date"},
        "expiry_date": {"type": "string", "format": "date"},
        "renewal_terms": {"type": "string"},
        "total_value": {"type": "number"},
        "key_terms": {"type": "array", "items": {"type": "string"}},
        "has_signature": {"type": "boolean"},
    }
}

WARRANTY_SCHEMA = {
    "type": "object",
    "properties": {
        "product_name": {"type": "string"},
        "brand": {"type": "string"},
        "serial_number": {"type": "string"},
        "purchase_date": {"type": "string", "format": "date"},
        "warranty_start": {"type": "string", "format": "date"},
        "warranty_end": {"type": "string", "format": "date"},
        "warranty_terms": {"type": "string"},
        "store_name": {"type": "string"},
    }
}
```

## Embedding & Vector Search

```python
# core/embedding.py
class EmbeddingService:
    CHUNK_SIZE = 512  # tokens
    CHUNK_OVERLAP = 50

    async def generate_embeddings(self, document_id: UUID, text: str):
        chunks = self._chunk_text(text)

        for i, chunk in enumerate(chunks):
            embedding = await self._embed(chunk)
            await self._store_chunk(document_id, i, chunk, embedding)

    def _chunk_text(self, text: str) -> list[str]:
        """Split text into overlapping chunks."""
        # Use tiktoken or sentence-based splitting
        pass

    async def _embed(self, text: str) -> list[float]:
        """Generate embedding vector."""
        # OpenAI: text-embedding-3-small (1536 dims)
        # Or local model via Ollama
        pass
```

## Quality Gates

```python
class QualityGate:
    OCR_CONFIDENCE_THRESHOLD = 0.7
    EXTRACTION_CONFIDENCE_THRESHOLD = 0.6

    async def evaluate(self, document: Document, ocr_result: OCRResult,
                       extraction: dict) -> QualityDecision:
        issues = []

        if ocr_result.confidence < self.OCR_CONFIDENCE_THRESHOLD:
            issues.append("low_ocr_confidence")

        if not extraction.get("required_fields_complete"):
            issues.append("missing_required_fields")

        # Cross-validation: compare parser vs LLM results
        if extraction.get("parser_result") and extraction.get("llm_result"):
            discrepancies = self._compare_results(
                extraction["parser_result"],
                extraction["llm_result"]
            )
            if discrepancies:
                issues.append("parser_llm_mismatch")

        if issues:
            return QualityDecision(
                action="review",
                needs_review=True,
                issues=issues,
            )

        return QualityDecision(action="auto_file", needs_review=False)
```

## Cost Optimization

1. **Parser first, LLM second**: Use Document AI parsers for invoices/forms before falling back to LLM
2. **Prompt caching**: Reuse system prompt prefix across requests (OpenAI auto-caches)
3. **Conditional re-processing**: Only regenerate embeddings when text or ACL changes
4. **Model selection**: Use smaller models (gpt-4o-mini, gemini-flash) for extraction, larger for complex analysis
5. **Batch processing**: Group embedding generation requests
6. **Cost logging**: Track model/provider/cost per document for governance
