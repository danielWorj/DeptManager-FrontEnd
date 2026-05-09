//  Les imports Chart.js doivent être AVANT leur utilisation
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { Component, OnDestroy, signal, computed } from '@angular/core';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant';
import { Niveau } from '../../../Core/Model/Structure/Niveau';
import { Filiere } from '../../../Core/Model/Structure/Filiere';
import { Poste } from '../../../Core/Model/Utilisateur/Poste';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Departement } from '../../../Core/Model/Structure/Departement';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-enseignants-c',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './enseignants-c.html',
  styleUrl: './enseignants-c.css',
})
export class EnseignantsC implements OnDestroy {

  enseignantForm!: FormGroup;

  private chartInstance:    Chart | null = null;
  private doughnutInstance: Chart | null = null;
  private toastTimer:       ReturnType<typeof setTimeout> | null = null;

  constructor(
    private fb: FormBuilder,
    private confiService: ConfigService,
    private utilisateurService: UtilisateurService
  ) {
    this.enseignantForm = this.fb.group({
      id:           new FormControl(),
      nom:          new FormControl(),
      prenom:       new FormControl(),
      dateCreation: new FormControl(),
      email:        new FormControl(),
      password:     new FormControl(),
      telephone:    new FormControl(),
      role:         new FormControl(),
      status:       new FormControl(),
      poste:        new FormControl(),
      photo:        new FormControl(),
      departement:  new FormControl(),
    });

    this.loadPage();
  }

