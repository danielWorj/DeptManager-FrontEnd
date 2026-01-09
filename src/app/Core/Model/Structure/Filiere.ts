import { Departement } from "./Departement";

export interface Filiere{
    id  : number; 
    intitule : string ; 
    abreviation : string; 
    description : string ; 
    departement : Departement; 
}