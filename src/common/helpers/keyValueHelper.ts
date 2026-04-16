import { KeyValuePair } from "../types/keyValuePair";

export const addKeyValuePair = (
  list: KeyValuePair<string, string>[],
  setList: React.Dispatch<React.SetStateAction<KeyValuePair<string, string>[]>>
) => {
  setList([
    ...list,
    { id: Date.now().toString(), key: "", value: "", enabled: true },
  ]);
};

export const deleteKeyValuePair = (
  list: KeyValuePair<string, string>[],
  setList: React.Dispatch<React.SetStateAction<KeyValuePair<string, string>[]>>,
  id: string
) => {
  setList(list.filter((r) => r.id !== id));
};

export const updateKeyValuePair = (
  list: KeyValuePair<string, string>[],
  setList: React.Dispatch<React.SetStateAction<KeyValuePair<string, string>[]>>,
  id: string,
  field: "key" | "value" | "enabled",
  value: string | boolean
) => {
  setList(list.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
};