  loadPage(): void {
    this.getAllEnseignant();
    this.getAllDepartement();
    this.getAllPoste();
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
    this.doughnutInstance?.destroy();
    if (this.toastTimer) clearTimeout(this.toastTimer);
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

  loadingEnseignants = signal(true);

  // ─── Signals ─────────────────────────────────────────────────────────────

  listEnseignant           = signal<Enseignant[]>([]);
  listEnseignantSave       = signal<Enseignant[]>([]);
  listNiveau               = signal<Niveau[]>([]);
  listFiliere              = signal<Filiere[]>([]);
  listDepartemet           = signal<Departement[]>([]);
  listPoste                = signal<Poste[]>([]);
  labelDepartement         = signal<string[]>([]);
  numberEnseignant         = signal<number[]>([]);
  labelPoste               = signal<string[]>([]);
  numberEnseignantParPoste = signal<number[]>([]);

  // ─── Métriques calculées ─────────────────────────────────────────────────

  totalEnseignants = computed(() => this.listEnseignantSave().length);

  enseignantsActifs = computed(() =>
    this.listEnseignantSave().filter(
      e => e.status === 'ACTIF' || (e.status as unknown) === true
    ).length
  );

  enseignantsNonActifs = computed(() =>
    this.totalEnseignants() - this.enseignantsActifs()
  );

  // ─── Chargement des données ───────────────────────────────────────────────

  getAllEnseignant(): void {
    this.loadingEnseignants.set(true);
    this.listEnseignant.set([]);
    this.utilisateurService.getAllEnseignant().subscribe({
      next: (data: Enseignant[]) => {
        this.listEnseignant.set(data);
        this.listEnseignantSave.set(data);
        this.loadingEnseignants.set(false);
        this.constructData();
        this.constructDataPoste();
        this.renderCharts();
      },
      error: () => {
        console.error('Fetch list enseignant : failed');
        this.loadingEnseignants.set(false);
      },
    });
  }

  getAllDepartement(): void {
    this.confiService.getAllDepartement().subscribe({
      next: (data: Departement[]) => this.listDepartemet.set(data),
      error: () => console.error('Fetch list departement : failed'),
    });
  }

  getAllPoste(): void {
    this.confiService.getAllPoste().subscribe({
      next: (data: Poste[]) => this.listPoste.set(data),
      error: () => console.error('Fetch list poste : failed'),
    });
  }



  // ─── Filtres ─────────────────────────────────────────────────────────────

  findEnseignantByDepartement(event: Event): void {
    const idD = Number((event.target as HTMLSelectElement).value);
    if (!idD) { this.listEnseignant.set(this.listEnseignantSave()); return; }
    this.listEnseignant.set(this.listEnseignantSave().filter(e => e.departement?.id === idD));
  }

  findEnseignantByPoste(event: Event): void {
    const idP = Number((event.target as HTMLSelectElement).value);
    if (!idP) { this.listEnseignant.set(this.listEnseignantSave()); return; }
    this.listEnseignant.set(this.listEnseignantSave().filter(e => e.poste?.id === idP));
  }

  // ─── Formulaire ──────────────────────────────────────────────────────────

  resetForm(): void {
    this.enseignantForm.reset();
  }

  createEnseignant(): void {
    if (this.enseignantForm.invalid) return;

    const isEdit = !!this.enseignantForm.get('id')?.value;
    const formData = new FormData();
    formData.append('enseignant', JSON.stringify(this.enseignantForm.value));

    this.utilisateurService.createEnseignant(formData).subscribe({
      next: (response: ResponseServer) => {
        console.log(response.message);
        this.getAllEnseignant();
        this.enseignantForm.reset();
        this.showToast(
          isEdit ? 'Enseignant modifié avec succès.' : 'Enseignant créé avec succès.',
          'success'
        );
      },
      error: () => {
        console.error('Erreur lors de la création d\'un enseignant');
        this.showToast(
          isEdit ? 'Échec de la modification de l\'enseignant.' : 'Échec de la création de l\'enseignant.',
          'danger'
        );
      },
    });
  }

  // ─── Suppression ─────────────────────────────────────────────────────────

  enseignantToDelete = signal<Enseignant | null>(null);

  confirmDelete(enseignant: Enseignant): void {
    this.enseignantToDelete.set(enseignant);
  }

  cancelDelete(): void {
    this.enseignantToDelete.set(null);
  }

  deleteEnseignant(): void {
    const enseignant = this.enseignantToDelete();
    if (!enseignant) return;

    this.utilisateurService.deleteEnseignant(enseignant.id).subscribe({
      next: () => {
        this.enseignantToDelete.set(null);
        this.getAllEnseignant();
        this.showToast(
          `${enseignant.nom} ${enseignant.prenom} a été supprimé avec succès.`,
          'success'
        );
      },
      error: () => {
        this.enseignantToDelete.set(null);
        this.showToast("Échec de la suppression de l'enseignant.", 'danger');
      },
    });
  }

  changeStatus(enseignant:Enseignant){
    this.utilisateurService.changeStatus(enseignant.id).subscribe({
      next: () => {
        this.getAllEnseignant();
        this.showToast(
          `Le status de M/Mmme ${enseignant.nom} ${enseignant.prenom} a été mis a jour avec succès.`,
          'success'
        );
      },
      error: () => {
        this.showToast("Échec de la mis a jour du statut de l'enseignant.", 'danger');
      },
    });
  }

  // ─── Graphiques ──────────────────────────────────────────────────────────

  private renderCharts(): void {
    setTimeout(() => {
      this.graphEvolutionEnseignantByDepartement();
      this.graphEnseignantParPoste();
    }, 0);
  }

  constructData(): void {
    const enseignants = this.listEnseignantSave();
    const unique = new Map<number, string>();
    enseignants.forEach(e => {
      if (e.departement && !unique.has(e.departement.id)) unique.set(e.departement.id, e.departement.intitule);
    });
    this.labelDepartement.set(Array.from(unique.values()));

    const compteur = new Map<string, number>();
    enseignants.forEach(e => {
      if (e.departement) compteur.set(e.departement.intitule, (compteur.get(e.departement.intitule) ?? 0) + 1);
    });
    this.numberEnseignant.set(this.labelDepartement().map(l => compteur.get(l) ?? 0));
  }

  constructDataPoste(): void {
    const enseignants = this.listEnseignantSave();
    const unique = new Map<number, string>();
    enseignants.forEach(e => {
      if (e.poste && !unique.has(e.poste.id)) unique.set(e.poste.id, e.poste.intitule);
    });
    this.labelPoste.set(Array.from(unique.values()));

    const compteur = new Map<string, number>();
    enseignants.forEach(e => {
      if (e.poste) compteur.set(e.poste.intitule, (compteur.get(e.poste.intitule) ?? 0) + 1);
    });
    this.numberEnseignantParPoste.set(this.labelPoste().map(l => compteur.get(l) ?? 0));
  }

  graphEvolutionEnseignantByDepartement(): void {
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
        labels: this.labelDepartement(),
        datasets: [{
          label: 'Nombre d\'enseignants',
          data: this.numberEnseignant(),
          borderWidth: 3, borderColor: '#696cff', backgroundColor: gradient,
          fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#696cff',
        }],
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, callback: (v: any) => Number.isInteger(v) ? v : null } } },
      },
    });
  }

  graphEnseignantParPoste(): void {
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
        labels: this.labelPoste(),
        datasets: [{
          label: 'Enseignants par poste',
          data: this.numberEnseignantParPoste(),
          backgroundColor: colors.slice(0, this.labelPoste().length),
          borderColor: '#ffffff', borderWidth: 2, hoverOffset: 10,
        }],
      },
      options: {
        responsive: true, cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, font: { size: 13 } } },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0';
                return ` ${context.label} : ${context.parsed} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }
}