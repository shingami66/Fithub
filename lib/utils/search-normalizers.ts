const ARABIC_EXERCISE_ALIASES: Record<string, string> = {
  صدر: 'chest',
  ظهر: 'back',
  كتف: 'shoulders',
  باي: 'biceps',
  تراي: 'triceps',
  رجل: 'legs',
  ارجل: 'legs',
  أرجل: 'legs',
  بطن: 'abs',
  سكوات: 'squat',
  بنش: 'bench',
  ضغط: 'push',
  سحب: 'pull',
  دامبل: 'dumbbell',
  بار: 'barbell',
};

const ARABIC_FOOD_ALIASES: Record<string, string> = {
  بيض: 'egg',
  تفاح: 'apple',
  موز: 'banana',
  رز: 'rice',
  دجاج: 'chicken',
  'صدر دجاج': 'chicken breast',
  شوفان: 'oats',
  لبن: 'milk',
  حليب: 'milk',
  زبادي: 'yogurt',
  لحم: 'beef',
  بطاطس: 'potato',
  سمك: 'fish',
  تونة: 'tuna',
  خبز: 'bread',
  جبن: 'cheese',
};

function normalizeWithAliases(query: string, aliases: Record<string, string>) {
  const trimmed = query.trim();
  if (!trimmed) return '';

  const phraseMatch = aliases[trimmed];
  if (phraseMatch) return phraseMatch;

  return trimmed
    .split(/\s+/)
    .map((token) => aliases[token] ?? token)
    .join(' ');
}

export function normalizeExerciseQuery(query: string) {
  return normalizeWithAliases(query, ARABIC_EXERCISE_ALIASES);
}

export function normalizeFoodQuery(query: string) {
  return normalizeWithAliases(query, ARABIC_FOOD_ALIASES);
}
