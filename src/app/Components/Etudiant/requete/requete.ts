import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule }         from '@angular/common';
import { ResponseServer }       from '../../../Core/Model/Server/ResponseServer';
import { PieceJointeRequete }   from '../../../Core/Model/Requete/PieceJointeRequete';
import { Etudiant }             from '../../../Core/Model/Utilisateur/Etudiant';
import { MotifRequete }         from '../../../Core/Model/Requete/MotifRequete';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScolariteService }     from '../../../Core/Service/Scolarite/scolarite-service';
import { UtilisateurService }   from '../../../Core/Service/Utilisateur/utilisateur-service';
import { Requete }              from '../../../Core/Model/Requete/Requete';

@Component({
  selector: 'app-requete',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './requete.html',
  styleUrl: './requete.css',
})
export class RequeteE {

  private fb                 = inject(FormBuilder);
  private scolariteService   = inject(ScolariteService);
  private utilisateurService = inject(UtilisateurService);

  // ── Identité étudiant connecté ────────────────────────────────────────────
  idEtudiant = signal<number>(0);

  constructor() {
    this.idEtudiant.set(parseInt(localStorage.getItem('id')!) ?? 0);
    this.buildForm();
    this.loadPage();
  }

  loadPage(): void {
    this.getAllRequeteByEtudiant();
    this.getAllMotifRequete();
  }

  loadDataRPage(): void {
    this.getAllRequeteByEtudiant();
  }

  // ── Données ───────────────────────────────────────────────────────────────
  /** Source de vérité chargée depuis l'API */
  listRequeteSave  = signal<Requete[]>([]);
  listMotifRequete = signal<MotifRequete[]>([]);

  // ── État UI ───────────────────────────────────────────────────────────────
  requeteSelected = signal<Requete | null>(null);
  deleteTargetId  = signal<number | null>(null);
  selectedFiles   = signal<File[]>([]);
  filterPanelOpen = signal<boolean>(true);

  /** Toast : { message, type: 'success'|'danger'|'info'|'warning' } */
  toast = signal<{ message: string; type: string } | null>(null);

  // ── Formulaire ────────────────────────────────────────────────────────────
  requeteFb!: FormGroup;

  private buildForm(): void {
    this.requeteFb = this.fb.group({
      id:           new FormControl<number | null>(null),
      description:  new FormControl<string>('', [Validators.required, Validators.minLength(10)]),
      motifRequete: new FormControl<number | null>(null, Validators.required),
      etudiant:     new FormControl<number | null>(null, Validators.required),
    });
  }

  // ── API : Requêtes ────────────────────────────────────────────────────────
  getAllRequeteByEtudiant(): void {
    this.scolariteService.getAllRequeteByEtudiant(this.idEtudiant()).subscribe({
      next: (data: Requete[]) => {
        this.listRequeteSave.set(data);
        // On recalcule les compteurs dès que les données arrivent
        this.countRequeteByStatut();
      },
      error: (err) => console.error('Erreur fetch requêtes étudiant :', err),
    });
  }

  createRequete(): void {
    const formData = new FormData();
    formData.append('requete', JSON.stringify(this.requeteFb.value));
    this.selectedFiles().forEach(file => {
      formData.append('pieceJointes', file, file.name);
    });

    this.scolariteService.createRequete(formData).subscribe({
      next: (response: ResponseServer) => {
        if (response.status) {
          this.showToast('Requête soumise avec succès !', 'success');
          this.loadDataRPage();
          this.closeModal('createRequeteModal');
          this.resetCreateForm();
        } else {
          this.showToast(response.message ?? 'Erreur lors de la création.', 'danger');
        }
      },
      error: () => {
        this.showToast('Erreur serveur lors de la création.', 'danger');
      },
    });
  }

