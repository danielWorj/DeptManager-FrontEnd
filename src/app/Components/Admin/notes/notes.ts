import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { EvaluationService } from '../../../Core/Service/Evaluation/evaluation-service';
import { Repartition } from '../../../Core/Model/Scolarite/Repartition';
import { Note } from '../../../Core/Model/Evaluation/Note';
import { TypeEvaluation } from '../../../Core/Model/Evaluation/TypeEvaluation';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';

@Component({
  selector: 'app-notes',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './notes.html',
  styleUrl: './notes.css',
})
export class NotesC {

  noteFb!: FormGroup;
  idEnseignant = signal<number>(0);

  // ── Instance Chart stockée pour éviter duplications et fuites mémoire (pattern etudiant-c)
  private barChartInstance: Chart | null = null;

  constructor(
    private fb: FormBuilder,
    private scolariteService: ScolariteService,
    private utilisateurService: UtilisateurService,
    private evaluationService: EvaluationService
  ) {
    this.noteFb = this.fb.group({
      id:             new FormControl(),
      note:           new FormControl(),
      repartition:    new FormControl(),
      typeEvaluation: new FormControl(),
      etudiant:       new FormControl(),
    });

    this.idEnseignant.set(2);
    this.loadPage();
  }

  // ── Destruction du chart quand le composant est détruit (pattern etudiant-c)
  ngOnDestroy(): void {
    this.barChartInstance?.destroy();
  }

  loadPage(): void {
    this.getAllRepartitionEnseignant(this.idEnseignant());
    this.getAllTypeEvalution();
  }

  // ─── Répartitions ────────────────────────────────────────────────────────────

  listRepartition = signal<Repartition[]>([]);

  getAllRepartitionEnseignant(id: number): void {
    this.scolariteService.getAllRepartitionByEnseignant(id).subscribe({
      next: (data: Repartition[]) => {
        this.listRepartition.set(data);
        console.log('repartitions :', data);
      },
      error: () => console.log('Fetch repartition : failed'),
    });
  }

  idRepartitionSelected = 0;
  repartitionSelected = signal<Repartition | null>(null);

  selectRepartition(event: Event): void {
    this.idRepartitionSelected = Number((event.target as HTMLSelectElement).value);
    this.repartitionSelected.set(
      this.listRepartition().find(r => r.id === this.idRepartitionSelected) ?? null
    );
    this.findDataForRepartition();
    this.getEtudiantByRepartition(this.idRepartitionSelected);
  }

  idFiliereInRepartition = signal<number>(0);
  idNiveauInRepartition  = signal<number>(0);
  idAnneeInRepartition   = signal<number>(0);

  findDataForRepartition(): void {
    const rep = this.repartitionSelected()!;
    this.idAnneeInRepartition.set(rep.semestre.anneeAcademique.id);
    this.idFiliereInRepartition.set(rep.filiere.id);
    this.idNiveauInRepartition.set(rep.niveau.id);
  }

  onRepartitionChange(event: Event): void {
    this.selectRepartition(event);
    this.getAllNoteByRepartition(this.idRepartitionSelected);
  }

  resetSelection(): void {
    this.idRepartitionSelected = 0;
    this.repartitionSelected.set(null);
    this.listNoteByRepartition.set([]);
    this.listEtudiantByRepartition.set([]);
    this.barChartInstance?.destroy();
    this.barChartInstance = null;
  }

  // ─── Notes ───────────────────────────────────────────────────────────────────

  listNoteByRepartition = signal<Note[]>([]);

  getAllNoteByRepartition(id: number): void {
    this.evaluationService.getAllNotebyRepartition(id).subscribe({
      next: (data: Note[]) => this.listNoteByRepartition.set(data),
      error: () => console.log('Fetch list note : failed'),
    });
  }

  // ─── Formulaire ──────────────────────────────────────────────────────────────

  prepareCreate(): void {
    this.noteFb.reset();
    this.noteFb.patchValue({ repartition: this.idRepartitionSelected });
  }

