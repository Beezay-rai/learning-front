// autoMap.ts
export function mapMatchingKeys<TSource extends object, TTarget extends object>(
  source: TSource
): Partial<TTarget> {
  const result = {} as Partial<TTarget>;

  if (!source) return result; // safety for null/undefined

  // iterate over keys of the target type
  for (const key of Object.keys(result) as (keyof TTarget)[]) {
    // do nothing here, result is empty, so we need a trick
  }

  // Instead, iterate keys of source and assign only if key exists in TTarget
  for (const key in source) {
    // only assign if key exists in TTarget
    if (key in ({} as TTarget)) {
      (result as any)[key] = source[key];
    }
  }

  return result;
}
