export interface Route {
  id: string;
  imageUrl: string;
  annotationsUrl: string;
  name: string;
  description: string;
  difficulty: string;
}

export interface Location {
  id: string;
  name: string;
}

export type BreadcrumbItem = Location;

export interface Gym {
  id: string;
  name: string;
  location: string;
}

export interface Template {
  id: string;
  imageUrl: string;
  annotationsUrl: string;
}

export interface CreateRouteData {
  name: string;
  description: string;
  difficulty: string;
  imageUri: string;
  annotationsJSON: string;
  locationId?: string;
}
