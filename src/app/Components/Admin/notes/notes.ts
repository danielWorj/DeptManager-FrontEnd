import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { EvaluationService } from '../../../Core/Service/Evaluation/evaluation-service';
import { Repartition } from '../../../Core/Model/Scolarite/Repartition';
import { Note } from '../../../Core/Model/Evaluation/Note';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-notes',
  imports: [ReactiveFormsModule],
  templateUrl: './notes.html',
  styleUrl: './notes.css',
})
export class NotesC {
  noteFb !:FormGroup; 
  idEnseignant = signal<number>(0); 
  constructor(private fb : FormBuilder, private scolariteService: ScolariteService, private evaluationService : EvaluationService){
    this.noteFb = this.fb.group({
      id : new FormControl(), 
      note : new FormControl(), 
      repartition : new FormControl(), 
      tyeEvaluation : new FormControl(), 
      etudiant : new FormControl(), 
    }); 


    this.idEnseignant.set(0); 

    //this.idEnseignant.set(sessionStorage.getItem('id'));

  }

  //liste des repartitions d'un enseignant 
  listRepartition = signal<Repartition[]>([]); 
  getAllRepartitionByParent(id:number){
    this.scolariteService.getAllRepartitionByEnseignant(id).subscribe({
      next:(data:Repartition[])=>this.listRepartition.set(data), 
      error:(err)=>console.log('Fetch repartition : failed')
    }); 
  }
  
  idRepartitionSelected =0; 
  selectRepartition(event:Event){
    this.idRepartitionSelected = Number((event.target as HTMLSelectElement).value);
  }

  listNoteByRepartition = signal<Note[]>([]); 
  getAllNoteByRepartition(id:number){
    this.evaluationService.getAllNotebyRepartition(id).subscribe({
      next:(data:Note[])=>this.listNoteByRepartition.set(data), 
      error:(err)=>console.log('Fecth list note : failed')
    });
  }


  createNote(){
    const formData : FormData = new FormData(); 

    this.noteFb.controls['repartition'].setValue(this.idRepartitionSelected);
    console.log(this.noteFb.value); 

    this.evaluationService.createNote(formData).subscribe({
      next:(data:ResponseServer)=>{
        console.log('Note ajoutee avec success'); 
        this.getAllNoteByRepartition(this.idRepartitionSelected); 
        this.noteFb.reset(); 
      }
    }); 
  }

  


}
