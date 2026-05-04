import { Debouche } from "./Debouche";
import { Departement } from "./Departement";
import { Media } from "./Media";
import { SecteurActivite } from "./SecteurActivite";

export interface Filiere{
    id  : number; 
    intitule : string ; 
    abreviation : string; 
    description : string ; 
    departement : Departement; 
}

export interface FiliereForWebsite{
    filiere : Filiere; 
    debouches : Debouche[]; 
    profil : Media | null; //Image de profil 
    medias : Media[]; 
    secteurActivite ?: SecteurActivite[];
}

export interface FiliereForList{
    departement : Departement; 
    filieres : Filiere[];
}