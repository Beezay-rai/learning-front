export interface UserModel {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}

export interface AddUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
}

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
}