  prepareEdit(note: Note): void {
    this.noteFb.patchValue({
      id:             note.id,
      note:           note.note,
      repartition:    note.repartition?.id,
      typeEvaluation: note.typeEvaluation?.id,
      etudiant:       note.etudiant?.id,
    });
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  createNote(): void {
    const raw = this.noteFb.value;
    const payload = {
      id:             raw.id             ? Number(raw.id)             : null,
      note:           raw.note           !== null ? Number(raw.note)  : null,
      repartition:    raw.repartition    ? Number(raw.repartition)    : null,
      typeEvaluation: raw.typeEvaluation ? Number(raw.typeEvaluation) : null,
      etudiant:       raw.etudiant       ? Number(raw.etudiant)       : null,
    };
    console.log('payload envoyé :', payload);
    const formData = new FormData();
    formData.append('note', JSON.stringify(payload));
    this.evaluationService.createNote(formData).subscribe({
      next: (_data: ResponseServer) => {
        console.log('Note ajoutée avec succès');
        this.getAllNoteByRepartition(this.idRepartitionSelected);
        this.noteFb.reset();
        this.noteFb.patchValue({ repartition: this.idRepartitionSelected });
      },
      error: (err) => console.error('Erreur création note', err),
    });
  }

  deleteNote(id: number): void {
    if (!confirm('Confirmer la suppression de cette note ?')) return;
    // this.evaluationService.deleteNote(id).subscribe(...)
  }

  // ─── Étudiants par répartition ───────────────────────────────────────────────

  listEtudiantByRepartition = signal<Etudiant[]>([]);

  getEtudiantByRepartition(id: number): void {
    this.utilisateurService.getAllEtudiantByAnneeAndFiliereAndNiveau(
      this.idAnneeInRepartition(),
      this.idFiliereInRepartition(),
      this.idNiveauInRepartition()
    ).subscribe({
      next:  (data: Etudiant[]) => this.listEtudiantByRepartition.set(data),
      error: (err) => console.error('Erreur fetch etudiant', err),
    });
  }

  getSelectedMatricule(): string {
    const etudiantId = this.noteFb.get('etudiant')?.value;
    const etudiant = this.listEtudiantByRepartition().find(e => e.id === Number(etudiantId));
    return etudiant?.matricule ?? '';
  }

  // ─── Types d'évaluation ──────────────────────────────────────────────────────

  listTypeEvaluation = signal<TypeEvaluation[]>([]);

  getAllTypeEvalution(): void {
    this.evaluationService.getAllTypeEvaluation().subscribe({
      next:  (data: TypeEvaluation[]) => this.listTypeEvaluation.set(data),
      error: () => console.error('Fetch list typeEvaluation : failed'),
    });
  }

  // ─── Recherche ───────────────────────────────────────────────────────────────

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
  }

  // ─── Statistiques ────────────────────────────────────────────────────────────

  getMoyenneGenerale(): string {
    const notes = this.listNoteByRepartition();
    if (!notes.length) return '—';
    const sum = notes.reduce((acc, n) => acc + (n.note ?? 0), 0);
    return (sum / notes.length).toFixed(2);
  }

  getNotesByMention(type: 'ADMIS' | 'REFUSE'): number {
    return this.listNoteByRepartition().filter(n =>
      type === 'ADMIS' ? n.note >= 10 : n.note < 10
    ).length;
  }

  // ── Graphique distribution des notes ─────────────────────────────────────────

  /**
   * Construit les tableaux labels / data pour le bar chart.
   * Pattern identique à constructData() / constructDataNiveau() dans etudiant-c.
   *
   * On regroupe par tranches de 2 points (10 barres au total) pour que
   * le graphe reste lisible même avec une petite classe.
   */
  private barLabels: string[] = [];
  private barData:   number[] = [];

  constructDataDistribution(): void {
    const notes = this.listNoteByRepartition();

    const tranches = [
      { label: '0 – 1',   min: 0,  max: 2      },
      { label: '2 – 3',   min: 2,  max: 4      },
      { label: '4 – 5',   min: 4,  max: 6      },
      { label: '6 – 7',   min: 6,  max: 8      },
      { label: '8 – 9',   min: 8,  max: 10     },
      { label: '10 – 11', min: 10, max: 12     },
      { label: '12 – 13', min: 12, max: 14     },
      { label: '14 – 15', min: 14, max: 16     },
      { label: '16 – 17', min: 16, max: 18     },
      { label: '18 – 20', min: 18, max: 20.01  },
    ];

    this.barLabels = tranches.map(t => t.label);
    this.barData   = tranches.map(t =>
      notes.filter(n => n.note >= t.min && n.note < t.max).length
    );
  }

