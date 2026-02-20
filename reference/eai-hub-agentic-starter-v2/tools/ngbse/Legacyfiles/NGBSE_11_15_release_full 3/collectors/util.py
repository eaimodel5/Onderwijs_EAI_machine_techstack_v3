
import hashlib
def coc_sha256(m: str) -> str: return hashlib.sha256(m.encode("utf-8","ignore")).hexdigest()
