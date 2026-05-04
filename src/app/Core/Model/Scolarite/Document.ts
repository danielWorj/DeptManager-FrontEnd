import { Departement } from "../Structure/Departement";
import { Filiere } from "../Structure/Filiere";
import { Niveau } from "../Structure/Niveau";
import { Enseignant } from "../Utilisateur/Enseignant";
import { AnneeAcademique } from "./anneeacademique";
import { Matiere } from "./Matiere";
import { TypeDocument } from "./TypeDocument";

export interface Documentation{
    id : number ; 
    url : string ; 
    dateC : string ; 
    typeDocument : TypeDocument; 
    matiere : Matiere;
    enseignant : Enseignant; 
    departement : Departement; 
    filiere : Filiere; 
    niveau : Niveau; 
    anneeAcademique : AnneeAcademique; 
}