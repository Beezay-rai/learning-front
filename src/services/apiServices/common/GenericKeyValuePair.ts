export interface GenericKeyValuePair {
  key: string;
  value: string;
}

export interface TypeGenericKeyValuePair extends GenericKeyValuePair {
  type: string;
}
