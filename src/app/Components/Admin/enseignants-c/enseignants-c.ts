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
  }

  // ─── État de chargement ───────────────────────────────────────────────────

  /** Contrôle les cards KPI, le tableau et les graphiques */
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

  getAllNiveau(): void {
    this.confiService.getAllNiveau().subscribe({
      next: (data: Niveau[]) => this.listNiveau.set(data),
      error: () => console.error('Fetch list niveau : failed'),
    });
  }

  getAllFiliere(): void {
    this.confiService.getAllFiliere().subscribe({
      next: (data: Filiere[]) => this.listFiliere.set(data),
      error: () => console.error('Fetch list filiere : failed'),
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
    if (!idD) {
      this.listEnseignant.set(this.listEnseignantSave());
      return;
    }
    this.listEnseignant.set(
      this.listEnseignantSave().filter(e => e.departement?.id === idD)
    );
  }

  findEnseignantByPoste(event: Event): void {
    const idP = Number((event.target as HTMLSelectElement).value);
    if (!idP) {
      this.listEnseignant.set(this.listEnseignantSave());
      return;
    }
    this.listEnseignant.set(
      this.listEnseignantSave().filter(e => e.poste?.id === idP)
    );
  }

  // ─── Formulaire ──────────────────────────────────────────────────────────

  resetForm(): void {
    this.enseignantForm.reset();
  }

  createEnseignant(): void {
    if (this.enseignantForm.invalid) return;

    const formData = new FormData();
    formData.append('enseignant', JSON.stringify(this.enseignantForm.value));

    this.utilisateurService.createEnseignant(formData).subscribe({
      next: (response: ResponseServer) => {
        console.log(response.message);
        this.getAllEnseignant();
        this.enseignantForm.reset();
      },
      error: () => console.error('Erreur lors de la création d\'un enseignant'),
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
      if (e.departement && !unique.has(e.departement.id)) {
        unique.set(e.departement.id, e.departement.intitule);
      }
    });
    this.labelDepartement.set(Array.from(unique.values()));

    const compteur = new Map<string, number>();
    enseignants.forEach(e => {
      if (e.departement) {
        const intitule = e.departement.intitule;
        compteur.set(intitule, (compteur.get(intitule) ?? 0) + 1);
      }
    });
    this.numberEnseignant.set(
      this.labelDepartement().map(label => compteur.get(label) ?? 0)
    );
  }

  constructDataPoste(): void {
    const enseignants = this.listEnseignantSave();

    const unique = new Map<number, string>();
    enseignants.forEach(e => {
      if (e.poste && !unique.has(e.poste.id)) {
        unique.set(e.poste.id, e.poste.intitule);
      }
    });
    this.labelPoste.set(Array.from(unique.values()));

    const compteur = new Map<string, number>();
    enseignants.forEach(e => {
      if (e.poste) {
        const intitule = e.poste.intitule;
        compteur.set(intitule, (compteur.get(intitule) ?? 0) + 1);
      }
    });
    this.numberEnseignantParPoste.set(
      this.labelPoste().map(label => compteur.get(label) ?? 0)
    );
  }

  graphEvolutionEnseignantByDepartement(): void {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement | null;
    if (!canvas) { console.error('Canvas #myChart introuvable dans le DOM'); return; }

    this.chartInstance?.destroy();
    this.chartInstance = null;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) { console.error('Impossible d\'obtenir le contexte 2D du canvas'); return; }

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
          borderWidth: 3,
          borderColor: '#696cff',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#696cff',
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: (value: any) => Number.isInteger(value) ? value : null,
            },
          },
        },
      },
    });
  }

  graphEnseignantParPoste(): void {
    const canvas = document.getElementById('doughnutChart') as HTMLCanvasElement | null;
    if (!canvas) { console.error('Canvas #doughnutChart introuvable dans le DOM'); return; }

    this.doughnutInstance?.destroy();
    this.doughnutInstance = null;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) { console.error('Impossible d\'obtenir le contexte 2D du canvas'); return; }

    const colors = [
      '#696cff', '#ff6b6b', '#ffd93d',
      '#6bcb77', '#4d96ff', '#ff922b',
      '#cc5de8', '#20c997', '#f06595',
    ];

    this.doughnutInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.labelPoste(),
        datasets: [{
          label: 'Enseignants par poste',
          data: this.numberEnseignantParPoste(),
          backgroundColor: colors.slice(0, this.labelPoste().length),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, font: { size: 13 } },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const value = context.parsed;
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return ` ${context.label} : ${value} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }
}