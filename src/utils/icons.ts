export function iconKeyForCategory(category: string) {
  switch (category) {
    case 'exercicios': return 'habits';
    case 'agua': return 'water';
    default: return 'setting';
  }
}

export function iconAssetForKey(key: string) {
  switch (key) {
    case 'habits': return require('../assets/images/habits.png');
    case 'water': return require('../assets/images/water.png');
    default: return require('../assets/images/setting.png');
  }
}
