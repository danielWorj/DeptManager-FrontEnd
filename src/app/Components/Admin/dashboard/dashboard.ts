import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { Component, OnDestroy, AfterViewInit, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { HoraireService } from '../../../Core/Service/Horaire/horaire-service';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant';
import { Requete } from '../../../Core/Model/Requete/Requete';
import { Documentation } from '../../../Core/Model/Scolarite/Document';
import { Repartition } from '../../../Core/Model/Scolarite/Repartition';
import { Horaire } from '../../../Core/Model/Horaire/Horaire';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnDestroy, AfterViewInit {

  private chartFiliere:    Chart | null = null;
  private chartNiveau:     Chart | null = null;
  private chartEnseignant: Chart | null = null;

  constructor(
    private utilisateurService: UtilisateurService,
    private scolariteService:   ScolariteService,
    private horaireService:     HoraireService,
  ) {
    this.loadAll();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderCharts(), 300);
  }

  ngOnDestroy(): void {
    this.chartFiliere?.destroy();
    this.chartNiveau?.destroy();
    this.chartEnseignant?.destroy();
  }

  // ─── États de chargement ─────────────────────────────────────────────────

  loadingEtudiants   = signal(true);
  loadingEnseignants = signal(true);
  loadingRequetes    = signal(true);
  loadingDocuments   = signal(true);
  loadingRepartitions = signal(true);
  loadingHoraires    = signal(true);

  /** True tant qu'au moins l'une des deux sources des graphiques horaires charge */
  loadingCouverture = computed(() =>
    this.loadingRepartitions() || this.loadingHoraires()
  );

  // ─── Données brutes ───────────────────────────────────────────────────────

  listEtudiant   = signal<Etudiant[]>([]);
  listEnseignant = signal<Enseignant[]>([]);
  listRequete    = signal<Requete[]>([]);
  listDocument   = signal<Documentation[]>([]);

  // ─── KPI étudiants ───────────────────────────────────────────────────────

  totalEtudiants = computed(() => this.listEtudiant().length);

  etudiantsActifs = computed(() =>
    this.listEtudiant().filter(
      e => e.status === 'true' || (e.status as unknown) === true
    ).length
  );

  etudiantsInactifs = computed(() => this.totalEtudiants() - this.etudiantsActifs());

  // ─── KPI enseignants ─────────────────────────────────────────────────────

  totalEnseignants = computed(() => this.listEnseignant().length);

  enseignantsActifs = computed(() =>
    this.listEnseignant().filter(
      e => e.status === 'ACTIF' || (e.status as unknown) === true
    ).length
  );

  enseignantsInactifs = computed(() => this.totalEnseignants() - this.enseignantsActifs());

  // ─── KPI requêtes ────────────────────────────────────────────────────────

  requetesEnAttente = computed(() =>
    this.listRequete().filter(r => r.statutRequete?.id === 1).length
  );

  requetesTraitees = computed(() =>
    this.listRequete().filter(r => r.statutRequete?.id === 2).length
  );

  requetesRejetees = computed(() =>
    this.listRequete().filter(r => r.statutRequete?.id === 3).length
  );

  /** 5 premières requêtes en attente — le seul endroit qui appelle à l'action */
  requetesUrgentes = computed(() =>
    this.listRequete()
      .filter(r => r.statutRequete?.id === 1)
      .slice(0, 5)
  );

  // ─── KPI documents ───────────────────────────────────────────────────────

  totalDocuments = computed(() => this.listDocument().length);

  // ─── Données horaires & répartitions (rangée 4) ──────────────────────────

  listRepartition = signal<Repartition[]>([]);
  listHoraire     = signal<Horaire[]>([]);

  /** Répartitions qui ont un horaire programmé */
  repartitionsProgrammees = computed(() => {
    const idsAvecHoraire = new Set(this.listHoraire().map(h => h.repartition?.id));
    return this.listRepartition().filter(r => idsAvecHoraire.has(r.id));
  });

  /** Répartitions sans horaire — cours non encore planifiés */
  repartitionsSansProgramme = computed(() => {
    const idsAvecHoraire = new Set(this.listHoraire().map(h => h.repartition?.id));
    return this.listRepartition().filter(r => !idsAvecHoraire.has(r.id));
  });

  /** Taux de couverture global en % */
  tauxCouverture = computed(() => {
    const total = this.listRepartition().length;
    if (total === 0) return 0;
    return Math.round((this.repartitionsProgrammees().length / total) * 100);
  });

  couvertureParFiliere = computed(() => {
    const map = new Map<string, { total: number; programmees: number }>();
    const idsAvecHoraire = new Set(this.listHoraire().map(h => h.repartition?.id));

    this.listRepartition().forEach(r => {
      const key = r.filiere?.abreviation ?? 'Inconnue';
      const entry = map.get(key) ?? { total: 0, programmees: 0 };
      entry.total++;
      if (idsAvecHoraire.has(r.id)) entry.programmees++;
      map.set(key, entry);
    });

    return Array.from(map.entries()).map(([filiere, v]) => ({
      filiere,
      total:        v.total,
      programmees:  v.programmees,
      manquantes:   v.total - v.programmees,
      taux:         Math.round((v.programmees / v.total) * 100),
    }));
  });

  // ─── Chargement ──────────────────────────────────────────────────────────

  loadAll(): void {
    this.utilisateurService.getAllEtudiant().subscribe({
      next: (data: Etudiant[]) => {
        this.listEtudiant.set(data);
        this.loadingEtudiants.set(false);
        setTimeout(() => this.renderCharts(), 0);
      },
      error: () => {
        console.error('Dashboard — fetch étudiants : failed');
        this.loadingEtudiants.set(false);
      },
    });

    this.utilisateurService.getAllEnseignant().subscribe({
      next: (data: Enseignant[]) => {
        this.listEnseignant.set(data);
        this.loadingEnseignants.set(false);
        setTimeout(() => this.renderCharts(), 0);
      },
      error: () => {
        console.error('Dashboard — fetch enseignants : failed');
        this.loadingEnseignants.set(false);
      },
    });

    this.scolariteService.getAllRequete().subscribe({
      next: (data: Requete[]) => {
        this.listRequete.set(data);
        this.loadingRequetes.set(false);
      },
      error: () => {
        console.error('Dashboard — fetch requêtes : failed');
        this.loadingRequetes.set(false);
      },
    });

    this.scolariteService.getAllDocument().subscribe({
      next: (data: Documentation[]) => {
        this.listDocument.set(data);
        this.loadingDocuments.set(false);
      },
      error: () => {
        console.error('Dashboard — fetch documents : failed');
        this.loadingDocuments.set(false);
      },
    });

    // ⚠️ Requiert getAllRepartition() dans ScolariteService
    this.scolariteService.getAllRepartition().subscribe({
      next: (data: Repartition[]) => {
        this.listRepartition.set(data);
        this.loadingRepartitions.set(false);
      },
      error: () => {
        console.error('Dashboard — fetch répartitions : failed');
        this.loadingRepartitions.set(false);
      },
    });

    // ⚠️ Requiert getAllHoraire() dans HoraireService
    this.horaireService.getAllHoraire().subscribe({
      next: (data: Horaire[]) => {
        this.listHoraire.set(data);
        this.loadingHoraires.set(false);
        setTimeout(() => this.renderCharts(), 0);
      },
      error: () => {
        console.error('Dashboard — fetch horaires : failed');
        this.loadingHoraires.set(false);
      },
    });
  }

  // ─── Graphiques ──────────────────────────────────────────────────────────

  private renderCharts(): void {
    this.renderEtudiantsParFiliere();
    this.renderEtudiantsParNiveau();
    this.renderEnseignantsParDepartement();
  }

  private renderEtudiantsParFiliere(): void {
    const canvas = document.getElementById('dashChartFiliere') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.chartFiliere?.destroy();
    this.chartFiliere = null;

    const map = new Map<string, number>();
    this.listEtudiant().forEach(e => {
      if (e.filiere) {
        const key = e.filiere.abreviation;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    });

    const labels = Array.from(map.keys());
    const data   = Array.from(map.values());

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(105,108,255,0.35)');
    gradient.addColorStop(1, 'rgba(105,108,255,0.0)');

    this.chartFiliere = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Étudiants',
          data,
          borderColor: '#696cff',
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#696cff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: v => Number.isInteger(v) ? v : null,
            },
          },
        },
      },
    });
  }

  private renderEtudiantsParNiveau(): void {
    const canvas = document.getElementById('dashChartNiveau') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.chartNiveau?.destroy();
    this.chartNiveau = null;

    const map = new Map<string, number>();
    this.listEtudiant().forEach(e => {
      if (e.niveau) {
        const key = e.niveau.intitule;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    });

    const labels = Array.from(map.keys());
    const data   = Array.from(map.values());
    const colors = ['#696cff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8'];

    this.chartNiveau = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 12, font: { size: 12 } },
          },
        },
      },
    });
  }

  private renderEnseignantsParDepartement(): void {
    const canvas = document.getElementById('dashChartEnseignant') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.chartEnseignant?.destroy();
    this.chartEnseignant = null;

    const map = new Map<string, number>();
    this.listEnseignant().forEach(e => {
      if (e.departement) {
        const key = e.departement.intitule;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    });

    const labels = Array.from(map.keys());
    const data   = Array.from(map.values());
    const colors = ['#696cff', '#71dd37', '#03c3ec', '#ffab00', '#ff6b6b', '#cc5de8'];

    this.chartEnseignant = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 12, font: { size: 12 } },
          },
        },
      },
    });
  }

  // ─── Helpers template ────────────────────────────────────────────────────

  getInitiales(nom?: string, prenom?: string): string {
    return [(prenom ?? '')[0], (nom ?? '')[0]]
      .filter(Boolean).join('').toUpperCase();
  }
}