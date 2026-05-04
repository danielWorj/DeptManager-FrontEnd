import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { Actualite } from '../../../Core/Model/Actualite/Actualite';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { CategorieActualite } from '../../../Core/Model/Actualite/CategorieActualite';

@Component({
  selector: 'app-actualite',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './actualite.html',
  styleUrl: './actualite.css',
})
export class ActualiteE {

  private fb            = inject(FormBuilder);
  private configService = inject(ConfigService);

  constructor() {
    this.buildForms();
    this.loadPage();
  }

  loadPage(): void {
    this.getAllActualite();
    this.getAllCategorieActualite();
  }

  // ─── Données ────────────────────────────────────────────────────────────────
  listActualite          = signal<Actualite[]>([]);
  listCategorieActualite = signal<CategorieActualite[]>([]);

  // ─── Filtres ─────────────────────────────────────────────────────────────────
  filterCategorieId = signal<number | null>(null);
  filterDate        = signal<string | null>(null);
  filterSearch      = signal<string>('');

  filteredActualite = computed(() => {
    let list = this.listActualite();
    const catId  = this.filterCategorieId();
    const date   = this.filterDate();
    const search = this.filterSearch().toLowerCase().trim();

    if (catId)  list = list.filter(a => a.categorieActualite?.id === catId);
    if (date)   list = list.filter(a => a.datePublication === date);
    if (search) list = list.filter(a => a.titre?.toLowerCase().includes(search));
    return list;
  });

