from sentence_transformers import SentenceTransformer

_model = SentenceTransformer("intfloat/multilingual-e5-small")

def encode_text(text: str) -> list[float]:

    prepared_text = f"query: {text}"
    embedding = _model.encode(prepared_text, normalize_embeddings=True)
    return embedding.tolist()