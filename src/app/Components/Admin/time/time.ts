import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HoraireService } from '../../../Core/Service/Horaire/horaire-service';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import e from 'express';
import { error } from 'console';
import { Filiere } from '../../../Core/Model/Structure/Filiere';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { Niveau } from '../../../Core/Model/Structure/Niveau';
import { Matiere } from '../../../Core/Model/Scolarite/Matiere';
import { Salle } from '../../../Core/Model/Structure/Salle';
import { Jour } from '../../../Core/Model/Horaire/Jour';
import { Periode } from '../../../Core/Model/Horaire/Periode';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant';
import { Horaire } from '../../../Core/Model/Horaire/Horaire';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';

@Component({
  selector: 'app-time',
  imports: [ReactiveFormsModule],
  templateUrl: './time.html',
  styleUrl: './time.css',
})
export class Time {

  timeForm!:FormGroup; 

  constructor(private fb:FormBuilder,
    private configService : ConfigService , 
    private scolariteService : ScolariteService, 
    private utilisateurService : UtilisateurService,  
    private horaireService:HoraireService ){
    this.timeForm = this.fb.group({
      id:new FormControl(),
      enseignant:new FormControl(),
      filiere:new FormControl(),
      niveau:new FormControl(),
      matiere:new FormControl(),
      salle:new FormControl(),
      jour:new FormControl(),
      periode:new FormControl(),
    });

    this.loadPage();
  }

  loadPage(){
    this.getAllFiliere();
    this.getAllEnseignant();
    this.getAllNiveau(); 
    this.getAllMatiere(); 
    this.getAllJour(); 
    this.getAllPeriode(); 
    this.getAllSalle(); 
  }
  listFiliere = signal<Filiere[]>([]); 
  getAllFiliere(){
    this.configService.getAllFiliere().subscribe({
      next : (data:Filiere[])=>{
        this.listFiliere.set(data)
      }, 
      error:()=>{
        console.log('Fecth list filiere : failed'); 
      }
    })
  }

  listNiveau = signal<Niveau[]>([]); 
  getAllNiveau(){
    this.configService.getAllNiveau().subscribe({
      next : (data:Niveau[])=>{
        this.listNiveau.set(data)
      }, 
      error:()=>{
        console.log('Fecth list Niveau : failed'); 
      }
    })
  }

  listMatiere = signal<Matiere[]>([]); 
  getAllMatiere(){
    this.scolariteService.getAllMatiere().subscribe({
      next : (data:Matiere[])=>{
        this.listMatiere.set(data)
      }, 
      error:()=>{
        console.log('Fecth list Matiere : failed'); 
      }
    })
  }

  listSalle = signal<Salle[]>([]); 
  getAllSalle(){
    this.configService.getAllSalle().subscribe({
      next : (data:Salle[])=>{
        this.listSalle.set(data)
      }, 
      error:()=>{
        console.log('Fecth list Salle : failed'); 
      }
    });
  }

  listJour = signal<Jour[]>([]); 
  getAllJour(){
    this.configService.getAllJour().subscribe({
      next : (data:Jour[])=>{
        this.listJour.set(data)
      }, 
      error:()=>{
        console.log('Fecth list Jour : failed'); 
      }
    })
  }

  listPeriode = signal<Periode[]>([]); 
  getAllPeriode(){
    this.configService.getAllPeriode().subscribe({
      next : (data:Periode[])=>{
        this.listPeriode.set(data)
      }, 
      error:()=>{
        console.log('Fecth list Periode : failed'); 
      }
    })
  }

  listEnseignant = signal<Enseignant[]>([]); 
  getAllEnseignant(){
    this.utilisateurService.getAllEnseignant().subscribe({
      next : (data:Enseignant[])=>{
        this.listEnseignant.set(data)
      }, 
      error:()=>{
        console.log('Fecth list Enseignant : failed'); 
      }
    })
  }

 

  listHoraire = signal<Horaire[]>([]); 
  findHoraireByEnseignant(event :any){
    let id = event.target.value;

    this.horaireService.getAllHoraireByEnseignant(id).subscribe({
      next:(data :Horaire[])=>{
        this.listHoraire.set(data); 
      }, 
      error:()=>{
        console.log('fetch list horaire : failed'); 
      }
    }); 
  }

  idFiliere = signal<number>(0);
  idNiveau = signal<number>(0); 

  getIdFiliere(event:any){
    this.idFiliere.set(event.target.value); 
    this.fecthFiliereById(event.target.value); 
  }

  getIdNiveau(event:any){
    let id= event.target.value; 
    this.idNiveau.set(id); 
    this.fecthNiveauById(id); 
    if (this.idFiliere()!=0 && this.idNiveau()!=0) {
      console.log('fecth horaire '); 
      this.findHoraireByFiliereAndNiveau(this.idFiliere(), this.idNiveau()); 
    }
  }

  filiereSelected = signal<Filiere |undefined>(undefined)
  fecthFiliereById(id:number){
    for(const f of this.listFiliere()){
      if (f.id==id) {
        this.filiereSelected.set(f); 
      }
    }
    console.log('la filiere fecth :', this.filiereSelected); 
  }

  niveauSelected = signal<Niveau |undefined>(undefined)
  fecthNiveauById(id:number){
    for(const n of this.listNiveau()){
      if (n.id==id) {
        this.niveauSelected.set(n); 
      }
    }
    console.log('la filiere fecth :', this.filiereSelected); 
  }



  findHoraireByFiliereAndNiveau(idF:number , idN:number){
    
    this.horaireService.getAllHoraireByFiliereAndNiveau(idF,idN).subscribe({
      next:(data :Horaire[])=>{
        this.listHoraire.set(data); 
      }, 
      error:()=>{
        console.log('fetch list horaire : failed'); 
      }
    }); 

  }

  idFiliereForm = 0; 
  getFiliere(event:any){
    this.idFiliereForm = event.target.value;
    this.getAllMatiereByFiliere();  
  }

  idNiveauForm =0; 
  getNiveau(event:any){
    this.idNiveauForm = event.target.value; 
  }

  getAllMatiereByFiliere(){
     this.scolariteService.getAllMatiereByFiliere(this.idFiliereForm).subscribe({
      next:(data:Matiere[])=>{
        this.listMatiere.set(data); 
        console.log('List matiere', this.listMatiere());
      }, 
      error:()=>{
        console.log('list matiere by filiere : failed'); 
      }
    });

  }

  createHoraire(){
    const formData : FormData = new FormData(); 

    this.timeForm.controls['filiere'].setValue(this.idFiliereForm); 
    this.timeForm.controls['niveau'].setValue(this.idNiveauForm); 
    console.log(this.timeForm.value); 

    formData.append("horaire",JSON.stringify(this.timeForm.value)); 

    this.horaireService.createHoraire(formData).subscribe({
      next:(data:ResponseServer)=>{
        if(data.status){
          console.log(data.message); 
          this.findHoraireByFiliereAndNiveau(this.idFiliereForm, this.idNiveauForm); 
          
        }
      }, 
      error:()=>{
        console.log('creation horaire : failed'); 
      }
    });
  }

  resetForm(){
    this.timeForm.reset(); 
  }

  toggleToEdit(){
    this.isImpression.set(false);
  }
  isImpression=signal<boolean>(false); 
  toggleToImpression(){
    this.isImpression.set(true);

  }

}
