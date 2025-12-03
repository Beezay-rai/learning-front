export interface IdsrvApiResponse {
  status: boolean;
  message: string;
}

export interface IdsrvApiDataResponse<T> extends IdsrvApiResponse {
  data: T;
}
