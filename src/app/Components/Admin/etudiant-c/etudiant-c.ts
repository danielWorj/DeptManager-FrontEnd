//  Import Chart.js en premier, avant toute utilisation
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { Component, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';
import { Departement } from '../../../Core/Model/Structure/Departement';
import { Niveau } from '../../../Core/Model/Structure/Niveau';
import { Filiere } from '../../../Core/Model/Structure/Filiere';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { DatePipe } from '@angular/common';
import { AnneeAcademique } from '../../../Core/Model/Scolarite/anneeacademique';

@Component({
  selector: 'app-etudiant-c',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './etudiant-c.html',
  styleUrl: './etudiant-c.css',
})
export class EtudiantC implements OnDestroy, AfterViewInit {

  etudiantForm!: FormGroup;

  private chartInstance:    Chart | null = null;
  private doughnutInstance: Chart | null = null;
  private toastTimer:       ReturnType<typeof setTimeout> | null = null;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private utilisateurService: UtilisateurService
  ) {
    this.etudiantForm = this.fb.group({
      id:              new FormControl(),
      nom:             new FormControl(),
      prenom:          new FormControl(),
      dateCreation:    new FormControl(),
      email:           new FormControl(),
      telephone:       new FormControl(),
      password:        new FormControl(),
      role:            new FormControl(),
      status:          new FormControl(),
      photo:           new FormControl(),
      matricule:       new FormControl(),
      filiere:         new FormControl(),
      niveau:          new FormControl(),
      anneeAcademique: new FormControl(),
    });

    this.loadPage();
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
    this.doughnutInstance?.destroy();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.getStats(), 300);
  }

  // ─── Toast ───────────────────────────────────────────────────────────────

  toast = signal<{ message: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);

  showToast(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set({ message, type });
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }

  closeToast(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set(null);
  }

  toastIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'bx bx-check-circle',
      danger:  'bx bx-x-circle',
      warning: 'bx bx-error',
      info:    'bx bx-info-circle',
    };
    return icons[type] ?? 'bx bx-info-circle';
  }

  toastTitle(type: string): string {
    const titles: Record<string, string> = {
      success: 'Succès',
      danger:  'Erreur',
      warning: 'Attention',
      info:    'Information',
    };
    return titles[type] ?? 'Information';
  }

  // ─── État de chargement ───────────────────────────────────────────────────

  loadingEtudiants = signal(true);

  // ─── Signals ─────────────────────────────────────────────────────────────

  listEtudiant        = signal<Etudiant[]>([]);
  listEtudiantSave    = signal<Etudiant[]>([]);
  listDepartement     = signal<Departement[]>([]);
  listFiliereFiltered = signal<Filiere[]>([]);
  listFiliere         = signal<Filiere[]>([]);
  listNiveau          = signal<Niveau[]>([]);

  labelFiliere            = signal<string[]>([]);
  numberEtudiant          = signal<number[]>([]);
  labelNiveau             = signal<string[]>([]);
  numberEtudiantParNiveau = signal<number[]>([]);

  // ─── Métriques ───────────────────────────────────────────────────────────

  get totalEtudiants(): number {
    return this.listEtudiantSave().length;
  }
  get totalActifs(): number {
    return this.listEtudiantSave().filter(e => e.status === 'true' || (e.status as unknown) === true).length;
  }
  get totalInactifs(): number {
    return this.listEtudiantSave().filter(e => e.status !== 'true' && (e.status as unknown) !== true).length;
  }

  // ─── Chargement ──────────────────────────────────────────────────────────

  loadPage(): void {
    this.getAllETudiant();
    this.getAllDepartement();
    this.getAllFiliere();
    this.getAllNiveau();
    this.getAllAneeAcademique();
  }

  getAllETudiant(): void {
    this.loadingEtudiants.set(true);
    this.utilisateurService.getAllEtudiant().subscribe({
      next: (data: Etudiant[]) => {
        this.listEtudiant.set(data);
        this.listEtudiantSave.set(data);
        this.loadingEtudiants.set(false);
        setTimeout(() => this.getStats(), 0);
      },
      error: () => {
        console.error('Fetch list etudiant : failed');
        this.loadingEtudiants.set(false);
      },
    });
  }

  getAllDepartement(): void {
    this.configService.getAllDepartement().subscribe({
      next: (data: Departement[]) => this.listDepartement.set(data),
      error: () => console.error('Fetch list departement : failed'),
    });
  }

  getAllFiliere(): void {
    this.configService.getAllFiliere().subscribe({
      next: (data: Filiere[]) => {
        this.listFiliere.set(data);
        this.listFiliereFiltered.set(data);
      },
      error: () => console.error('Fetch list filiere : failed'),
    });
  }

  getAllNiveau(): void {
    this.configService.getAllNiveau().subscribe({
      next: (data: Niveau[]) => this.listNiveau.set(data),
      error: () => console.error('Fetch list niveau : failed'),
    });
  }

  listAnnee = signal<AnneeAcademique[]>([]);
  getAllAneeAcademique(): void {
    this.configService.getAllAnneeAcademique().subscribe({
      next: (data: AnneeAcademique[]) => {
        this.listAnnee.set(data);
        this.getAnneeActive();
      },
      error: () => console.error('Fetch list annee : failed'),
    });
  }

  anneeActive = signal<AnneeAcademique | null>(null);
  getAnneeActive(): void {
    this.anneeActive.set(this.listAnnee().find(a => a.status) ?? null);
  }

  // ─── Filtres ─────────────────────────────────────────────────────────────

  findEtudiantByDepartement(event: Event): void {
    const idD = Number((event.target as HTMLSelectElement).value);
    if (!idD) {
      this.listEtudiant.set(this.listEtudiantSave());
      this.listFiliereFiltered.set(this.listFiliere());
      return;
    }
    this.listEtudiant.set(this.listEtudiantSave().filter(e => e.filiere?.departement?.id === idD));
    this.filterFiliereForDepartement(idD);
  }

  findEtudiantByFiliere(event: Event): void {
    const idF = Number((event.target as HTMLSelectElement).value);
    if (!idF) { this.listEtudiant.set(this.listEtudiantSave()); return; }
    this.listEtudiant.set(this.listEtudiantSave().filter(e => e.filiere?.id === idF));
  }

  findEtudiantByNiveau(event: Event): void {
    const idN = Number((event.target as HTMLSelectElement).value);
    if (!idN) { this.listEtudiant.set(this.listEtudiantSave()); return; }
    this.listEtudiant.set(this.listEtudiantSave().filter(e => e.niveau?.id === idN));
  }

  filterFiliereForDepartement(idD: number): void {
    if (!idD) { this.listFiliereFiltered.set(this.listFiliere()); return; }
    this.listFiliereFiltered.set(this.listFiliere().filter(f => f.departement?.id === idD));
  }

  // ─── Formulaire ──────────────────────────────────────────────────────────

  refreshPage(): void {
    this.getAllETudiant();
    this.getAllDepartement();
    this.getAllFiliere();
    this.getAllNiveau();
  }

  resetForm(): void {
    this.etudiantForm.reset();
  }


  saveEtudiant(): void {
    if (this.etudiantForm.invalid) return;

    const isEdit = !!this.etudiantForm.get('id')?.value;
    const formData = new FormData();

    const rawValue = this.etudiantForm.value;

    // Pour l'édition, on envoie l'id de la filière et l'id du niveau au lieu des objets complets
    const payload = isEdit
      ? {
          ...rawValue,
          
          filiere: rawValue.filiere?.id ?? rawValue.filiere,
          niveau:  rawValue.niveau?.id  ?? rawValue.niveau,
          anneeAcademique:  rawValue.anneeAcademique?.id  ?? rawValue.anneeAcademique,
        }
      : rawValue;

    formData.append('etudiant', JSON.stringify(payload));

    console.log('objet :', payload); 

    // ✅ Choix du bon endpoint selon le mode création / édition
    const request$ = isEdit
      ? this.utilisateurService.updateEtudiant(formData)
      : this.utilisateurService.createEtudiant(formData);

    request$.subscribe({
      next: (response: ResponseServer) => {
        console.log(response.message);
        this.getAllETudiant();
        this.etudiantForm.reset();
        this.showToast(
          isEdit ? 'Étudiant modifié avec succès.' : 'Étudiant créé avec succès.',
          'success'
        );
      },
      error: () => {
        console.error("Erreur lors de la sauvegarde d'un étudiant");
        this.showToast(
          isEdit ? "Échec de la modification de l'étudiant." : "Échec de la création de l'étudiant.",
          'danger'
        );
      },
    });
  }

  changeStatus(etudiant: Etudiant): void {
    this.utilisateurService.changeStatus(etudiant.id).subscribe({
      next: () => {
        this.getAllETudiant();
        this.showToast(
          `Le statut de M/Mme ${etudiant.nom} ${etudiant.prenom} a été mis à jour avec succès.`,
          'success'
        );
      },
      error: () => {
        // ✅ CORRECTION : message corrigé — il s'agit d'un étudiant, pas d'un enseignant
        this.showToast("Échec de la mise à jour du statut de l'étudiant.", 'danger');
      },
    });
  }

  // ─── Suppression ─────────────────────────────────────────────────────────

  etudiantToDelete = signal<Etudiant | null>(null);

  confirmDelete(etudiant: Etudiant): void {
    this.etudiantToDelete.set(etudiant);
  }

  cancelDelete(): void {
    this.etudiantToDelete.set(null);
  }

  deleteEtudiant(): void {
    const etudiant = this.etudiantToDelete();
    if (!etudiant) return;

    this.utilisateurService.deleteEtudiant(etudiant.id).subscribe({
      next: () => {
        this.etudiantToDelete.set(null);
        this.getAllETudiant();
        this.showToast(
          `${etudiant.nom} ${etudiant.prenom} a été supprimé avec succès.`,
          'success'
        );
      },
      error: () => {
        this.etudiantToDelete.set(null);
        this.showToast("Échec de la suppression de l'étudiant.", 'danger');
      },
    });
  }

  // ─── Détail étudiant ─────────────────────────────────────────────────────

  selectedEtudiant = signal<Etudiant | null>(null);

  selectEtudiant(etudiant: Etudiant): void {
    this.selectedEtudiant.set(etudiant);
  }

  closeDetail(): void {
    this.selectedEtudiant.set(null);
  }

  // ─── Stats ───────────────────────────────────────────────────────────────

  getStats(): void {
    this.constructData();
    this.graphEvolutionEtudiantByFiliere();
    this.constructDataNiveau();
    this.graphEtudiantParNiveau();
  }

  constructData(): void {
    const etudiants = this.listEtudiantSave();
    const unique = new Map<number, string>();
    etudiants.forEach(e => {
      if (e.filiere && !unique.has(e.filiere.id)) unique.set(e.filiere.id, e.filiere.abreviation);
    });
    this.labelFiliere.set(Array.from(unique.values()));

    const compteur = new Map<string, number>();
    etudiants.forEach(e => {
      if (e.filiere) compteur.set(e.filiere.abreviation, (compteur.get(e.filiere.abreviation) ?? 0) + 1);
    });
    this.numberEtudiant.set(this.labelFiliere().map(l => compteur.get(l) ?? 0));
  }

  graphEvolutionEtudiantByFiliere(): void {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    this.chartInstance?.destroy();
    this.chartInstance = null;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    const gradient = ctx2d.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(105, 108, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(105, 108, 255, 0.0)');
    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.labelFiliere(),
        datasets: [{
          label: "Nombre d'étudiants par filière",
          data: this.numberEtudiant(),
          borderWidth: 3, borderColor: '#696cff', backgroundColor: gradient,
          fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#696cff',
        }],
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, callback: v => Number.isInteger(v) ? v : null } } },
      },
    });
  }

  constructDataNiveau(): void {
    const etudiants = this.listEtudiantSave();
    const unique = new Map<number, string>();
    etudiants.forEach(e => {
      if (e.niveau && !unique.has(e.niveau.id)) unique.set(e.niveau.id, e.niveau.intitule);
    });
    this.labelNiveau.set(Array.from(unique.values()));

    const compteur = new Map<string, number>();
    etudiants.forEach(e => {
      if (e.niveau) compteur.set(e.niveau.intitule, (compteur.get(e.niveau.intitule) ?? 0) + 1);
    });
    this.numberEtudiantParNiveau.set(this.labelNiveau().map(l => compteur.get(l) ?? 0));
  }

  graphEtudiantParNiveau(): void {
    const canvas = document.getElementById('doughnutChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    this.doughnutInstance?.destroy();
    this.doughnutInstance = null;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    const colors = ['#696cff','#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff922b','#cc5de8','#20c997','#f06595'];
    this.doughnutInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.labelNiveau(),
        datasets: [{
          label: 'Étudiants par niveau',
          data: this.numberEtudiantParNiveau(),
          backgroundColor: colors.slice(0, this.labelNiveau().length),
          borderColor: '#ffffff', borderWidth: 2, hoverOffset: 10,
        }],
      },
      options: {
        responsive: true, cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, font: { size: 13 } } },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
                return ` ${ctx.label} : ${ctx.parsed} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  getInitiales(nom?: string, prenom?: string): string {
    return [(prenom ?? '')[0], (nom ?? '')[0]].filter(Boolean).join('').toUpperCase();
  }
}