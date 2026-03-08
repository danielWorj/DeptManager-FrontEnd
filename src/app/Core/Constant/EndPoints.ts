const api = "http://localhost:8080/deptmanager/api"; 
const structureapi = `${api}/structure`; 
const scolariteapi = `${api}/scolarite`; 
const horaireapi = `${api}/horaire`; 
const utilisateurapi = `${api}/utilisateur`; 
const evaluationapi = `${api}/note`; 



export const DeptManager ={
    
    Config: {
        Departement :{
            all : `${structureapi}/departement/all`,
            create : `${structureapi}/departement/create`,
            update : `${structureapi}/departement/update`,
            delete : `${structureapi}/departement/delete/`,
        }, 
        Filiere:{
            all : `${structureapi}/filiere/all`,
            allByDepartemet : `${structureapi}/filiere/all`,
            create : `${structureapi}/filiere/create`,
            update : `${structureapi}/filiere/update`,
            delete : `${structureapi}/filiere/delete`,
        }, 
        Niveau:{
            all : `${structureapi}/niveau/all`,
            create : `${structureapi}/niveau/create`,
            update : `${structureapi}/niveau/update`,
            delete : `${structureapi}/niveau/delete`,
        },
        Salle:{
            all : `${structureapi}/salle/all`,
            create : `${structureapi}/salle/create`,
            update : `${structureapi}/salle/update`,
            delete : `${structureapi}/salle/delete`,
        },
        Poste:{
            all : `${structureapi}/poste/all`,
            create : `${structureapi}/poste/create`,
            update : `${structureapi}/poste/update`,
            delete : `${structureapi}/poste/delete`,
        },
        AnneeAcademique :{
            all : `${structureapi}/anneeacademique/all`, 
        },
        TypeDocument :{
            all : `${structureapi}/typedocument/all`, 
        }
        
    }, 
    Scolarite :{
        Matiere:{
            all : `${scolariteapi}/matiere/all`,
            allByFiliere : `${scolariteapi}/matiere/all/byfiliere/`,
            allByDepartement : `${scolariteapi}/matiere/all/bydepartement/`,
            create : `${scolariteapi}/matiere/create`,
            update : `${scolariteapi}/matiere/update`,
            delete : `${scolariteapi}/matiere/delete`,
        },        
        Document :{
            all : `${scolariteapi}/document/all`, 
            count : `${scolariteapi}/document/count`, 
            create : `${scolariteapi}/document/create`, 
            update : `${scolariteapi}/document/update`, 
            delete : `${scolariteapi}/document/delete/`, 
            allbydepartement : `${scolariteapi}/document/bydepartement/`, 
            allbyniveau : `${scolariteapi}/document/byniveau/`, 
            allbyfiliere : `${scolariteapi}/document/byfiliere/`, 
            allbyanneeacademique : `${scolariteapi}/document/byanneeacademique/`, 
            allbyenseignant : `${scolariteapi}/document/byenseignant/`, 
            allbytypedocument : `${scolariteapi}/document/bytypedocument/`, 
        }, 
        Revendication :{
            Requete :{
                all : `${structureapi}/requete/all`, 
                create : `${structureapi}/requete/creation`, 
                update : `${structureapi}/requete/update`, 
                change : `${structureapi}/requete/change/`, 
                delete : `${structureapi}/requete/delete/`, 
            }, 
            MotifRequete:{
                all : `${structureapi}/requete/motif/all`, 
            }, 
            PieceJointe:{
                all : `${structureapi}/requete/all/piecejointe/`, 
                create : `${structureapi}/requete/piecejointe/create`, 
                update : `${structureapi}/requete/piecejointe/update`, 
            }, 
            

        }, 
        Repartition:{
            create : `${scolariteapi}/repartition/create`, 
            update : `${scolariteapi}/repartition/update`, 
            delete : `${scolariteapi}/repartition/delete/`, 
            allByEnseignant : `${scolariteapi}/repartition/all/byenseignant/`, 
            allByFiliere : `${scolariteapi}/repartition/all/byfiliere/`, 
            allByMatiere : `${scolariteapi}/repartition/all/bymatiere/`, 
            allBySemestre : `${scolariteapi}/repartition/all/bysemestre/`, 
            allByFiliereNiveau : `${scolariteapi}/repartition/all/by/filiere/niveau/`, 
            allByFiliereNiveauAndSemestre : `${scolariteapi}/repartition/all/by/filiere/niveau/semestre/`, 

        }, 
        Semestre:{
            all : `${scolariteapi}/semestre/all`,
            allbyAnnee : `${scolariteapi}/semestre/all/byannee`,
            create : `${scolariteapi}/semestre/create`,
            update : `${scolariteapi}/semestre/update`,
            delete : `${scolariteapi}/semestre/delete`,

        } 
        
    }, 
    Horaire:{
        create : `${horaireapi}/create`, 
        update : `${horaireapi}/update`, 
        allByFiliereAndNiveau : `${horaireapi}/all/byfiliere/andniveau/`, 
        allByEnseignant : `${horaireapi}/all/byenseignant/`, 

        Jour:{
            all : `${horaireapi}/jour/all`,
            create : `${horaireapi}/jour/create`,
            update : `${horaireapi}/jour/update`,
            delete : `${horaireapi}/jour/delete`,
        }, 
        Periode :{
            all : `${horaireapi}/periode/all`, 
            create : `${horaireapi}/periode/create`, 
            update : `${horaireapi}/periode/update`, 
            delete : `${horaireapi}/periode/delete`, 
        }
        
    },
    Utilisateur :{
        Enseignant :{
            all : `${utilisateurapi}/enseignant/all`, 
            count : `${utilisateurapi}/enseignant/count`, 
            create : `${utilisateurapi}/enseignant/create`, 
            update : `${utilisateurapi}/enseignant/update`, 
            allbydepartement : `${utilisateurapi}/enseignant/bydepartement/`, 
        }, 
        Etudiant :{
            all : `${utilisateurapi}/etudiant/all`, 
            count : `${utilisateurapi}/etudiant/count`,
            create : `${utilisateurapi}/etudiant/create`, 
            update : `${utilisateurapi}/etudiant/update`,  
            allbydepartement : `${utilisateurapi}/etudiant/bydepartement/`, 
            allbyniveau : `${utilisateurapi}/etudiant/byniveau/`, 
            allbyFiliereAndNiveau : `${utilisateurapi}/etudiant/byfiliere/byniveau/`, 
            allbyAnneeAndFiliereAndNiveau : `${utilisateurapi}/etudiant/byannee/byfiliere/byniveau/`, 
        }, 
    }, 
    Evaluaton:{
        TypeEvaluation:{
            all : `${evaluationapi}/typeevaluation/all`,
        }, 
        Note:{
            create : `${evaluationapi}/create`,
            update : `${evaluationapi}/update`,
            allByRepartition : `${evaluationapi}/find/all/byrepartition/`,
            allByRepartitionAndTypeEval : `${evaluationapi}/tfind/all/byrepartition/typeevaluation/`,
        }
    }
}