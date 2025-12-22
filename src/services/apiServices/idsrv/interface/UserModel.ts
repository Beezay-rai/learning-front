import { UserType } from "../enums/UserType";

export interface UserModel {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  role_id: string;
  role_name: string;
  user_type_id: number;
  user_type: UserType;
  email_confirmed: boolean;
  active: boolean;
}

export interface AddUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  user_type: UserType;
  phone_number: string;
}

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  user_type: UserType;
  phone_number: string;
}
