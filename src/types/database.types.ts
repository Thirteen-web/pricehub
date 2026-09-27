export interface Grupe {
  id: number;
  naziv: string;
}

export interface Artikli {
  id: number;
  naziv: string;
  cijena: number;
  grupa_id: number | null;
  normativ: string | null;
  datum_unosa: string;
  sidrena_cijena: number | null;
  grupe?: Grupe | null; // Poveznica na veznu tablicu grupe
}
