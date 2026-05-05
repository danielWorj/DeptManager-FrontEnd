import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Departement } from '../../../../Core/Model/Structure/Departement';
import { ConfigService } from '../../../../Core/Service/Config/config-service';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { Media } from '../../../../Core/Model/Structure/Media';
import { Filiere } from '../../../../Core/Model/Structure/Filiere';

// Référence Bootstrap via window pour éviter l'import de @types/bootstrap si absent
declare const bootstrap: any;

@Component({
  selector: 'app-departement-c',
  imports: [ReactiveFormsModule],
  templateUrl: './departement-c.html',
  styleUrl: './departement-c.css',
})
export class DepartementC {

  private sanitizer = inject(DomSanitizer);

  mediaFb!:         FormGroup;
  filiereForm!:     FormGroup;
  departementForm!: FormGroup;

  constructor(private fb: FormBuilder, private configService: ConfigService) {

    // ── Formulaire département (création + édition description/chef) ──
    this.departementForm = this.fb.group({
      id:          new FormControl(),
      abreviation: new FormControl(),
      intitule:    new FormControl(),
      description: new FormControl(),
      nomChef:     new FormControl(),
      motChef:     new FormControl(),
    });

    // ── Formulaire filière ──
    this.filiereForm = this.fb.group({
      id:          new FormControl(),
      abreviation: new FormControl(),
      intitule:    new FormControl(),
      departement: new FormControl(),
    });

    // ── Formulaire média ──
    this.mediaFb = this.fb.group({
      id:          new FormControl(),
      url:         new FormControl(),
      profil:      new FormControl(false),
      departement: new FormControl(),
    });

    this.loadPage();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Helpers Bootstrap Modal
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Ferme un modal secondaire et s'assure que le modal détail reste ouvert.
   * Si `reopenDetail` est true (par défaut), le modal détail est rouvert
   * proprement après la fermeture de l'enfant.
   */
  private closeSubModal(modalId: string, reopenDetail: boolean = true): void {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const instance = bootstrap.Modal.getInstance(modalEl);
      if (instance) {
        instance.hide();
      }
    }

    if (!reopenDetail) return;

    // CORRECTIF BUG 2 : après fermeture du modal enfant, on s'assure que
    // le modal détail est bien ouvert (Bootstrap le masque parfois).
    setTimeout(() => {
      const detailEl = document.getElementById('detailDepartementModal');
      if (!detailEl) return;

      let detailInstance = bootstrap.Modal.getInstance(detailEl);

      if (!detailInstance) {
        // Pas encore d'instance : en créer une et l'ouvrir
        detailInstance = new bootstrap.Modal(detailEl, { backdrop: 'static' });
        detailInstance.show();
      } else if (!detailEl.classList.contains('show')) {
        // Instance existante mais modal caché : le rouvrir
        detailInstance.show();
      } else {
        // Modal déjà visible : simplement rétablir scroll-lock + backdrop
        document.body.classList.add('modal-open');
        if (!document.querySelector('.modal-backdrop')) {
          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          document.body.appendChild(backdrop);
        }
      }
    }, 350); // attendre la fin de l'animation hide Bootstrap (~300ms)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Chargement initial
  // ────────────────────────────────────────────────────────────────────────────

  loadPage(): void {
    this.getAllDepartement();
    this.getAllFiliere();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Départements
  // ────────────────────────────────────────────────────────────────────────────

  listDepartement     = signal<Departement[]>([]);
  idDept              = signal<number>(0);
  departementSelected = signal<Departement | null>(null);


  urlImage = signal<SafeUrl>('/assets/file/placeholder.png');

  /** Valeur constante du placeholder pour ne pas dupliquer la chaîne. */
  private readonly PLACEHOLDER: SafeUrl = '/assets/file/placeholder.png';

  getAllDepartement(): void {
    this.configService.getAllDepartement().subscribe({
      next: (data: Departement[]) => this.listDepartement.set(data),
      error: () => console.error('Erreur fetch départements'),
    });
  }

  selectDepartement(d: Departement): void {
    this.idDept.set(d.id);
    this.departementSelected.set(d);

    // CORRECTIF BUG 1 : réinitialiser la photo au placeholder immédiatement.
    // getAllMedia() la mettra à jour uniquement si le département a un profil.
    this.urlImage.set(this.PLACEHOLDER);

    // Réinitialiser les prévisualisations locales
    this.revokePreviewUrls();
    this.previewProfilUrl.set(null);
    this.previewGalerieUrl.set(null);

    this.departementForm.patchValue({
      id:          d.id,
      abreviation: d.abreviation,
      intitule:    d.intitule,
      description: d.description ?? '',
      nomChef:     d.nomChef     ?? '',
      motChef:     d.motChef     ?? '',
    });

    this.getAllFiliereByDepartement(d.id);
    this.getAllMedia(d.id);
  }

  createDepartement(): void {
    const formData = new FormData();
    formData.append('departement', JSON.stringify(this.departementForm.value));
    this.configService.createDepartement(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data) {
          this.getAllDepartement();
          this.departementForm.reset();
        }
      },
      error: () => console.error('Erreur création département'),
    });
  }

  updateDepartement(sourceModalId: string): void {
    const formData = new FormData();
    formData.append('departement', JSON.stringify(this.departementForm.value));
    this.configService.createDepartement(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data) {
          const updated: Departement = {
            ...this.departementSelected()!,
            ...this.departementForm.value,
          };
          this.departementSelected.set(updated);
          this.getAllDepartement();
          // Fermer le modal secondaire → le modal détail reste visible
          this.closeSubModal(sourceModalId);
        }
      },
      error: () => console.error('Erreur mise à jour département'),
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Filières
  // ────────────────────────────────────────────────────────────────────────────

  listFiliere       = signal<Filiere[]>([]);
  listFiliereByDept = signal<Filiere[]>([]);

  getAllFiliere(): void {
    this.configService.getAllFiliere().subscribe({
      next: (data: Filiere[]) => {
        this.listFiliere.set(data);
        if (this.idDept() > 0) {
          this.getAllFiliereByDepartement(this.idDept());
        }
      },
      error: () => console.error('Erreur fetch filières'),
    });
  }

  getAllFiliereByDepartement(id: number): void {
    this.listFiliereByDept.set(
      this.listFiliere().filter(f => f.departement.id === id)
    );
  }

  createFiliere(): void {
    this.filiereForm.controls['departement'].setValue(this.departementSelected()?.id);
    const formData = new FormData();
    formData.append('filiere', JSON.stringify(this.filiereForm.value));
    this.configService.createFiliere(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data) {
          this.getAllFiliere();
          this.filiereForm.reset();
          // Fermer le modal filière → détail reste ouvert
          this.closeSubModal('filiereModal');
        }
      },
      error: () => console.error('Erreur création filière'),
    });
  }


  listMedia   = signal<Media[]>([]);
  mediaProfil = signal<Media | null>(null);

 
  private mediaUrlMap = new Map<number, SafeUrl>();

  
  private localObjectUrls: string[] = [];

  /** Révoque tous les ObjectURL locaux (libère la mémoire). */
  private revokePreviewUrls(): void {
    this.localObjectUrls.forEach(u => URL.revokeObjectURL(u));
    this.localObjectUrls = [];
  }

 
  getSafeMediaUrl(media: Media): SafeUrl {
    if (!this.mediaUrlMap.has(media.id)) {
      // CORRECTIF BUG 3 : ajouter un timestamp en query-param pour contourner
      // le cache navigateur lors d'un rechargement depuis le serveur.
      const cacheBuster = `?t=${Date.now()}`;
      const safe = this.sanitizer.bypassSecurityTrustUrl(
        'assets/file/' + media.url + cacheBuster
      );
      this.mediaUrlMap.set(media.id, safe);
    }
    return this.mediaUrlMap.get(media.id)!;
  }

  /**
   * URL de prévisualisation immédiate pour la photo profil.
   * Alimentée dès la sélection du fichier via onFileSelected().
   */
  previewProfilUrl  = signal<SafeUrl | null>(null);

  /**
   * URL de prévisualisation immédiate pour la galerie.
   */
  previewGalerieUrl = signal<SafeUrl | null>(null);

  /** Contexte de la sélection en cours : 'profil' | 'galerie' */
  private fileContext: 'profil' | 'galerie' = 'galerie';
  private selectedFile: File | null = null;

  /** Appelé par les deux inputs file. Le paramètre context distingue l'usage. */
  onFileSelected(event: Event, context: 'profil' | 'galerie' = 'galerie'): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.selectedFile = file;
    this.fileContext  = context;

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      // Mémoriser pour révocation ultérieure
      this.localObjectUrls.push(objectUrl);
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);

      if (context === 'profil') {
        this.previewProfilUrl.set(safeUrl);
      } else {
        this.previewGalerieUrl.set(safeUrl);
      }
    }
  }

  getAllMedia(id: number): void {
    this.configService.getAllMediaByDepartement(id).subscribe({
      next: (data: Media[]) => {
        

        this.listMedia.set(data);
        console.log('Médias chargés : ', data.length);
        this.mediaProfil.set(data.find(m => m.profil === true) ?? null);

        console.log('le media de profil est : ', this.mediaProfil());

        // // CORRECTIF BUG 1 : mettre à jour l'URL profil UNIQUEMENT si un média
        // // profil existe pour ce département. Sinon, conserver le placeholder.
        // const profil = data.find(m => m.profil === true);
        // if (profil) {
        //   this.urlImage.set(this.mediaUrlMap.get(profil.id)!);
        // } else {
        //   // Aucun profil → placeholder (évite d'afficher la photo du département précédent)
        //   this.urlImage.set(this.PLACEHOLDER);
        // }
      },
      error: (err) => console.error('Erreur fetch médias', err),
    });
  }

  changerPhotoProfil(): void {
    //alert("Changement de la photo de profil");

    
    if (!this.selectedFile) return;
    this.mediaFb.patchValue({
      departement: this.idDept(),
      profil:      true,
      url:         this.selectedFile.name,
    });
    const formData = new FormData();
    formData.append('media', JSON.stringify(this.mediaFb.value));
    formData.append('file',  this.selectedFile);
    this.configService.chargerPhotoProfil(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          // L'aperçu local est déjà visible via previewProfilUrl ;
          // on le pousse aussi dans urlImage pour la carte principale.
          if (this.previewProfilUrl()) {
            this.urlImage.set(this.previewProfilUrl()!);
          }
          // CORRECTIF BUG 3 : forcer le rechargement complet de la liste médias
          // avec de nouvelles SafeUrl (cache-buster) pour que l'image apparaisse.
          this.getAllMedia(this.idDept());
          this.selectedFile = null;
          this.closeSubModal('photoProfilModal');
          //alert("Photo de profil changée avec succès !");
        }
      },
      error: () => console.error('Erreur changement photo profil'),
    });
  }

  createMedia(): void {
    if (!this.selectedFile) return;

    const uploadedFile = this.selectedFile;

    this.mediaFb.patchValue({
      departement: this.idDept(),
      profil:      false,
      url:         uploadedFile.name,
    });
    const formData = new FormData();
    formData.append('media', JSON.stringify(this.mediaFb.value));
    formData.append('file',  uploadedFile);
    this.configService.createMedia(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          // CORRECTIF BUG 3 : créer une SafeUrl depuis l'ObjectURL local du
          // fichier uploadé. Cela affiche immédiatement l'image dans la galerie
          // sans attendre le serveur ni subir le cache navigateur.
          const objectUrl = URL.createObjectURL(uploadedFile);
          this.localObjectUrls.push(objectUrl);
          const safeNew = this.sanitizer.bypassSecurityTrustUrl(objectUrl);

          // Identifiant temporaire négatif unique (remplacé après getAllMedia)
          const tempId = -(Date.now());
          this.mediaUrlMap.set(tempId, safeNew);

          // Ajouter immédiatement le média dans la liste affichée → galerie
          // se met à jour instantanément sans attendre le serveur.
          const tempMedia: Media = {
            id:          tempId,
            url:         uploadedFile.name,
            profil:      false,
            departement: { id: this.idDept() } as any,
          };
          this.listMedia.set([...this.listMedia(), tempMedia]);

          this.mediaFb.reset();
          this.selectedFile = null;
          this.previewGalerieUrl.set(null);

          // CORRECTIF BUG 2 : fermer galerieModal ET rouvrir detailDepartementModal.
          this.closeSubModal('galerieModal', true);

          // Recharger la vraie liste depuis le serveur en arrière-plan
          // (remplace le média temporaire par le média avec son vrai id serveur).
          this.getAllMedia(this.idDept());
        }
      },
      error: () => console.error('Erreur upload média'),
    });
  }
}