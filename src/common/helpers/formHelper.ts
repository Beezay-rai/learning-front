export const constantsToSelectOptions = (constantObj: {
  [key: string]: string;
}) => {
  return Object.entries(constantObj).map(([key, value]) => ({
    label: key,
    value,
  }));
};
