import { Component, NgModule, OnInit, signal } from '@angular/core';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { AnneeAcademique } from '../../../Core/Model/Scolarite/anneeacademique';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { Semestre } from '../../../Core/Model/Scolarite/Semestre';
import { Note } from '../../../Core/Model/Evaluation/Note';
import { EvaluationService } from '../../../Core/Service/Evaluation/evaluation-service';
import Chart from 'chart.js/auto';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-notes-e',
  imports: [NgClass],
  templateUrl: './notes-e.html',
  styleUrl: './notes-e.css',
})
export class NotesE implements OnInit {

  // ── ID ÉTUDIANT CONNECTÉ ──────────────────────────────────────────────────
  idEtudiant = signal<number>(0);

  constructor(
    private utilisateurService: UtilisateurService,
    private evaluationService: EvaluationService,
    private scolariteService: ScolariteService,
    private configService: ConfigService
  ) {
    this.idEtudiant.set(parseInt(localStorage.getItem('id')!));
    // this.idEtudiant.set(2);
  }

  ngOnInit(): void {
    this.getEtudiantById(this.idEtudiant());
    this.loadSemestres();
  }

  /** Enchaîne : années → année active → semestres du semestre actif */
  private loadSemestres(): void {
    this.configService.getAllAnneeAcademique().subscribe({
      next: (data: AnneeAcademique[]) => {
        this.listAnne.set(data);
        this.findAnneeActive();
        this.getSemestreActive();
      },
      error: () => console.log('Fetch annee acad : failed'),
    });
  }

  // ── ÉTUDIANT CONNECTÉ ─────────────────────────────────────────────────────
  etudiantConnected = signal<Etudiant | null>(null);

  getEtudiantById(id: number): void {
    this.utilisateurService.getEtudiantByID(id).subscribe({
      next: (data: Etudiant) => this.etudiantConnected.set(data),
      error: () => console.log('Fetch etudiant by id : failed'),
    });
  }

  // ── ANNÉES ACADÉMIQUES ────────────────────────────────────────────────────
  listAnne = signal<AnneeAcademique[]>([]);

  getAllAnneeAcad(): void {
    this.configService.getAllAnneeAcademique().subscribe({
      next: (data: AnneeAcademique[]) => this.listAnne.set(data),
      error: () => console.log('Fetch annee acad : failed'),
    });
  }

  anneeActive = signal<AnneeAcademique | null>(null);

  findAnneeActive(): void {
    this.anneeActive.set(this.listAnne().find(a => a.status === true) ?? null);
  }

  // ── SEMESTRES ACTIFS ──────────────────────────────────────────────────────
  listSemestre = signal<Semestre[]>([]);

  getSemestreActive(): void {
    this.scolariteService.getAllSemestre().subscribe({
      next: (data: Semestre[]) => {
        this.listSemestre.set(
          data.filter(s => s.anneeAcademique.id === this.anneeActive()?.id)
        );
      },
      error: () => console.log('Fetch semestre active : failed'),
    });
  }

  // ── NOTES ─────────────────────────────────────────────────────────────────
  /** Toutes les notes brutes chargées depuis l'API */
  private _allNotes: Note[] = [];

  /** Notes affichées (peut être filtrées par la recherche) */
  listNote = signal<Note[]>([]);

  /** Semestre actuellement sélectionné dans le select */
  idSemestreSelected: number = 0;

  getAllNoteByEtudiantAndSemestre(idEtudiant: number, idSemestre: number): void {
    this.evaluationService.getAllEtudiantAndSemestre(idEtudiant, idSemestre).subscribe({
      next: (data: Note[]) => {
        this._allNotes = data;
        this.listNote.set(data);
      },
      error: () => console.log('Fetch notes by etudiant and semestre : failed'),
    });
  }

  // ── GESTION DU SEMESTRE ───────────────────────────────────────────────────
  onSemestreChange(event: Event): void {
    const id = parseInt((event.target as HTMLSelectElement).value);
    this.idSemestreSelected = id;
    this._allNotes = [];
    this.listNote.set([]);
    if (id && id !== 0) {
      this.getAllNoteByEtudiantAndSemestre(this.idEtudiant(), id);
    }
  }

