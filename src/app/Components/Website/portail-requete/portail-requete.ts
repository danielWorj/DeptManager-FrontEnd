import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Requete } from '../../../Core/Model/Requete/Requete';
import { MotifRequete } from '../../../Core/Model/Requete/MotifRequete';
import { PieceJointeRequete } from '../../../Core/Model/Requete/PieceJointeRequete';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';

@Component({
  selector: 'app-portail-requete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './portail-requete.html',
  styleUrl: './portail-requete.css',
})
export class PortailRequete implements OnInit {

  private fb                 = inject(FormBuilder);
  private scolariteService   = inject(ScolariteService);
  private utilisateurService = inject(UtilisateurService);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.buildForm();
  }

  ngOnInit(): void {
    this.loadPage();
  }

  // ─── Chargement ──────────────────────────────────────────────────────────

  loadPage(): void {
    this.getAllRequete();
    this.getAllMotifRequete();
    this.getAllEtudiant();
  }

  // ─── États ───────────────────────────────────────────────────────────────

  loadingRequetes = signal(true);

  listRequeteSave  = signal<Requete[]>([]);
  listMotifRequete = signal<MotifRequete[]>([]);
  listEtudiant     = signal<Etudiant[]>([]);
  listPieceJointe  = signal<PieceJointeRequete[]>([]);

  requeteSelected = signal<Requete | null>(null);
  deleteTargetId  = signal<number | null>(null);
  selectedFiles   = signal<File[]>([]);
  activeTab       = signal<'toutes' | 'attente' | 'traitees' | 'rejetees'>('toutes');

  toast = signal<{ message: string; type: 'success' | 'danger' | 'info' | 'warning' } | null>(null);

  // ─── Computed ────────────────────────────────────────────────────────────

  requetesEnAttente = computed(() =>
    this.listRequeteSave().filter(r => r.statutRequete?.id === 1)
  );

  requetesTraitees = computed(() =>
    this.listRequeteSave().filter(r => r.statutRequete?.id === 2)
  );

  requetesRejetees = computed(() =>
    this.listRequeteSave().filter(r => r.statutRequete?.id === 3)
  );

  listRequeteFiltered = computed(() => {
    const tab = this.activeTab();
    switch (tab) {
      case 'attente':  return this.requetesEnAttente();
      case 'traitees': return this.requetesTraitees();
      case 'rejetees': return this.requetesRejetees();
      default:         return this.listRequeteSave();
    }
  });

  // ─── Formulaire ──────────────────────────────────────────────────────────

  requeteFb!: FormGroup;

  private buildForm(): void {
    this.requeteFb = this.fb.group({
      id:           new FormControl<number | null>(null),
      description:  new FormControl<string>('', [Validators.required, Validators.minLength(10)]),
      motifRequete: new FormControl<number | null>(null, Validators.required),
      etudiant:     new FormControl<number | null>(null, Validators.required),
    });
  }

  isFieldInvalid(name: string): boolean {
    const c = this.requeteFb.get(name);
    return !!(c && c.invalid && c.touched);
  }

  resetForm(): void {
    this.requeteFb.reset();
    this.selectedFiles.set([]);
  }

  // ─── API ─────────────────────────────────────────────────────────────────

  getAllRequete(): void {
    this.loadingRequetes.set(true);
    this.scolariteService.getAllRequete().subscribe({
      next: (data: Requete[]) => {
        this.listRequeteSave.set(data);
        this.loadingRequetes.set(false);
      },
      error: (err) => {
        console.error('Erreur fetch requêtes :', err);
        this.loadingRequetes.set(false);
      },
    });
  }

  getAllMotifRequete(): void {
    this.scolariteService.getAllMotifRequete().subscribe({
      next: (data: MotifRequete[]) => this.listMotifRequete.set(data),
      error: (err) => console.error('Erreur fetch motifs :', err),
    });
  }

  getAllEtudiant(): void {
    this.utilisateurService.getAllEtudiant().subscribe({
      next: (data: Etudiant[]) => this.listEtudiant.set(data),
      error: (err) => console.error('Erreur fetch étudiants :', err),
    });
  }

  getAllPieceJointe(id: number): void {
    this.scolariteService.getAllPieceJointeByRequete(id).subscribe({
      next: (data: PieceJointeRequete[]) => this.listPieceJointe.set(data),
      error: (err) => console.error('Erreur fetch pièces jointes :', err),
    });
  }

  createRequete(): void {
    if (this.requeteFb.invalid) {
      this.requeteFb.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('requete', JSON.stringify(this.requeteFb.value));
    this.selectedFiles().forEach(f => formData.append('pieceJointes', f, f.name));

    this.scolariteService.createRequete(formData).subscribe({
      next: (response: ResponseServer) => {
        if (response.status) {
          this.showToast('Requête soumise avec succès !', 'success');
          this.getAllRequete();
          this.closeModal('newRequeteModal');
          this.resetForm();
        } else {
          this.showToast(response.message ?? 'Erreur lors de la soumission.', 'danger');
        }
      },
      error: () => this.showToast('Erreur serveur. Veuillez réessayer.', 'danger'),
    });
  }

  deleteRequete(): void {
    const id = this.deleteTargetId();
    if (id === null) return;

    this.scolariteService.deleteRequete(id).subscribe({
      next: (response: ResponseServer) => {
        if (response.status) {
          this.listRequeteSave.update(list => list.filter(r => r.id !== id));
          this.showToast('Requête annulée avec succès.', 'success');
          this.closeModal('deleteModal');
          this.deleteTargetId.set(null);
        } else {
          this.showToast(response.message ?? 'Erreur lors de l\'annulation.', 'danger');
        }
      },
      error: () => this.showToast('Erreur serveur. Veuillez réessayer.', 'danger'),
    });
  }

  // ─── Actions UI ──────────────────────────────────────────────────────────

  setTab(tab: 'toutes' | 'attente' | 'traitees' | 'rejetees'): void {
    this.activeTab.set(tab);
  }

  openDetail(r: Requete): void {
    this.requeteSelected.set(r);
    this.listPieceJointe.set([]);
    this.getAllPieceJointe(r.id);
    this.openModal('detailModal');
  }

  openDeleteModal(id: number): void {
    this.deleteTargetId.set(id);
    this.openModal('deleteModal');
  }

  openNewModal(): void {
    this.resetForm();
    this.openModal('newRequeteModal');
  }

  // ─── Pièces jointes ──────────────────────────────────────────────────────

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.addFiles(Array.from(input.files));
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) this.addFiles(Array.from(event.dataTransfer.files));
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); }

  private addFiles(files: File[]): void {
    this.selectedFiles.update(existing => {
      const news = files.filter(f => !existing.some(e => e.name === f.name));
      return [...existing, ...news];
    });
  }

  removeFile(name: string): void {
    this.selectedFiles.update(files => files.filter(f => f.name !== name));
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  getInitials(nom?: string, prenom?: string): string {
    return [(prenom ?? '')[0], (nom ?? '')[0]].filter(Boolean).join('').toUpperCase();
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  statutLabel(id?: number): string {
    switch (id) {
      case 1: return 'En attente';
      case 2: return 'Traitée';
      case 3: return 'Rejetée';
      default: return '—';
    }
  }

  statutClass(id?: number): string {
    switch (id) {
      case 1: return 'pr-badge--attente';
      case 2: return 'pr-badge--traitee';
      case 3: return 'pr-badge--rejetee';
      default: return 'pr-badge--default';
    }
  }

  // ─── Toast ───────────────────────────────────────────────────────────────

  showToast(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set({ message, type });
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }

  closeToast(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set(null);
  }

  // ─── Bootstrap Modal ─────────────────────────────────────────────────────

  openModal(id: string): void {
    const el = document.getElementById(id);
    if (el) (window as any).bootstrap?.Modal?.getOrCreateInstance(el).show();
  }

  closeModal(id: string): void {
    const el = document.getElementById(id);
    if (el) (window as any).bootstrap?.Modal?.getInstance(el)?.hide();
  }
}