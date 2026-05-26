import {
  COMMON_SERVING_UNITS,
  GRAM_SERVING_UNIT,
  type CommonServingUnitEntry,
} from '../data/common-serving-units';
import type { ServingUnit, ServingUnitOption } from '../../types/nutrition';

interface FoodNameSource {
  name: string;
}

const DIAGNOSTIC_NAMES = new Set([
  'egg whole raw',
  'rice white cooked',
  'rice cake',
  'egg noodles',
  'chicken fried rice',
]);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeFoodName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasWordPhrase(normalizedName: string, phrase: string) {
  const normalizedPhrase = normalizeFoodName(phrase);
  if (!normalizedPhrase) return false;
  if (normalizedName === normalizedPhrase) return true;

  return new RegExp(`(^|\\s)${escapeRegExp(normalizedPhrase)}(\\s|$)`).test(normalizedName);
}

function isBlocked(entry: CommonServingUnitEntry, normalizedName: string) {
  return entry.blocklist.some((term) => hasWordPhrase(normalizedName, term));
}

function findServingUnitEntry(normalizedName: string) {
  return COMMON_SERVING_UNITS.find((entry) => {
    if (isBlocked(entry, normalizedName)) return false;
    return entry.aliases.some((alias) => hasWordPhrase(normalizedName, alias));
  });
}

export function getServingUnitsForFood(food: FoodNameSource): ServingUnitOption[] {
  const normalizedName = normalizeFoodName(food.name);
  const entry = findServingUnitEntry(normalizedName);
  const units = entry ? [GRAM_SERVING_UNIT, ...entry.units] : [GRAM_SERVING_UNIT];

  if (process.env.NODE_ENV === 'development' && DIAGNOSTIC_NAMES.has(normalizedName)) {
    console.info('[serving-units]', {
      name: food.name,
      normalizedName,
      match: entry?.key ?? 'grams_only',
      units: units.map((unit) => unit.unit),
    });
  }

  return units;
}

export function isKnownServingUnit(value: string): value is ServingUnit {
  return (
    value === 'g' || value === 'cup' || value === 'piece' || value === 'tbsp' || value === 'slice'
  );
}

export function getServingUnitOption(food: FoodNameSource, unit: string) {
  return getServingUnitsForFood(food).find((option) => option.unit === unit);
}
