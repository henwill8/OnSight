export interface Route {
  id: string;
  imageUrl: string;
  annotationsUrl: string;
  name: string;
  description: string;
}

export interface Location {
  id: string;
  name: string;
}

export type BreadcrumbItem = Location;
