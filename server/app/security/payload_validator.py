import re
from typing import Tuple, Optional
from ..schemas import AgentActRequest

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", re.IGNORECASE)
PHONE_REGEX = re.compile(r"(?:\+91|0)?[6-9]\d{9}")
PAN_REGEX = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b")
AADHAAR_REGEX = re.compile(r"\b\d{4}\s\d{4}\s\d{4}\b")
CARD_REGEX = re.compile(r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b")

def luhn_check(card_number_str: str) -> bool:
    digits = [int(d) for d in re.sub(r"\D", "", card_number_str)]
    if len(digits) < 13:
        return False
    checksum = 0
    reverse_digits = digits[::-1]
    for i, digit in enumerate(reverse_digits):
        if i % 2 == 1:
            doubled = digit * 2
            checksum += doubled - 9 if doubled > 9 else doubled
        else:
            checksum += digit
    return checksum % 10 == 0

def validate_outgoing_payload_safety(request: AgentActRequest) -> Tuple[bool, Optional[str]]:
    """
    Fail-closed validator verifying that NO unredacted PII reached the server payload.
    Returns (is_safe, error_message).
    """
    # Verify metadata labels
    for element in request.ui_metadata:
        label = element.label or ""
        
        # Check email
        if EMAIL_REGEX.search(label):
            return False, f"PII Leak: Email detected in element '{element.element_id}' label: '{label}'"
            
        # Check phone
        if PHONE_REGEX.search(label):
            return False, f"PII Leak: Phone number detected in element '{element.element_id}' label: '{label}'"
            
        # Check Indian PAN
        if PAN_REGEX.search(label):
            return False, f"PII Leak: Indian PAN pattern detected in element '{element.element_id}' label: '{label}'"
            
        # Check Aadhaar
        if AADHAAR_REGEX.search(label):
            return False, f"PII Leak: Aadhaar number detected in element '{element.element_id}' label: '{label}'"
            
        # Check Card
        card_match = CARD_REGEX.search(label)
        if card_match and luhn_check(card_match.group(0)):
            return False, f"PII Leak: Luhn-valid Credit Card detected in element '{element.element_id}' label: '{label}'"

    return True, None
