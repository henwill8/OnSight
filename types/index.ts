import { AnnotationsData } from "@/types/annotationTypes"

export interface Location {
  id: string;
  name: string;
}

export type BreadcrumbItem = Location;

export interface Gym {
  id: string;
  name: string;
  location: string; // separate from a gym location, this is the real world location of the gym
}

export interface CreateRouteData {
  name: string;
  description: string;
  difficulty: string;
  imageUri?: string | null;
  annotations?: AnnotationsData | null;
  locationId?: string;
}

export interface SaveRouteRequest extends CreateRouteData {}