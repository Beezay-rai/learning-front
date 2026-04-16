export interface GatewayApiResponse {
  status: boolean;
  message: string;
}

export interface GatewayApiDataResponse<T> extends GatewayApiResponse {
  data: T;
}
