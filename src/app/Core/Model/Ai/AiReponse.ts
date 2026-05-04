// ─── Modèles de données pour l'API RAG (app_groq.py) ─────────────────────────

/**
 * Source d'un chunk retourné par /api/query
 */
export interface AiSearchSource {
  source: string;   // nom du fichier PDF
  page: number;     // numéro de page
  score: number;    // score de similarité cosinus (0 → 1)
}

/**
 * Réponse complète de POST /api/query
 */
export interface AiSearchResponse {
  answer: string;           // synthèse générée par le LLM
  sources: AiSearchSource[]; // chunks les plus pertinents
}

/**
 * Réponse de GET /api/status
 */
export interface AiStatusResponse {
  ollama_connected: boolean;   // connexion Groq OK
  chat_model: string;          // ex. "llama-3.3-70b-versatile"
  embed_model: string;         // ex. "all-MiniLM-L6-v2 (local)"
  docs_found: string[];        // liste des PDFs dans docs/
  chunks_indexed: number;      // nombre de chunks en mémoire
}

/**
 * Réponse de POST /api/index
 */
export interface AiIndexResponse {
  status: string;          // "ok"
  indexed_files: string[]; // fichiers indexés
  total_chunks: number;    // total de chunks créés
}

/**
 * Corps de la requête POST /api/query
 */
export interface AiSearchRequest {
  question: string;
}