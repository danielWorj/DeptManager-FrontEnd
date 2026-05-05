import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { AiService } from '../../../Core/Service/Ai/ai-service';
import { AiSearchResponse, AiSearchSource, AiStatusResponse } from '../../../Core/Model/Ai/AiReponse';


// Suggestions pré-définies (peuvent être chargées depuis l'API)
export interface SuggestionCard {
  icon: string;
  dept: string;
  label: string;
  question: string;
}

@Component({
  selector: 'app-ai-search',
  standalone: true,
  templateUrl: './page-llm.html',
  styleUrls: ['./page-llm.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLlm implements OnInit,AfterViewChecked {
  private readonly searchService = inject(AiService);
 
  @ViewChild('chatViewport') chatViewport!: ElementRef<HTMLDivElement>;
 
  // ── Signaux d'état ────────────────────────────────────────────────────────
  readonly searchQuery    = signal<string>('');
  readonly selectedDept   = signal<string>('Tous');
  readonly searchResult   = signal<AiSearchResponse | null>(null);
  readonly isLoading      = signal<boolean>(false);
  readonly isIndexing     = signal<boolean>(false);
  readonly loadingMessage = signal<string>('Consultation de la base documentaire…');
  readonly errorMessage   = signal<string | null>(null);
  readonly serverStatus   = signal<AiStatusResponse | null>(null);
  readonly showResults    = signal<boolean>(false);
 
  private shouldScrollToBottom = false;
 
  // ── Signaux calculés ──────────────────────────────────────────────────────
  readonly hasResults = computed(
    () => this.searchResult() !== null && !this.isLoading()
  );
 
  readonly sourcesWithScore = computed<AiSearchSource[]>(() => {
    const r = this.searchResult();
    if (!r) return [];
    return [...r.sources].sort((a, b) => b.score - a.score);
  });
 
  readonly isServerReady = computed(
    () => this.serverStatus()?.ollama_connected === true
  );
 
  readonly chunksIndexed = computed(
    () => this.serverStatus()?.chunks_indexed ?? 0
  );
 
  // ── Données statiques ─────────────────────────────────────────────────────
  readonly departments: string[] = ['Tous', 'GEI', 'GMP', 'ESB', 'IG', 'TC', 'GC'];
 
  readonly suggestions: SuggestionCard[] = [
    {
      icon: '⚡',
      dept: 'GEI',
      label: 'Génie Électrique (GEI)',
      question: 'Quelles recherches ont été menées sur les systèmes d\'énergie renouvelable au Cameroun ?',
    },
    {
      icon: '🔬',
      dept: 'ESB',
      label: 'Sciences de Base (ESB)',
      question: 'Quelles sont les avancées en mathématiques appliquées et sciences fondamentales ?',
    },
    {
      icon: '🤖',
      dept: 'IG',
      label: 'Informatique (IG)',
      question: 'Quels projets d\'intelligence artificielle et de machine learning ont été développés ?',
    },
    {
      icon: '🌱',
      dept: 'GEI',
      label: 'Génie Électrique (GEI)',
      question: 'Quelles études sur l\'efficacité énergétique des bâtiments ont été réalisées ?',
    },
  ];
 
  readonly loadingMessages: string[] = [
    'Consultation de la base documentaire…',
    'Analyse sémantique de votre question…',
    'Identification des documents pertinents…',
    'Génération de la synthèse par le LLM…',
  ];
 
  private loadingInterval?: ReturnType<typeof setInterval>;
 
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.checkServerStatus();
  }
 
  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }
 
  // ── Actions ───────────────────────────────────────────────────────────────
  checkServerStatus(): void {
    this.searchService.getStatus().subscribe({
      next: (status) => this.serverStatus.set(status),
      error: () => this.serverStatus.set(null),
    });
  }
 
  onEnterKey(event: KeyboardEvent): void {
    if (event.shiftKey) return; // Shift+Enter → nouvelle ligne
    event.preventDefault();
    this.doSearch();
  }
 
  onQueryInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.searchQuery.set(target.value);
    // Auto-resize textarea
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 140) + 'px';
  }
 
  selectDept(dept: string): void {
    this.selectedDept.set(dept);
  }
 
  applySuggestion(card: SuggestionCard): void {
    this.selectDept(card.dept);
    this.searchQuery.set(card.question);
    this.doSearch();
  }
 
  doSearch(): void {
    const q = this.searchQuery().trim();
    if (!q || this.chunksIndexed() === 0) return;
 
    this.isLoading.set(true);
    this.showResults.set(false);
    this.errorMessage.set(null);
    this.searchResult.set(null);
    this.shouldScrollToBottom = true;
 
    let idx = 0;
    this.loadingMessage.set(this.loadingMessages[0]);
    this.loadingInterval = setInterval(() => {
      idx = (idx + 1) % this.loadingMessages.length;
      this.loadingMessage.set(this.loadingMessages[idx]);
    }, 900);
 
    this.searchService.query(q).subscribe({
      next: (response) => {
        this.clearLoadingInterval();
        this.searchResult.set(response);
        this.isLoading.set(false);
        this.showResults.set(true);
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        this.clearLoadingInterval();
        this.isLoading.set(false);
        const msg =
          err?.error?.error ??
          'Une erreur est survenue. Vérifiez que le serveur IA est démarré.';
        this.errorMessage.set(msg);
        this.shouldScrollToBottom = true;
      },
    });
  }
 
  indexDocuments(): void {
    this.isIndexing.set(true);
    this.errorMessage.set(null);
 
    this.searchService.indexDocuments().subscribe({
      next: () => {
        this.isIndexing.set(false);
        this.checkServerStatus();
      },
      error: (err) => {
        this.isIndexing.set(false);
        const msg =
          err?.error?.error ??
          'Échec de l\'indexation. Vérifiez que des PDFs sont présents dans le dossier docs/.';
        this.errorMessage.set(msg);
      },
    });
  }
 
  formatScore(score: number): string {
    return `${Math.round(score * 100)}%`;
  }
 
  trackBySource(index: number, source: AiSearchSource): string {
    return `${source.source}-${source.page}`;
  }
 
  private scrollToBottom(): void {
    try {
      const el = this.chatViewport?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* ignore */ }
  }
 
  private clearLoadingInterval(): void {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = undefined;
    }
  }

  
}