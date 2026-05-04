import { Component, signal } from '@angular/core';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { AnneeAcademique } from '../../../Core/Model/Scolarite/anneeacademique';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { Semestre } from '../../../Core/Model/Scolarite/Semestre';
import { Note } from '../../../Core/Model/Evaluation/Note';
import { EvaluationService } from '../../../Core/Service/Evaluation/evaluation-service';

@Component({
  selector: 'app-notes-e',
  imports: [],
  templateUrl: './notes-e.html',
  styleUrl: './notes-e.css',
})
export class NotesE {

  idEtudiant = signal<number>(0); 
  constructor(private utilisateurService :UtilisateurService,private evaluationService : EvaluationService,   private scolariteService:ScolariteService , private configService:ConfigService){
    //this.idEtudiant.set(parseInt(sessionStorage.getItem("id")!));
    
    this.idEtudiant.set(2)
  }

  //GET ETUDIANT BY ID

  etudiantConnected = signal<Etudiant|null>(null); 
  getEtudiantById(id:number){
    this.utilisateurService.getEtudiantByID(id).subscribe({
      next:(data:Etudiant)=>{
        this.etudiantConnected.set(data)
      }, 
      error:(err)=>console.log('Fetch etudiant by id : failed'), 
    })
  }

  //GET NOTES 

  // GET ALL ANNEE ACADEMIQUE
  listAnne = signal<AnneeAcademique[]>([]);
  getAllAnneeAcad(){
    this.configService.getAllAnneeAcademique().subscribe({
      next:(data:AnneeAcademique[])=>{
        this.listAnne.set(data)
      }, 
      error:(err)=>console.log('Fetch annee acad: failed'), 
    })
  }

  anneeActive = signal<AnneeAcademique|null>(null);
  findAnneeActive(){
    this.anneeActive.set(this.listAnne().find(a=> a.status==true)!); 
  }
  // GET SEMESTRE  ACTIVE

  listSemestre = signal<Semestre[]>([]); 
  getSemestreActive(){
    this.scolariteService.getAllSemestre().subscribe({
      next:(data:Semestre[])=>{
        this.listSemestre.set(data.filter(s=> s.anneeAcademique.id==this.anneeActive()?.id)); 
      }, 
      error:(err)=>console.log('Fetch semestre active: failed'), 
    }); 
  }

  //GET NOTES ETUDIANT AND SEMESTRE
  listNote = signal<Note[]>([]); 
  getAllNoteByEtudiantAndSemestre(idEtudiant:number, idSemestre:number){
    this.evaluationService.getAllEtudiantAndSemestre(idEtudiant,idSemestre).subscribe({
      next:(data:Note[])=>{
        this.listNote.set(data); 
      }, 
      error:(err)=>console.log('Fetch note by etudiant and semestre active: failed'), 
    }); 
  }



}
