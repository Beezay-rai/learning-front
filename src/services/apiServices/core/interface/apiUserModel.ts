import { BaseEntity } from "./BaseEntity";

export interface ApiUserModel extends BaseEntity {
  name: string;
}

export interface ApiUserRequest {
  name: string;
}