  resetSelection(): void {
    this.idSemestreSelected = 0;
    this._allNotes = [];
    this.listNote.set([]);
    this.destroyChart();
  }

  // ── RECHERCHE ─────────────────────────────────────────────────────────────
  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (!term) {
      this.listNote.set(this._allNotes);
      return;
    }
    this.listNote.set(
      this._allNotes.filter(n =>
        n.repartition?.matiere?.intitule?.toLowerCase().includes(term) ||
        n.repartition?.enseignant?.nom?.toLowerCase().includes(term) ||
        n.repartition?.enseignant?.prenom?.toLowerCase().includes(term)
      )
    );
  }

  // ── STATISTIQUES ─────────────────────────────────────────────────────────
  getMoyenneGenerale(): string {
    const notes = this.listNote();
    if (!notes.length) return '—';
    const sum = notes.reduce((acc, n) => acc + (n.note ?? 0), 0);
    return (sum / notes.length).toFixed(2);
  }

  getNotesByMention(mention: 'ADMIS' | 'REFUSE'): number {
    return this.listNote().filter(n =>
      mention === 'ADMIS' ? n.note >= 10 : n.note < 10
    ).length;
  }

  // ── MENTION ───────────────────────────────────────────────────────────────
  getMentionLabel(note: number | null | undefined): string {
    if (note == null) return '—';
    if (note >= 16) return 'Très Bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getMentionColor(note: number | null | undefined): string {
    if (note == null) return '#6b7280';
    if (note >= 16) return '#059669';
    if (note >= 14) return '#16a34a';
    if (note >= 12) return '#65a30d';
    if (note >= 10) return '#ca8a04';
    return '#dc2626';
  }

  // ── CLASSES CSS ───────────────────────────────────────────────────────────
  getNoteBadgeClass(note: number | null | undefined): string {
    if (note == null) return '';
    if (note >= 14) return 'nm-note-success';
    if (note >= 10) return 'nm-note-warning';
    return 'nm-note-danger';
  }

  getEvalPillClass(intitule: string | null | undefined): string {
    if (!intitule) return '';
    const val = intitule.toLowerCase();
    if (val.includes('examen') || val.includes('final')) return 'nm-pill-blue';
    if (val.includes('cc') || val.includes('contrôle') || val.includes('controle')) return 'nm-pill-orange';
    if (val.includes('tp') || val.includes('pratique')) return 'nm-pill-green';
    return 'nm-pill-default';
  }

  private readonly AVATAR_COLORS = [
    'nm-avatar-blue', 'nm-avatar-green', 'nm-avatar-purple',
    'nm-avatar-orange', 'nm-avatar-pink',
  ];

  getAvatarColor(index: number): string {
    return this.AVATAR_COLORS[index % this.AVATAR_COLORS.length];
  }

  // ── GRAPHIQUE ─────────────────────────────────────────────────────────────
  private chartInstance: Chart | null = null;

  getStats(): void {
    // Délai pour laisser l'accordéon s'ouvrir avant de dessiner
    setTimeout(() => {
      this.destroyChart();
      const notes = this.listNote();
      if (!notes.length) return;

      const labels = notes.map(n => n.repartition?.matiere?.intitule ?? '?');
      const values = notes.map(n => n.note ?? 0);
      const colors = values.map(v => (v >= 10 ? '#28c76f' : '#ea5455'));

      const canvas = document.getElementById('barChartNotes') as HTMLCanvasElement;
      if (!canvas) return;

      this.chartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Note / 20',
            data: values,
            backgroundColor: colors,
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              min: 0,
              max: 20,
              ticks: { stepSize: 2 },
              grid: { color: 'rgba(0,0,0,.06)' },
            },
            x: { grid: { display: false } },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.parsed.y} / 20  —  ${this.getMentionLabel(ctx.parsed.y)}`,
              },
            },
          },
        },
      });
    }, 300);
  }

  private destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  // ── TÉLÉCHARGEMENT PDF ────────────────────────────────────────────────────
  telecharger(): void {
    window.print();
  }
}