import { BaseEntity } from "./baseEntity";

export interface ApiUserModel extends BaseEntity {
  name: string;
}

export interface ApiUserRequest {
  name: string;
}
