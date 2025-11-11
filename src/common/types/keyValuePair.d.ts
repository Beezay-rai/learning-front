export interface KeyValuePair<K, V> {
  id: string;
  key: K;
  value: V;
  enabled: boolean;
}

export interface KeyValuePairWithType<K, V> extends KeyValuePair<K, V> {
  type: string;
}
