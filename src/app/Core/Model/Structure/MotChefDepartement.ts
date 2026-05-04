import { ChefDepartement } from "./ChefDepartement";
import { Departement } from "./Departement";

export interface MotChefDepartement{
    id:number;
    chef :ChefDepartement; 
    departement : Departement; 
    enonce :string; 
}