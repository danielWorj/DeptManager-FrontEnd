/** Valeurs des filtres actifs */
interface FilterState {
  search:      string;
  etudiantId:  number | null;
  departementId: number | null;
  filiereId:   number | null;
  motifId:     number | null;
  dateDebut:   string;
  dateFin:     string;
}