  /**
   * Dessine le bar chart.
   * Pattern identique à graphEvolutionEtudiantByFiliere() dans etudiant-c :
   *   1. Récupérer le canvas par id
   *   2. Détruire l'instance précédente
   *   3. Créer le nouveau Chart
   *
   * Couleurs : rouge pour les tranches < 10 (échec), vert pour >= 10 (réussite).
   */
  graphDistributionNotes(): void {
    const canvas = document.getElementById('barChartNotes') as HTMLCanvasElement | null;
    if (!canvas) { console.error('Canvas #barChartNotes introuvable'); return; }

    this.barChartInstance?.destroy();
    this.barChartInstance = null;

    const ctx = canvas.getContext('2d');
    if (!ctx) { console.error('Contexte 2D indisponible'); return; }

    // Dégradés vertical (même technique que etudiant-c)
    const gradientVert  = ctx.createLinearGradient(0, 0, 0, 380);
    gradientVert.addColorStop(0, 'rgba(40, 199, 111, 0.85)');
    gradientVert.addColorStop(1, 'rgba(40, 199, 111, 0.15)');

    const gradientRouge = ctx.createLinearGradient(0, 0, 0, 380);
    gradientRouge.addColorStop(0, 'rgba(234, 84, 85, 0.85)');
    gradientRouge.addColorStop(1, 'rgba(234, 84, 85, 0.15)');

    const backgrounds = this.barLabels.map(label =>
      Number(label.split('–')[0].trim()) >= 10 ? gradientVert : gradientRouge
    );
    const borders = this.barLabels.map(label =>
      Number(label.split('–')[0].trim()) >= 10 ? '#28c76f' : '#ea5455'
    );

    this.barChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.barLabels,
        datasets: [{
          label: "Nombre d'élèves",
          data:  this.barData,
          backgroundColor: backgrounds,
          borderColor:     borders,
          borderWidth:  2,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `Tranche : ${items[0].label} / 20`,
              label: (item) => {
                const val   = item.parsed.y as number;
                const total = this.listNoteByRepartition().length;
                const pct   = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                return ` ${val} élève(s)  —  ${pct} % de la classe`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Tranches de notes / 20',
              font:  { size: 12 },
              color: '#6e7891',
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Nombre d'élèves",
              font:  { size: 12 },
              color: '#6e7891',
            },
            ticks: {
              stepSize: 1,
              callback: (value) => Number.isInteger(value) ? value : null,
            },
          },
        },
      },
    });
  }

  /**
   * Point d'entrée appelé depuis le bouton accordion "Statistiques".
   * Pattern identique à getStats() dans etudiant-c.
   */
  getStats(): void {
    this.constructDataDistribution();
    this.graphDistributionNotes();
  }

  // ─── Helpers UI ──────────────────────────────────────────────────────────────

  getMentionLabel(note: number): string {
    if (note == null || isNaN(note)) return '';
    if (note >= 16) return 'Très Bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getMentionColor(note: number): string {
    if (note == null || isNaN(note)) return '';
    if (note >= 16) return '#065f46';
    if (note >= 14) return '#1d4ed8';
    if (note >= 12) return '#0369a1';
    if (note >= 10) return '#c2410c';
    return '#991b1b';
  }

  getNoteBadgeClass(note: number): string {
    if (note >= 16) return 'excellent';
    if (note >= 14) return 'bien';
    if (note >= 10) return 'passable';
    return 'insuffisant';
  }

  getEvalPillClass(intitule?: string): string {
    if (!intitule) return '';
    const i = intitule.toLowerCase();
    if (i.includes('continu') || i.includes('cc'))    return 'cc';
    if (i.includes('examen')  || i.includes('final')) return 'exam';
    if (i.includes('pratique') || i.includes('tp'))   return 'tp';
    return 'cc';
  }

  getAvatarColor(index: number): string {
    const colors = ['', 'green', 'orange', 'purple'];
    return colors[index % colors.length];
  }


  chargement = signal(false);
  erreur     = signal<string | null>(null);

  telecharger(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.evaluationService.telechargementByNote(this.idRepartitionSelected).subscribe({
      next: (blob: Blob) => {
        this.declencherTelechargement(blob);
        this.chargement.set(false);
      },
      error: (err) => {
        console.error('Erreur téléchargement PDF :', err);
        this.erreur.set('Impossible de générer la fiche de notes. Veuillez réessayer.');
        this.chargement.set(false);
      }
    });
  }


   private declencherTelechargement(blob: Blob): void {
    const url    = URL.createObjectURL(blob);
    const lien   = document.createElement('a');
    lien.href    = url;
    lien.download = "NOTES_"+this.repartitionSelected()?.matiere.intitule+"_"+this.repartitionSelected()?.filiere.abreviation+"_"+this.repartitionSelected()?.niveau.intitule+".pdf";
    lien.click();
    URL.revokeObjectURL(url); // libère la mémoire
  }
}