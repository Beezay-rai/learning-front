import { BaseEntity } from "./baseEntity";

export interface ApiUserModel extends BaseEntity {
  name: string;
}

export interface ApiUserRequest {
  name: string;
  userName: string;
  password: string;
}

export interface ApiUserKeyModel {
  keyName: string;
  permissions: string;
  apiKey: string;
}

export interface ApiUserKeyRequest {
  keyName: string;
  permissions: string;
}
