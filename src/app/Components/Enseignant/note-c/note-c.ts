import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EvaluationService } from '../../../Core/Service/Evaluation/evaluation-service';
import { TypeEvaluation } from '../../../Core/Model/Evaluation/TypeEvaluation';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Note } from '../../../Core/Model/Evaluation/Note';

@Component({
  selector: 'app-note-c',
  imports: [],
  templateUrl: './note-c.html',
  styleUrl: './note-c.css',
})
export class NoteC {
  noteFb!:FormGroup;
  constructor(private fb:FormBuilder, private evaluationService : EvaluationService){

    this.noteFb = this.fb.group({
      id : new FormControl(),
      note : new FormControl(),
      repartition : new FormControl(),
      typeEvaluation : new FormControl(),
      etudiant : new FormControl(),
    }); 

    this.loadPage(); 
  }


  loadPage(){

  }

  listTypeEvaluation = signal<TypeEvaluation[]>([]); 
  getAllTypeEvaluation(){
    this.evaluationService.getAllTypeEvaluation().subscribe({
      next:(resp:TypeEvaluation[])=>this.listTypeEvaluation.set(resp), 
      error:(err)=>console.log('Erreur fetch type evaluation : failed')
    });
  }

  listNote = signal<Note[]>([]); 
  getAllNoteByRepartition(id:number){
    this.evaluationService.getAllNotebyRepartition(id).subscribe({
      next:(resp:Note[])=>this.listNote.set(resp), 
      error:(err)=>console.log('Erreur fetch list note by repartition : failed')
    });
  }

  getAllNoteByRepartitionAndTypeEvaluation(idR:number, idT:number){
    this.evaluationService.getAllNotbyeRepartitionAndTypeEvaluation(idR, idT).subscribe({
      next:(resp:Note[])=>this.listNote.set(resp), 
      error:(err)=>console.log('Erreur fetch list note by repartition and type evaluation : failed')
    });
  }

  createNote(){
    const formData : FormData = new FormData(); 

    formData.append("note", JSON.stringify(this.noteFb.value)); 
    
    this.evaluationService.createNote(formData).subscribe({
      next:(resp:ResponseServer)=>{
        if (resp.status) {
          console.log(resp.message); 
        }
      }, 
      error:(err)=>console.log('Erreur fetch type evaluation : failed')
    });
  }

}
