//const api = "https://deptmanager-backend.onrender.com/deptmanager/api"; 

const api = "http://localhost:8080/deptmanager/api";

const authapi = `${api}/auth`; 
const actualiteapi = `${api}/actualite`; 
const structureapi = `${api}/structure`; 
const scolariteapi = `${api}/scolarite`; 
const horaireapi = `${api}/horaire`; 
const utilisateurapi = `${api}/utilisateur`; 
const evaluationapi = `${api}/note`; 

const ai = "http://localhost:5000/api/";


export const DeptManager ={
    
    Config: {
        Departement :{
            all : `${structureapi}/departement/all`,
            byId : `${structureapi}/departement/byId/`,
            create : `${structureapi}/departement/create`,
            update : `${structureapi}/departement/update`,
            delete : `${structureapi}/departement/delete/`,
        }, 
        Filiere:{
            all : `${structureapi}/filiere/all`,
            allByDepartemet : `${structureapi}/filiere/all/bydepartement/`,
            byId: `${structureapi}/filiere/byId/`,
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
        }, 
        MotChefDepartement:{
            byDepartement : `${structureapi}/motchef/findby/dept/`,
            create : `${structureapi}/motchef/create`,
            update : `${structureapi}/motchef/update`,
            delete : `${structureapi}/motchef/delete/`,
        },
        SecteurActivite:{
            allbydept : `${structureapi}/secteuractivite/allbydept/`,
            byId : `${structureapi}/secteuractivite/byId/`,
            create : `${structureapi}/secteuractivite/create`,
            update : `${structureapi}/secteuractivite/update`,
            delete : `${structureapi}/secteuractivite/delete/`,
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
                allbyetudiant : `${structureapi}/requete/all/byetudiant/`, 
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
            all : `${scolariteapi}/repartition/all`, 
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
        all : `${horaireapi}/all`, 
        create : `${horaireapi}/create`, 
        update : `${horaireapi}/update`, 
        allByFiliereAndNiveau : `${horaireapi}/all/byfiliere/andniveau/`, 
        allByEnseignant : `${horaireapi}/all/byenseignant/`, 
        allByRepartition : `${horaireapi}/all/byrepartition/`, 
        allBySalleJourAndPeriode : `${horaireapi}/all/bysalle/jour/periode/`, 
        impression : `${horaireapi}/impression/`, 

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
            delete : `${utilisateurapi}/enseignant/delete`, 
            byId : `${utilisateurapi}/enseignant/byId/`,  
            allbydepartement : `${utilisateurapi}/enseignant/bydepartement/`, 
            countByDepaterment : `${utilisateurapi}/enseignant/countbydept/`,
            countByFiliere : `${utilisateurapi}/enseignant/countbyfil/`,
        }, 
        Etudiant :{
            all : `${utilisateurapi}/etudiant/all`, 
            count : `${utilisateurapi}/etudiant/count`,
            create : `${utilisateurapi}/etudiant/create`, 
            update : `${utilisateurapi}/etudiant/update`,  
            delete : `${utilisateurapi}/etudiant/delete/`,  
            byId : `${utilisateurapi}/etudiant/byid/`,  
            allbydepartement : `${utilisateurapi}/etudiant/bydepartement/`, 
            countByDepaterment : `${utilisateurapi}/etudiant/countbydept/`, 
            countByFiliere : `${utilisateurapi}/etudiant/countbyfil/`,
            allbyniveau : `${utilisateurapi}/etudiant/byniveau/`, 
            allbyFiliereAndNiveau : `${utilisateurapi}/etudiant/byfiliere/byniveau/`, 
            allbyAnneeAndFiliereAndNiveau : `${utilisateurapi}/etudiant/byannee/byfiliere/byniveau/`, 
        }, 
        ChefDepartement:{
            all : `${utilisateurapi}/chefdept/all`, 
            create : `${utilisateurapi}/chefdept/create`, 
            update : `${utilisateurapi}/chefdept/update`, 
            byIdDept : `${utilisateurapi}/chefdept/byidDept/`, 
        }
    }, 
    Evaluaton:{
        TypeEvaluation:{
            all : `${evaluationapi}/typeevaluation/all`,
        }, 
        Note:{
            create : `${evaluationapi}/create`,
            update : `${evaluationapi}/update`,
            allByRepartition : `${evaluationapi}/find/all/byrepartition/`,
            allByEtudiantAndSemestre : `${evaluationapi}/find/all/etudiant/semestre/`,
            allByRepartitionAndTypeEval : `${evaluationapi}/tfind/all/byrepartition/typeevaluation/`,
            impression : `${evaluationapi}/impression/byrepartition/`,
        }
    }, 
    Auth:{
        baslogin : `${authapi}/login`, 
    }, 
    Media :{
        create : `${structureapi}/media/create`, 
        allByDepartement : `${structureapi}/media/all/bydepartement/`, 
        chargerprofil : `${structureapi}/media/charger-image-dept`, 
        delete : `${structureapi}/media/delete/`,
    }, 
    Actualite:{
        all : `${actualiteapi}/all`, 
        last03 : `${actualiteapi}/last10`, 
        create : `${actualiteapi}/create`, 
        update : `${actualiteapi}/update`, 
        delete : `${actualiteapi}/delete/`, 
        vedette : `${actualiteapi}/vedette/`, 
        
        CategorieActualite:{
            all : `${actualiteapi}/categorie/all`, 
            create : `${actualiteapi}/categorie/create`, 
            update : `${actualiteapi}/categorie/update`, 
            delete : `${actualiteapi}/categorie/delete/`, 
        }
 
    }, 
    Debouche :{
        allByFiliere : `${structureapi}/debouche/byfiliere/`,
        allByDepartement : `${structureapi}/debouche/bydepartement/`,
        create : `${structureapi}/debouche/create/`,
        update : `${structureapi}/debouche/update/`,
        delete : `${structureapi}/debouche/delete/`,
    }, 
    AILllm :{
        status : `${ai}status`,
        indexDocument : `${ai}index`,
        query : `${ai}query`,
    }
}