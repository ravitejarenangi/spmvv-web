"""FastAPI reranker sidecar using CrossEncoder for semantic reranking."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import CrossEncoder

MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"

model: CrossEncoder | None = None


class RerankRequest(BaseModel):
    query: str
    documents: list[str]
    top_n: int = 5


class RerankResult(BaseModel):
    index: int
    text: str
    score: float


class RerankResponse(BaseModel):
    results: list[RerankResult]


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    model = CrossEncoder(MODEL_NAME)
    yield


app = FastAPI(title="Reranker Sidecar", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/rerank", response_model=RerankResponse)
async def rerank(request: RerankRequest):
    if not request.documents:
        return RerankResponse(results=[])

    pairs = [[request.query, doc] for doc in request.documents]
    scores = model.predict(pairs)

    scored = [
        RerankResult(index=i, text=doc, score=float(score))
        for i, (doc, score) in enumerate(zip(request.documents, scores))
    ]
    scored.sort(key=lambda r: r.score, reverse=True)

    return RerankResponse(results=scored[: request.top_n])
