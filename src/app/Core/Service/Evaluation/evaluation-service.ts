import { Injectable } from '@angular/core';
import { TypeEvaluation } from '../../Model/Evaluation/TypeEvaluation';
import { DeptManager } from '../../Constant/EndPoints';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { Note } from '../../Model/Evaluation/Note';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  constructor(private http : HttpClient){}

  getAllTypeEvaluation():Observable<TypeEvaluation[]>{
    return this.http.get<TypeEvaluation[]>(DeptManager.Evaluaton.TypeEvaluation.all)
  }


  //Evaluation
  createNote(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Evaluaton.Note.create, request);
  }

  updateNote(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Evaluaton.Note.update, request);
  }

  getAllNotebyRepartition(id:number):Observable<Note[]>{
    return this.http.get<Note[]>(DeptManager.Evaluaton.Note.allByRepartition+id)
  }
  
  getAllNotbyeRepartitionAndTypeEvaluation(idR:number, idE:number):Observable<Note[]>{
    return this.http.get<Note[]>(DeptManager.Evaluaton.Note.allByRepartitionAndTypeEval+idR+'/'+idE); 
  }


   getAllEtudiantAndSemestre(idE:number, idS:number):Observable<Note[]>{
    return this.http.get<Note[]>(DeptManager.Evaluaton.Note.allByEtudiantAndSemestre+idE+'/'+idS); 
  }
  
  // Telecharger la liste des notes 
  telechargementByNote(idRepartition :number):Observable<Blob>{
    return this.http.get(DeptManager.Evaluaton.Note.impression+idRepartition, { responseType: 'blob' });
  }
}