  // ─── Sélection / état UI ─────────────────────────────────────────────────────
  selectedActualite    = signal<Actualite | null>(null);
  deleteTargetId       = signal<number | null>(null);
  deleteCategorieId    = signal<number | null>(null);
  toast                = signal<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);

  // ─── Fichiers image ──────────────────────────────────────────────────────────
  fileActualiteCreate!: File;
  fileActualiteEdit  !: File;
  previewUrlCreate    = signal<string | null>(null);
  previewUrlEdit      = signal<string | null>(null);

  // ─── Formulaires ────────────────────────────────────────────────────────────
  actualiteFb    !: FormGroup;
  editActualiteFb!: FormGroup;
  categorieFb    !: FormGroup;
  editCategorieFb!: FormGroup;

  private buildForms(): void {
    this.actualiteFb = this.fb.group({
      titre:              new FormControl('',   [Validators.required]),
      description:        new FormControl('',   [Validators.required, Validators.minLength(10)]),
      url:                new FormControl(''),
      datePublication:    new FormControl('',   [Validators.required]),
      categorieActualite: new FormControl(null, [Validators.required]),
    });

    this.editActualiteFb = this.fb.group({
      id:                 new FormControl<number | null>(null),
      titre:              new FormControl('', [Validators.required]),
      description:        new FormControl(''),
      url:                new FormControl(''),
      datePublication:    new FormControl(''),
      categorieActualite: new FormControl(null),
    });

    this.categorieFb = this.fb.group({
      intitule: new FormControl('', [Validators.required]),
    });

    this.editCategorieFb = this.fb.group({
      id:       new FormControl<number | null>(null),
      intitule: new FormControl('', [Validators.required]),
    });
  }

  // ─── API : Actualités ────────────────────────────────────────────────────────

  getAllActualite(): void {
    this.configService.getAllActualite().subscribe({
      next:  (data: Actualite[]) => this.listActualite.set(data),
      error: (err) => console.error('Fetch actualités :', err),
    });
  }

  createActualite(): void {
    if (this.actualiteFb.invalid) { this.actualiteFb.markAllAsTouched(); return; }

    const formData = new FormData();
    formData.append('actualite', JSON.stringify(this.actualiteFb.value));
    if (this.fileActualiteCreate) formData.append('file', this.fileActualiteCreate);

    this.configService.createActualite(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          this.showToast('Actualité publiée avec succès !', 'success');
          this.getAllActualite();
          this.closeModal('createActualiteModal');
          this.resetCreateForm();
        } else {
          this.showToast(data.message ?? 'Erreur lors de la création.', 'danger');
        }
      },
      error: () => this.showToast('Erreur serveur.', 'danger'),
    });
  }

  updateActualite(): void {
    if (this.editActualiteFb.invalid) { this.editActualiteFb.markAllAsTouched(); return; }

    const formData = new FormData();
    formData.append('actualite', JSON.stringify(this.editActualiteFb.value));
    if (this.fileActualiteEdit) formData.append('file', this.fileActualiteEdit);

    this.configService.updateActualite(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          this.showToast('Actualité mise à jour !', 'success');
          this.getAllActualite();
          this.closeModal('editActualiteModal');
        } else {
          this.showToast(data.message ?? 'Erreur lors de la mise à jour.', 'danger');
        }
      },
      error: () => this.showToast('Erreur serveur.', 'danger'),
    });
  }

  deleteActualite(): void {
    const id = this.deleteTargetId();
    if (id === null) return;

    this.configService.deleteActualite(id).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          this.listActualite.update(list => list.filter(a => a.id !== id));
          this.showToast(`Actualité #${id} supprimée.`, 'danger');
          this.closeModal('deleteActualiteModal');
          this.deleteTargetId.set(null);
        } else {
          this.showToast(data.message ?? 'Erreur lors de la suppression.', 'danger');
        }
      },
      error: () => this.showToast('Erreur serveur.', 'danger'),
    });
  }

  // ─── API : Vedette ───────────────────────────────────────────────────────────

  toggleVedette(a: Actualite): void {
    const updated: Actualite = { ...a, vedette: !a.vedette };

    this.configService.changeActualiteStatus(a.id).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          // Mise à jour locale de la liste
          this.listActualite.update(list =>
            list.map(item => item.id === updated.id ? updated : item)
          );
          // Mise à jour de l'actualité sélectionnée dans le modal détail
          this.selectedActualite.set(updated);

          const msg = updated.vedette
            ? 'Article mis en vedette !'
            : 'Article retiré de la vedette.';
          this.showToast(msg, 'success');
        } else {
          this.showToast(data.message ?? 'Erreur lors de la mise à jour.', 'danger');
        }
      },
      error: () => this.showToast('Erreur serveur.', 'danger'),
    });
  }

  private toFormData(a: Actualite): FormData {
    const fd = new FormData();
    fd.append('actualite', JSON.stringify(a));
    return fd;
  }

  // ─── API : Catégories ────────────────────────────────────────────────────────

  getAllCategorieActualite(): void {
    this.configService.getAllCategorieActualite().subscribe({
      next:  (data: CategorieActualite[]) => this.listCategorieActualite.set(data),
      error: (err) => console.error('Fetch catégories :', err),
    });
  }

  createCategorieActualite(): void {
    if (this.categorieFb.invalid) { this.categorieFb.markAllAsTouched(); return; }

    const formData = new FormData();
    formData.append('categorie', JSON.stringify(this.categorieFb.value));

    this.configService.createCategorieActualite(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          this.showToast('Catégorie créée !', 'success');
          this.getAllCategorieActualite();
          this.closeModal('createCategorieModal');
          this.categorieFb.reset();
        } else {
          this.showToast(data.message ?? 'Erreur lors de la création.', 'danger');
        }
      },
      error: () => this.showToast('Erreur serveur.', 'danger'),
    });
  }

  updateCategorieActualite(): void {
    if (this.editCategorieFb.invalid) { this.editCategorieFb.markAllAsTouched(); return; }

    const formData = new FormData();
    formData.append('categorie', JSON.stringify(this.editCategorieFb.value));

    this.configService.updateCategorieActualite(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          this.showToast('Catégorie mise à jour !', 'success');
          this.getAllCategorieActualite();
          this.closeModal('editCategorieModal');
        } else {
          this.showToast(data.message ?? 'Erreur lors de la mise à jour.', 'danger');
        }
      },
      error: () => this.showToast('Erreur serveur.', 'danger'),
    });
  }

  deleteCategorieActualite(): void {
    const id = this.deleteCategorieId();
    if (id === null) return;

    this.configService.deleteCategorieActualite(id).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          this.listCategorieActualite.update(list => list.filter(c => c.id !== id));
          this.showToast('Catégorie supprimée.', 'danger');
          this.closeModal('deleteCategModal');
          this.deleteCategorieId.set(null);
        } else {
          this.showToast(data.message ?? 'Erreur lors de la suppression.', 'danger');
        }
      },
      error: () => this.showToast('Erreur serveur.', 'danger'),
    });
  }

  // ─── Actions UI ──────────────────────────────────────────────────────────────

  /** Ouvre le modal de détail et sélectionne l'actualité */
  openDetailModal(a: Actualite): void {
    this.selectedActualite.set(a);
    this.openModal('detailActualiteModal');
  }

  /** Pré-remplit le formulaire d'édition et ouvre le modal */
  openEditModal(a: Actualite): void {
    this.previewUrlEdit.set(a.url ?? null);
    this.editActualiteFb.patchValue({
      id:                 a.id,
      titre:              a.titre,
      description:        a.description,
      url:                a.url,
      datePublication:    a.datePublication,
      categorieActualite: a.categorieActualite?.id ?? null,
    });
  }

  openDeleteModal(id: number): void { this.deleteTargetId.set(id); }

  openEditCategorieModal(cat: CategorieActualite): void {
    this.editCategorieFb.patchValue({ id: cat.id, intitule: cat.intitule });
  }

  openDeleteCategorieModal(id: number): void { this.deleteCategorieId.set(id); }

  // ─── Filtres ──────────────────────────────────────────────────────────────────

  onFilterCategorie(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.filterCategorieId.set(val ? +val : null);
  }

  onFilterDate(event: Event): void {
    this.filterDate.set((event.target as HTMLInputElement).value || null);
  }

  onSearch(event: Event): void {
    this.filterSearch.set((event.target as HTMLInputElement).value);
  }

  // ─── Upload image (création) ──────────────────────────────────────────────────

  selectFileCreate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.loadPreview(input.files[0], 'create');
    input.value = '';
  }

  onDropCreate(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.loadPreview(file, 'create');
  }

  removeFileCreate(event: Event): void {
    event.stopPropagation();
    this.previewUrlCreate.set(null);
  }

  // ─── Upload image (édition) ───────────────────────────────────────────────────

  selectFileEdit(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.loadPreview(input.files[0], 'edit');
    input.value = '';
  }

  onDropEdit(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.loadPreview(file, 'edit');
  }

  removeFileEdit(event: Event): void {
    event.stopPropagation();
    this.previewUrlEdit.set(null);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); }

  private loadPreview(file: File, target: 'create' | 'edit'): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const url = e.target?.result as string;
      if (target === 'create') {
        this.fileActualiteCreate = file;
        this.previewUrlCreate.set(url);
      } else {
        this.fileActualiteEdit = file;
        this.previewUrlEdit.set(url);
      }
    };
    reader.readAsDataURL(file);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  countArticlesByCategorie(catId: number): number {
    return this.listActualite().filter(a => a.categorieActualite?.id === catId).length;
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  /** Classe CSS Bootstrap du toast selon le type */
  toastClass(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-success text-white',
      danger:  'bg-danger text-white',
      info:    'bg-info text-white',
    };
    return map[type] ?? 'bg-secondary text-white';
  }

  isInvalid(
    formName: 'actualiteFb' | 'editActualiteFb' | 'categorieFb' | 'editCategorieFb',
    field: string
  ): boolean {
    const ctrl = this[formName].get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  private resetCreateForm(): void {
    this.actualiteFb.reset();
    this.previewUrlCreate.set(null);
    this.fileActualiteCreate = undefined!;
  }

  // ─── Toast ───────────────────────────────────────────────────────────────────

  showToast(message: string, type: 'success' | 'danger' | 'info' = 'info'): void {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3500);
  }

  // ─── Bootstrap Modal helpers ──────────────────────────────────────────────────

  openModal(id: string): void {
    const el = document.getElementById(id);
    if (el) (window as any).bootstrap?.Modal?.getOrCreateInstance(el).show();
  }

  closeModal(id: string): void {
    const el = document.getElementById(id);
    if (el) (window as any).bootstrap?.Modal?.getInstance(el)?.hide();
  }
}