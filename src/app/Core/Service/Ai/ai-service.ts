import { inject, Injectable } from '@angular/core';
import { AiIndexResponse, AiSearchRequest, AiSearchResponse, AiStatusResponse } from '../../Model/Ai/AiReponse';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeptManager } from '../../Constant/EndPoints';

@Injectable({
  providedIn: 'root',
})
export class AiService {
   private readonly http = inject(HttpClient);
 
  // ── Vérifier le statut du serveur IA ────────────────────────────────────────
  getStatus(): Observable<AiStatusResponse> {
    return this.http.get<AiStatusResponse>(DeptManager.AILllm.status);
  }
 
  // ── Déclencher l'indexation des PDFs du dossier docs/ ───────────────────────
  indexDocuments(): Observable<AiIndexResponse> {
    return this.http.post<AiIndexResponse>(DeptManager.AILllm.indexDocument, {});
  }
 
  // ── Envoyer une question et récupérer la réponse du LLM ──────────────────────
  query(question: string): Observable<AiSearchResponse> {
    const body: AiSearchRequest = { question };
    return this.http.post<AiSearchResponse>(DeptManager.AILllm.query, body);
  }
}
