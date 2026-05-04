import { Requete } from "./Requete";
import { TypePieceJointe } from "./TypePieceJointe";

export interface PieceJointeRequete{
    id : number ; 
    intitule :string; 
    url : string; 
    typePieceJointeRequete: TypePieceJointe; 
    requete :Requete; 
}