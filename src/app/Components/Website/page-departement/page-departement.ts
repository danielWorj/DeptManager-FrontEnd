import {
  Component,
  signal,
  computed,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ConfigService }      from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { DepartementForWebsite } from '../../../Core/Model/Structure/Departement';
import { ActivatedRoute, Router } from '@angular/router';

/** Sous-ensemble de Media utilisé pour la lightbox */
interface MediaItem {
  id     : number;
  url    : string;
  titre ?: string;
  legende?: string;
}

@Component({
  selector   : 'app-page-departement',
  standalone : true,
  imports    : [CommonModule],
  templateUrl: './page-departement.html',
  styleUrl   : './page-departement.css',
})
export class PageDepartement implements OnInit, OnDestroy {

  // ── Injection ────────────────────────────────
  private readonly sanitizer          = inject(DomSanitizer);
  private readonly configService      = inject(ConfigService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly route              = inject(ActivatedRoute);
  private readonly router             = inject(Router);

  // ── État principal ────────────────────────────
  idDepartement         = signal<number>(0);
  departementForWebsite = signal<DepartementForWebsite | null>(null);
  readonly currentYear  = new Date().getFullYear();
  isLoading             = signal<boolean>(true);

  // ── Cache SafeUrl pré-calculées ───────────────
  // Évite de recréer un nouvel objet SafeUrl à chaque cycle de détection
  // de changement Angular (source de boucle infinie).
  private safeUrlCache = new Map<string, SafeUrl>();

  getSafeUrl(url: string): SafeUrl {
    if (!url) return '';
    if (!this.safeUrlCache.has(url)) {
      this.safeUrlCache.set(url, this.sanitizer.bypassSecurityTrustUrl(url));
    }
    return this.safeUrlCache.get(url)!;
  }

  // URL de l'image héro (1er média) — calculée une seule fois
  heroImgUrl = computed<SafeUrl>(() => {
    const dept = this.departementForWebsite();
    if (!dept || !dept.medias?.length) return '';
    return this.getSafeUrl('assets/file/' + dept.medias[0].url);
  });

  // URL de la photo du chef — calculée une seule fois
  chefPhotoUrl = computed<SafeUrl>(() => {
    const dept = this.departementForWebsite();
    if (!dept?.chefDepartement?.photo) return '';
    return this.getSafeUrl('assets/file/' + dept.chefDepartement.photo);
  });

  // ── UI : navigation mobile ────────────────────
  mobileNavOpen = signal<boolean>(false);

  // ── UI : sous-nav scroll-spy ──────────────────
  private readonly SECTIONS = [
    'dept-chef',
    'dept-filieres',
    'dept-debouches',
    'dept-galerie',
    'dept-candidater',
  ] as const;

  activeSection = signal<string>(this.SECTIONS[0]);

  @HostListener('window:scroll')
  onScroll(): void {
    // Barre de progression
    const bar = document.getElementById('dept-progress');
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : '0%';
    }
    // Section active
    const y = window.scrollY + 120;
    let active: string = this.SECTIONS[0];
    for (const id of this.SECTIONS) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= y) active = id;
    }
    this.activeSection.set(active);
  }

  // ── UI : lightbox ─────────────────────────────
  lightboxOpen    = signal<boolean>(false);
  lightboxSrc     = signal<SafeUrl>('');
  lightboxCaption = signal<string>('');

  openLightbox(media: MediaItem): void {
    // getSafeUrl est mis en cache donc pas de boucle infinie
    this.lightboxSrc.set(this.getSafeUrl('assets/file/' + media.url));
    this.lightboxCaption.set(media.legende ?? media.titre ?? '');
    this.lightboxOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  // ── CORRECTIF : force=false était inutile car l'expression était (force || true)
  // ce qui est toujours true. On supprime le paramètre force et on ferme toujours.
  closeLightbox(): void {
    this.lightboxOpen.set(false);
    document.body.style.overflow = '';
  }

  closeLightboxOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dept-lightbox')) {
      this.closeLightbox();
    }
  }

  // ── Gestion erreurs images ────────────────────
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const next = img.nextElementSibling as HTMLElement | null;
    if (next) next.style.display = 'flex';
  }

  onGalleryImgError(event: Event): void {
    const img  = event.target as HTMLImageElement;
    const wrap = img.closest('.dept-gal-item') as HTMLElement | null;
    if (wrap) {
      wrap.innerHTML = `
        <div class="dept-gal-item__placeholder">
          <span class="dept-gal-item__placeholder-icon">🖼️</span>
          Image indisponible
        </div>`;
    }
  }

  // ── Lifecycle ─────────────────────────────────
  async ngOnInit(): Promise<void> {
    document.addEventListener('keydown', this.onKeyDown);

    const idParam = this.route.snapshot.paramMap.get('id');
    const id      = parseInt(idParam ?? '', 10);

    if (!idParam || isNaN(id) || id <= 0) {
      this.router.navigate(['/404']);
      return;
    }

    this.idDepartement.set(id);

    try {
      // ── CORRECTIF : on appelle la méthode qui retourne l'objet directement,
      // et on fait le set() UNE SEULE FOIS ici dans ngOnInit.
      const data = await this.loadDepartement(id);
      this.departementForWebsite.set(data);
    } catch (err) {
      console.error('Erreur lors du chargement du département :', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKeyDown);
    document.body.style.overflow = '';
    this.safeUrlCache.clear();
  }

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.closeLightbox();
  };

  // ── Chargement des données ────────────────────
  // ── CORRECTIF : plus de set() intermédiaire dans cette méthode.
  // Elle se contente de charger et retourner les données.
  // Le set() du signal est fait une seule fois dans ngOnInit.
  private async loadDepartement(id: number): Promise<DepartementForWebsite> {
    const [d, chef, motChef, secteurs, filieres, debouches, medias] = await Promise.all([
      this.configService.getDepartementbyID(id).toPromise(),
      this.utilisateurService.getChefDepartementByID(id).toPromise(),
      this.configService.getMotByDepartement(id).toPromise(),
      this.configService.getAllSecteurActiviteByDepartement(id).toPromise(),
      this.configService.getAllFiliereByDepartement(id).toPromise(),
      this.configService.getAllDeboucheByDepartement(id).toPromise(),
      this.configService.getAllMediaByDepartement(id).toPromise(),
    ]);

    console.log('Departement construit :',{
      departement     : d!,
      chefDepartement : chef!,
      motChef         : motChef!,
      secteurActivites: secteurs!,
      filieres        : filieres!,
      debouches       : debouches!,
      medias          : medias!,
    } )
    return {
      departement     : d!,
      chefDepartement : chef!,
      motChef         : motChef!,
      secteurActivites: secteurs!,
      filieres        : filieres!,
      debouches       : debouches!,
      medias          : medias!,
    };
  }
}