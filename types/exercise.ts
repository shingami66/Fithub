export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  targetMuscle: string;
  equipment: string;
  gifUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  instructions: string[];
}
