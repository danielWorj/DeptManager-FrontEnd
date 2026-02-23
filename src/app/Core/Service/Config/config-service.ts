import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Matiere } from '../../Model/Scolarite/Matiere';
import { DepartementC } from '../../../Components/Admin/Config/departement-c/departement-c';
import { DeptManager } from '../../Constant/EndPoints';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { Departement } from '../../Model/Structure/Departement';
import { Filiere } from '../../Model/Structure/Filiere';
import { Salle } from '../../Model/Structure/Salle';
import { Horaire } from '../../Model/Horaire/Horaire';
import { Niveau } from '../../Model/Structure/Niveau';
import { Jour } from '../../Model/Horaire/Jour';
import { Periode } from '../../Model/Horaire/Periode';
import { Poste } from '../../Model/Utilisateur/Poste';
import { AnneeAcademique } from '../../Model/Scolarite/anneeacademique';
import { TypeDocument } from '../../Model/Scolarite/TypeDocument';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private http:HttpClient){

  }
  //Departement 
  
  getAllDepartement():Observable<Departement[]>{
    return this.http.get<Departement[]>(DeptManager.Config.Departement.all)
  }

  createDepartement(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Departement.create,request);
  }

  updateDepartement(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Departement.update,request);
  }

  deleteDepartement(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Config.Departement.delete+id);
  }
  
  //Filiere
  
  getAllFiliere():Observable<Filiere[]>{
    return this.http.get<Filiere[]>(DeptManager.Config.Filiere.all)
  }

  createFiliere(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Filiere.create,request);
  }

  updateFiliere(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Filiere.update,request);
  }

  deleteFiliere(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Config.Filiere.delete+id);
  }
  
  //Salle 
  
  getAllSalle():Observable<Salle[]>{
    return this.http.get<Salle[]>(DeptManager.Config.Salle.all)
  }

  createSalle(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Salle.create,request);
  }

  updateSalle(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Salle.update,request);
  }

  deleteSalle(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Config.Salle.delete+id);
  }

   //Niveau 
  
  getAllNiveau():Observable<Niveau[]>{
    return this.http.get<Niveau[]>(DeptManager.Config.Niveau.all)
  }

  createNiveau(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Niveau.create,request);
  }

  updateNiveau(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Niveau.update,request);
  }

  deleteNiveau(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Config.Niveau.delete+id);
  }

  //Jour 
  
  getAllJour():Observable<Jour[]>{
    return this.http.get<Jour[]>(DeptManager.Horaire.Jour.all)
  }

  createJour(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Horaire.Jour.create,request);
  }

  updateJour(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Horaire.Jour.update,request);
  }

  deleteJour(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Horaire.Jour.delete+id);
  }


   //Periode 
  
  getAllPeriode():Observable<Periode[]>{
    return this.http.get<Periode[]>(DeptManager.Horaire.Periode.all)
  }

  createPeriode(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Horaire.Periode.create,request);
  }

  updatePeriode(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Horaire.Periode.update,request);
  }

  deletePeriode(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Horaire.Periode.delete+id);
  }

  //Poste 
  getAllPoste():Observable<Poste[]>{
    return this.http.get<Poste[]>(DeptManager.Config.Poste.all); 
  }

  createPoste(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Poste.create, request);
  }


  //

  getAllAnneeAcademique():Observable<AnneeAcademique[]>{
    return this.http.get<AnneeAcademique[]>(DeptManager.Config.AnneeAcademique.all); 
  }

  getAllTypeDocument():Observable<TypeDocument[]>{
    return this.http.get<TypeDocument[]>(DeptManager.Config.TypeDocument.all); 
  }
}
