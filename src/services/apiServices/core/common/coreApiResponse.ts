export interface CoreApiResponse {
  status: boolean;
  message: string;
}

export interface CoreApiDataResponse<T> extends CoreApiResponse {
  data: T;
}

