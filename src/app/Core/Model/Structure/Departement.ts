import { ChefDepartement } from "./ChefDepartement";
import { Debouche } from "./Debouche";
import { Filiere } from "./Filiere";
import { Media } from "./Media";
import { MotChefDepartement } from "./MotChefDepartement";
import { SecteurActivite } from "./SecteurActivite";

export interface Departement{
    id : number; 
    abreviation : string ; 
    intitule : string ; 
    description : string ;  
    motChef : string ;
    nomChef : string ;
    admission :string;
}


export interface DepartementConstruct {
    departement : Departement; 
    profil : Media; 
    medias : Media[]; 
}


export interface DepartementForWebsite{
    departement : Departement; 
    chefDepartement : ChefDepartement;
    motChef : MotChefDepartement ; 
    secteurActivites : SecteurActivite[]; 
    filieres: Filiere[] ; 
    debouches : Debouche[]; 
    medias : Media[]; 

}

export interface DepartementForList{
    departement : Departement, 
    mediaProfil : Media; 
    filieres : Filiere[]; 
    nombreEnseignants : number ; 
    nombreEtudiants : number ; 

}