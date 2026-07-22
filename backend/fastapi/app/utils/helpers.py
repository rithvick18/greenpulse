import re


def sanitize_string(value: str) -> str:
    """
    Sanitizes input text by removing potentially unsafe characters.
    """
    if not value:
        return ""
    return re.sub(r"[^\w\s\-\.\:\/]", "", value).strip()
