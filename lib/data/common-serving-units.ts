import type { ServingUnitOption } from '../../types/nutrition';

export interface CommonServingUnitEntry {
  key: string;
  aliases: string[];
  blocklist: string[];
  units: ServingUnitOption[];
}

export const GRAM_SERVING_UNIT: ServingUnitOption = {
  unit: 'g',
  label: 'g',
  grams: 1,
};

export const COMMON_SERVING_UNITS: CommonServingUnitEntry[] = [
  {
    key: 'egg_whole',
    aliases: ['egg whole', 'whole egg', 'egg whole raw', 'egg whole cooked'],
    blocklist: ['white', 'yolk', 'noodle', 'noodles', 'roll', 'salad', 'substitute', 'powder'],
    units: [{ unit: 'piece', label: '1 large egg', grams: 50 }],
  },
  {
    key: 'rice_white_cooked',
    aliases: ['rice white cooked', 'white rice cooked', 'cooked white rice'],
    blocklist: ['cake', 'fried', 'noodle', 'noodles', 'paper', 'pudding', 'cracker', 'dressing'],
    units: [{ unit: 'cup', label: '1 cup cooked white rice', grams: 158 }],
  },
  {
    key: 'rice_brown_cooked',
    aliases: ['rice brown cooked', 'brown rice cooked', 'cooked brown rice'],
    blocklist: ['cake', 'fried', 'noodle', 'noodles', 'paper', 'pudding', 'cracker', 'dressing'],
    units: [{ unit: 'cup', label: '1 cup cooked brown rice', grams: 195 }],
  },
  {
    key: 'milk',
    aliases: ['milk', 'whole milk', 'lowfat milk', 'skim milk'],
    blocklist: ['chocolate', 'condensed', 'evaporated', 'powder', 'shake'],
    units: [{ unit: 'cup', label: '1 cup milk', grams: 244 }],
  },
  {
    key: 'banana',
    aliases: ['banana', 'banana raw'],
    blocklist: ['bread', 'chip', 'chips', 'muffin', 'pudding'],
    units: [{ unit: 'piece', label: '1 medium banana', grams: 118 }],
  },
  {
    key: 'apple',
    aliases: ['apple', 'apple raw'],
    blocklist: ['juice', 'pie', 'sauce', 'dried', 'butter'],
    units: [{ unit: 'piece', label: '1 medium apple', grams: 182 }],
  },
  {
    key: 'oats_rolled',
    aliases: ['oats rolled', 'rolled oats', 'oatmeal dry'],
    blocklist: ['cookie', 'bar', 'bread', 'muffin'],
    units: [{ unit: 'cup', label: '1 cup dry rolled oats', grams: 80 }],
  },
  {
    key: 'bread_slice',
    aliases: ['bread slice', 'slice bread', 'white bread', 'wheat bread', 'whole wheat bread'],
    blocklist: ['crumbs', 'crouton', 'pudding', 'stuffing'],
    units: [{ unit: 'slice', label: '1 slice bread', grams: 28 }],
  },
  {
    key: 'potato',
    aliases: ['potato baked', 'baked potato', 'potato boiled', 'boiled potato'],
    blocklist: ['chip', 'chips', 'fries', 'fried', 'salad'],
    units: [{ unit: 'piece', label: '1 medium potato', grams: 173 }],
  },
  {
    key: 'sweet_potato',
    aliases: ['sweet potato baked', 'baked sweet potato', 'sweet potato boiled'],
    blocklist: ['chip', 'chips', 'fries', 'fried', 'pie'],
    units: [{ unit: 'piece', label: '1 medium sweet potato', grams: 130 }],
  },
  {
    key: 'yogurt_plain',
    aliases: ['plain yogurt', 'yogurt plain'],
    blocklist: ['frozen', 'drink', 'flavored', 'vanilla', 'fruit'],
    units: [{ unit: 'cup', label: '1 cup plain yogurt', grams: 245 }],
  },
  {
    key: 'peanut_butter',
    aliases: ['peanut butter'],
    blocklist: ['powder', 'cookie', 'bar', 'candy'],
    units: [{ unit: 'tbsp', label: '1 tbsp peanut butter', grams: 16 }],
  },
  {
    key: 'olive_oil',
    aliases: ['olive oil', 'oil olive'],
    blocklist: ['spray', 'dressing', 'margarine'],
    units: [{ unit: 'tbsp', label: '1 tbsp olive oil', grams: 14 }],
  },
  {
    key: 'cheddar_cheese',
    aliases: ['cheddar cheese', 'cheese cheddar'],
    blocklist: ['sauce', 'powder', 'spread', 'soup'],
    units: [{ unit: 'slice', label: '1 slice cheddar', grams: 28 }],
  },
  {
    key: 'pasta_cooked',
    aliases: ['pasta cooked', 'cooked pasta', 'spaghetti cooked', 'macaroni cooked'],
    blocklist: ['salad', 'sauce', 'dry', 'uncooked'],
    units: [{ unit: 'cup', label: '1 cup cooked pasta', grams: 140 }],
  },
  {
    key: 'beans_cooked',
    aliases: ['beans cooked', 'black beans cooked', 'pinto beans cooked', 'kidney beans cooked'],
    blocklist: ['green', 'sprout', 'soup', 'dip'],
    units: [{ unit: 'cup', label: '1 cup cooked beans', grams: 172 }],
  },
  {
    key: 'lentils_cooked',
    aliases: ['lentils cooked', 'cooked lentils'],
    blocklist: ['soup', 'sprout', 'dry', 'uncooked'],
    units: [{ unit: 'cup', label: '1 cup cooked lentils', grams: 198 }],
  },
];

export const KNOWN_SERVING_UNITS = ['g', 'cup', 'piece', 'tbsp', 'slice'] as const;
