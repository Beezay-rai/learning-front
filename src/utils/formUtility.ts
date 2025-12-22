export default class FormUtility {
  static enumToSelectOptions(enumObject: Record<string, string | number>) {
    return Object.keys(enumObject)
      .filter((key) => isNaN(Number(key)))
      .map((key) => ({
        label: key,
        value: enumObject[key as keyof typeof enumObject],
      }));
  }
}
