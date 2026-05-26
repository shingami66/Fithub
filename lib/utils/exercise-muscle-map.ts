export const BODY_PARTS = [
  'back',
  'cardio',
  'chest',
  'lower arms',
  'lower legs',
  'neck',
  'shoulders',
  'upper arms',
  'upper legs',
  'waist',
] as const;

export const TARGETS = [
  'abductors',
  'abs',
  'adductors',
  'biceps',
  'calves',
  'cardiovascular system',
  'delts',
  'forearms',
  'glutes',
  'hamstrings',
  'lats',
  'levator scapulae',
  'pectorals',
  'quads',
  'serratus anterior',
  'spine',
  'traps',
  'triceps',
  'upper back',
] as const;

// Map our UI tabs to one or more API bodyPart values.
// We strictly use validated bodyPart values from ExerciseDB.
export const MUSCLE_TAB_MAPPING: Record<string, string[]> = {
  chest: ['chest'],
  back: ['back'],
  legs: ['upper legs', 'lower legs'],
  shoulders: ['shoulders'],
  arms: ['upper arms', 'lower arms'],
  abs: ['waist'], // 'abs' is a target, but 'waist' is the corresponding bodyPart
};