  deleteRequete(): void {
    const id = this.deleteTargetId();
    if (id === null) return;

    this.scolariteService.deleteRequete(id).subscribe({
      next: (response: ResponseServer) => {
        if (response.status) {
          this.listRequeteSave.update(list => list.filter(r => r.id !== id));
          this.showToast(`Requête #${id} supprimée.`, 'danger');
          this.closeModal('deleteRequeteModal');
          this.deleteTargetId.set(null);
          this.countRequeteByStatut();
        } else {
          this.showToast(response.message ?? 'Erreur lors de la suppression.', 'danger');
        }
      },
      error: () => {
        this.showToast('Erreur serveur lors de la suppression.', 'danger');
      },
    });
  }

  getAllMotifRequete(): void {
    this.scolariteService.getAllMotifRequete().subscribe({
      next:  (data: MotifRequete[]) => this.listMotifRequete.set(data),
      error: (err) => console.error('Erreur fetch motifs :', err),
    });
  }

  // ── Pièces jointes ────────────────────────────────────────────────────────
  listPieceJointe = signal<PieceJointeRequete[]>([]);

  getAllPieceJointeByRequest(id: number): void {
    this.scolariteService.getAllPieceJointeByRequete(id).subscribe({
      next:  (data: PieceJointeRequete[]) => this.listPieceJointe.set(data),
      error: (err) => console.error('Erreur fetch pièces jointes :', err),
    });
  }

  // ── Compteurs par statut ──────────────────────────────────────────────────
  numberRequeteEnAttente = signal<number>(0);
  numberRequeteEnTraite  = signal<number>(0);
  numberRequeteEnRejete  = signal<number>(0);

  countRequeteByStatut(): void {
    // ✅ Correction : itérer listRequeteSave() (données réelles) et non listRequete()
    let att = 0, trait = 0, rej = 0;
    for (const r of this.listRequeteSave()) {
      if (r.statutRequete.id === 1) att++;
      if (r.statutRequete.id === 2) trait++;
      if (r.statutRequete.id === 3) rej++;
    }
    this.numberRequeteEnAttente.set(att);
    this.numberRequeteEnTraite.set(trait);
    this.numberRequeteEnRejete.set(rej);
  }

  // ── Actions UI ────────────────────────────────────────────────────────────
  selectRequete(r: Requete): void {
    this.requeteSelected.set(r);
    this.getAllPieceJointeByRequest(r.id);
  }

  openDeleteConfirm(id: number): void {
    this.deleteTargetId.set(id);
  }

  resetCreateForm(): void {
    this.requeteFb.reset();
    this.selectedFiles.set([]);
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen.update(v => !v);
  }

  // ── Pièces jointes (sélection / drag-drop) ────────────────────────────────
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.addFiles(Array.from(input.files));
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private addFiles(files: File[]): void {
    this.selectedFiles.update(existing => {
      const news = files.filter(f => !existing.some(e => e.name === f.name));
      return [...existing, ...news];
    });
  }

  removeFile(name: string): void {
    this.selectedFiles.update(files => files.filter(f => f.name !== name));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getInitials(nom?: string, prenom?: string): string {
    return [(prenom ?? '')[0], (nom ?? '')[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase();
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.requeteFb.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info'): void {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3500);
  }

  // ── Bootstrap Modal ───────────────────────────────────────────────────────
  openModal(id: string): void {
    const el = document.getElementById(id);
    if (el) (window as any).bootstrap?.Modal?.getOrCreateInstance(el).show();
  }

  closeModal(id: string): void {
    const el = document.getElementById(id);
    if (el) (window as any).bootstrap?.Modal?.getInstance(el)?.hide();
  }

  openCreateModal(): void {
    this.resetCreateForm();
    this.openModal('createRequeteModal');
  }

  openViewModal(r: Requete): void {
    this.selectRequete(r);
    this.openModal('viewRequeteModal');
  }

  openDeleteModal(id: number): void {
    this.openDeleteConfirm(id);
    this.openModal('deleteRequeteModal');
  }
}