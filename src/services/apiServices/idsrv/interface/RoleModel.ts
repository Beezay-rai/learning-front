import { PaginationRequest } from "../../common/PaginationModel";

export interface RoleModel {
  id: string;
  name: string;
  description: string;
  userType: string;
}

export interface AddRoleRequest {
  name: string;
  description: string;
  userTypeId: number;
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
  userTypeId?: number;
}

export interface GetAllRoleFilterModel extends PaginationRequest {
  userTypeId?: number;
}
