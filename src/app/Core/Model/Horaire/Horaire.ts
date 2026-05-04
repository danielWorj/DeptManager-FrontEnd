import { Filiere } from "../Structure/Filiere";
import { Matiere } from "../Scolarite/Matiere";
import { Niveau } from "../Structure/Niveau";
import { Salle } from "../Structure/Salle";
import { Enseignant } from "../Utilisateur/Enseignant";
import { Jour } from "./Jour";
import { Periode } from "./Periode";
import { Repartition } from "../Scolarite/Repartition";

export interface Horaire{
    id :number; 
    repartition :Repartition; 
    salle :Salle;
    jour : Jour; 
    periode : Periode;  
}