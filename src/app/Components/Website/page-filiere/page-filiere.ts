import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { FiliereForWebsite } from '../../../Core/Model/Structure/Filiere';
import { Media } from '../../../Core/Model/Structure/Media';

@Component({
  selector: 'app-page-filiere',
  imports: [],
  templateUrl: './page-filiere.html',
  styleUrl: './page-filiere.css',
})
export class PageFiliere implements OnInit {
  idFiliere = signal<number>(0);
  filiereData = signal<FiliereForWebsite | undefined>(undefined);
  isLoading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private utilisateurService: UtilisateurService
  ) {}

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = parseInt(idParam ?? '', 10);

    if (!idParam || isNaN(id) || id <= 0) {
      this.router.navigate(['/404']);
      return;
    }

    this.idFiliere.set(id);

    try {
      this.filiereData.set(await this.constructFiliereToDisplay(id));
    } catch (err) {
      console.error('Erreur lors du chargement de la filière :', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async constructFiliereToDisplay(id: number): Promise<FiliereForWebsite> {
    let fil       = await this.configService.getFiliereById(id).toPromise();
    let debouches = await this.configService.getAllDeboucheByFiliere(id).toPromise();
    let medias    = await this.configService.getAllMediaByDepartement(id).toPromise();
    let secteurs  = await this.configService.getAllSecteurActiviteByDepartement(fil!.departement.id).toPromise();

    const profilMedia  = medias!.find(m => m.profil === true) ?? null;
    const autresMedias = medias!.filter(m => m.profil === false);

    const filiere: FiliereForWebsite = {
      filiere: fil!,
      debouches: debouches!,
      profil: profilMedia,
      medias: autresMedias,
      secteurActivite: secteurs,
    };

    console.log('Filière construite pour affichage :', filiere);
    return filiere;
  }

  filOpenLb(event: MouseEvent): void {
    const item  = event.currentTarget as HTMLElement;
    const img   = item.querySelector<HTMLImageElement>('.fil-gal-item__img');
    const cap   = item.getAttribute('data-caption') || '';
    const lb    = document.getElementById('fil-lightbox');
    const lbImg = document.getElementById('fil-lb-img') as HTMLImageElement;
    const lbCap = document.getElementById('fil-lb-caption');
    if (img && lbImg) { lbImg.src = img.src; lbImg.alt = img.alt; }
    if (lbCap) lbCap.textContent = cap;
    lb?.classList.add('fil-lb-open');
    document.body.style.overflow = 'hidden';
  }
}