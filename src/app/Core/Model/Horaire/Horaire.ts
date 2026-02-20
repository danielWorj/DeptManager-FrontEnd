import { Filiere } from "../Structure/Filiere";
import { Matiere } from "../Scolarite/Matiere";
import { Niveau } from "../Structure/Niveau";
import { Salle } from "../Structure/Salle";
import { Enseignant } from "../Utilisateur/Enseignant";
import { Jour } from "./Jour";
import { Periode } from "./Periode";

export interface Horaire{
    id :number; 
    enseignant : Enseignant;
    filiere : Filiere;
    niveau : Niveau ;
    matiere : Matiere; 
    salle :Salle;
    jour : Jour; 
    periode : Periode;  
}