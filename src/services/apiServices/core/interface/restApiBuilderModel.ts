import { HttpMethod } from "@/common/types/httpmethod";
import { BaseEntity } from "../../api-gateway/interfaces/common/BaseEntitiy";
import {
  GenericKeyValuePair,
  TypeGenericKeyValuePair,
} from "../../common/GenericKeyValuePair";

export interface RestApiBuilderModel extends BaseEntity {
  name: string;
  url: string;
  method: HttpMethod;
  description?: string;
}

export interface RestApiBuilderRequest {
  name: string;
  url: string;
  description?: string;
  method: HttpMethod;
  params?: GenericKeyValuePair[];
  headers?: TypeGenericKeyValuePair[];
}
