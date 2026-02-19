export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
export class PaginationRequest {
  page: number = 1;
  pageSize: number = 10;
}
