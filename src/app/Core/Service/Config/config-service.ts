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
import { Semestre } from '../../Model/Scolarite/Semestre';
import { Media } from '../../Model/Structure/Media';
import { Actualite } from '../../Model/Actualite/Actualite';
import { CategorieActualite } from '../../Model/Actualite/CategorieActualite';
import { Debouche } from '../../Model/Structure/Debouche';
import { MotChefDepartement } from '../../Model/Structure/MotChefDepartement';
import { SecteurActivite } from '../../Model/Structure/SecteurActivite';

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
  getDepartementbyID(id:number):Observable<Departement>{
    return this.http.get<Departement>(DeptManager.Config.Departement.byId+id);
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

  getFiliereById(id:number):Observable<Filiere>{
    return this.http.get<Filiere>(DeptManager.Config.Filiere.byId+id);
  }


  getAllFiliereByDepartement(id:number):Observable<Filiere[]>{
    return this.http.get<Filiere[]>(DeptManager.Config.Filiere.allByDepartemet+id); 
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


  //Media
  createMedia(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Media.create, request); 
  }

  chargerPhotoProfil(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Media.chargerprofil, request); 
  }

  getAllMediaByDepartement(id:number):Observable<Media[]>{
    return this.http.get<Media[]>(DeptManager.Media.allByDepartement+id); 
  }

  deleteMedia(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Media.delete+id); 
  }

  //Actualite 
  getAllActualite():Observable<Actualite[]>{
    return this.http.get<Actualite[]>(DeptManager.Actualite.all); 
  }

  getLast03Actualite():Observable<Actualite[]>{
    return this.http.get<Actualite[]>(DeptManager.Actualite.last03); 
  }
  createActualite(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Actualite.create, request); 
  }

  updateActualite(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Actualite.update, request); 
  }

  changeActualiteStatus(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Actualite.vedette+id); 
  }


  deleteActualite(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Actualite.delete+id); 
  }


  //CATEGORIE ACTUALITE 
  
  getAllCategorieActualite():Observable<CategorieActualite[]>{
    return this.http.get<CategorieActualite[]>(DeptManager.Actualite.CategorieActualite.all); 
  }

  createCategorieActualite(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Actualite.CategorieActualite.create, request); 
  }

  updateCategorieActualite(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Actualite.CategorieActualite.update, request); 
  }

  deleteCategorieActualite(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Actualite.CategorieActualite.delete+id); 
  }

 //DEBOUCHE 
  getAllDeboucheByFiliere(id:number):Observable<Debouche[]>{
    return this.http.get<Debouche[]>(DeptManager.Debouche.allByFiliere+id); 
  }

  getAllDeboucheByDepartement(id:number):Observable<Debouche[]>{
    return this.http.get<Debouche[]>(DeptManager.Debouche.allByDepartement+id); 
  }

  createDebouche(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Debouche.create, request); 
  }

  updateDebouche(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Actualite.update, request); 
  }

  deleteDebouche(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Debouche.delete+id); 
  }


  //MOT CHEF DE DEPARTEMENT 
  getMotByDepartement(id:number):Observable<MotChefDepartement>{
    return this.http.get<MotChefDepartement>(DeptManager.Config.MotChefDepartement.byDepartement+id); 
  }

  createMotChef(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.MotChefDepartement.create, request); 
  }

  updateMotChef(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.MotChefDepartement.update, request); 
  }

  deleteMotChef(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Config.MotChefDepartement.delete+id); 
  }

  //SECTEUR ACTIVITE 
  getAllSecteurActiviteByDepartement(id:number):Observable<SecteurActivite[]>{
    return this.http.get<SecteurActivite[]>(DeptManager.Config.SecteurActivite.allbydept+id); 
  }

  createSecteurActivite(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.SecteurActivite.create, request); 
  }

  updateSecteurActivite(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.SecteurActivite.update, request); 
  }

  deleteSecteurActivite(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Config.SecteurActivite.delete+id); 
  }



}
