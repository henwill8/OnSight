import { Route } from "@/storage/routeStore";
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
export interface RouteInfo {
  id: string;
  name?: string;
  description?: string;
  difficulty: string;
  gymId: string;
  locationId?: string;
  creator: string;
  averageRating?: number;
  imageKey: string;
  annotationsKey: string;
  imageUrl: string;
  annotationsUrl: string;
  route?: Route; // not actually in the response, set during processing
}
