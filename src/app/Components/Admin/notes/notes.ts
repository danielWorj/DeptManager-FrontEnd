import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
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
      typeEvaluation: new FormControl(),   // ← faute de frappe corrigée : tyeEvaluation → typeEvaluation
      etudiant:       new FormControl(),
    });

    this.idEnseignant.set(2);
    this.loadPage();
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

  idFiliereInRepartition  = signal<number>(0);
  idNiveauInRepartition   = signal<number>(0);
  idAnneeInRepartition    = signal<number>(0);

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
  }

  // ─── Notes ───────────────────────────────────────────────────────────────────

  listNoteByRepartition = signal<Note[]>([]);

  getAllNoteByRepartition(id: number): void {
    this.evaluationService.getAllNotebyRepartition(id).subscribe({
      next: (data: Note[]) => this.listNoteByRepartition.set(data),
      error: () => console.log('Fetch list note : failed'),
    });
  }

  // ─── Préparer le formulaire (même approche que etudiant-c) ───────────────────

  /**
   * Appelé depuis le bouton "Nouvelle note".
   * On pré-remplit uniquement la répartition (id string depuis le DOM, cohérent
   * avec l'approche etudiant-c où tous les selects stockent des ids).
   */
  prepareCreate(): void {
    this.noteFb.reset();
    this.noteFb.patchValue({
      repartition: this.idRepartitionSelected  // number → converti en string par le select, cohérent
    });
  }

  /**
   * Appelé depuis le bouton "Modifier" du tableau.
   * On stocke les IDs dans le formulaire, comme etudiant-c le fait avec
   * etudiantForm.patchValue(e) qui stocke les valeurs brutes.
   */
  prepareEdit(note: Note): void {
    this.noteFb.patchValue({
      id:             note.id,
      note:           note.note,
      repartition:    note.repartition?.id,
      typeEvaluation: note.typeEvaluation?.id,  // ← ID brut, comme dans etudiant-c
      etudiant:       note.etudiant?.id,         // ← ID brut, comme dans etudiant-c
    });
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  /**
   * Même pattern que createEtudiant() :
   * - On lit form.value (les selects ont déjà stocké des ids numériques sous forme de string)
   * - On parse explicitement les champs select en Number avant d'envoyer
   *   car le DOM retourne toujours des strings depuis les <option value="{{id}}">
   * - On sérialise en JSON dans un FormData
   */
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
    console.log('annee',    this.idAnneeInRepartition());
    console.log('filiere',  this.idFiliereInRepartition());
    console.log('niveau',   this.idNiveauInRepartition());

    this.utilisateurService.getAllEtudiantByAnneeAndFiliereAndNiveau(
      this.idAnneeInRepartition(),
      this.idFiliereInRepartition(),
      this.idNiveauInRepartition()
    ).subscribe({
      next:  (data: Etudiant[]) => this.listEtudiantByRepartition.set(data),
      error: (err) => console.error('Erreur fetch etudiant by annee, filiere et niveau', err),
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
    // Filtrer listNoteByRepartition selon term (nom, matricule…)
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
    if (i.includes('continu') || i.includes('cc'))      return 'cc';
    if (i.includes('examen')  || i.includes('final'))   return 'exam';
    if (i.includes('pratique') || i.includes('tp'))     return 'tp';
    return 'cc';
  }

  getAvatarColor(index: number): string {
    const colors = ['', 'green', 'orange', 'purple'];
    return colors[index % colors.length];
  }
}