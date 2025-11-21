import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import coreApiClient from "./coreApiClient";
import { coreAPIRoutes } from "./coreApiRoutes";
import {
  RestApiBuilderModel,
  RestApiBuilderRequest,
} from "./interface/restApiBuilderModel";
import { CoreApiDataResponse, CoreApiResponse } from "./common/coreApiResponse";
import { AxiosResponse } from "axios";

/**
 * Query Keys
 */
const QUERY_KEYS = {
  restApiBuilders: ["core", "restApiBuilders"] as const,
  restApiBuilderById: (id: number) => ["core", "restApiBuilder", id] as const,
};

/**
 * API Functions
 */
const fetchRestApiBuilders = async (): Promise<
  PaginatedResponse<RestApiBuilderModel>
> => {
  const { data } = await coreApiClient.get<
    PaginatedResponse<RestApiBuilderModel>
  >(coreAPIRoutes.builder.restApi);
  return data;
};

const fetchRestApiBuilderById = async (
  id: number
): Promise<AxiosResponse<CoreApiDataResponse<RestApiBuilderModel>>> => {
  const response = await coreApiClient.get<
    CoreApiDataResponse<RestApiBuilderModel>
  >(`${coreAPIRoutes.builder.restApi}/${id}`);
  return response;
};

const createRestApiBuilder = async (
  payload: RestApiBuilderRequest
): Promise<CoreApiDataResponse<RestApiBuilderModel>> => {
  const { data } = await coreApiClient.post<
    CoreApiDataResponse<RestApiBuilderModel>
  >(coreAPIRoutes.builder.restApi, payload);
  return data;
};

const updateRestApiBuilder = async ({
  id,
  payload,
}: {
  id: number;
  payload: RestApiBuilderRequest;
}): Promise<CoreApiDataResponse<RestApiBuilderModel>> => {
  const { data } = await coreApiClient.put<
    CoreApiDataResponse<RestApiBuilderModel>
  >(coreAPIRoutes.builder.restApi + "/" + id, payload);
  return data;
};

const deleteRestApiBuilder = async (id: number): Promise<CoreApiResponse> => {
  const { data } = await coreApiClient.delete<CoreApiResponse>(
    coreAPIRoutes.builder.restApi + "/" + id
  );
  return data;
};

const coreApiService = {
  useGetRestApiBuilders: (
    options?: Omit<
      UseQueryOptions<PaginatedResponse<RestApiBuilderModel>, Error>,
      "queryKey" | "queryFn"
    >
  ): UseQueryResult<PaginatedResponse<RestApiBuilderModel>, Error> => {
    return useQuery({
      queryKey: QUERY_KEYS.restApiBuilders,
      queryFn: fetchRestApiBuilders,
      ...options,
    });
  },

  useGetRestApiBuilderById: (
    id: number,
    options?: Omit<
      UseQueryOptions<
        CoreApiDataResponse<RestApiBuilderModel>,
        Error,
        CoreApiDataResponse<RestApiBuilderModel>,
        readonly ["core", "restApiBuilder", number]
      >,
      "queryKey" | "queryFn"
    >
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.restApiBuilderById(id),
      queryFn: async () => {
        const data = await fetchRestApiBuilderById(id);
        return data as unknown as CoreApiDataResponse<RestApiBuilderModel>;
      },
      enabled: !!id && id > 0,
      ...options,
    });
  },

  useAddRestApiBuilder: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: createRestApiBuilder,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restApiBuilders });
      },
    });
  },

  useUpdateRestApiBuilder: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: updateRestApiBuilder,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restApiBuilders });
      },
    });
  },

  useDeleteRestApiBuilder: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: deleteRestApiBuilder,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restApiBuilders });
      },
    });
  },
};

export default coreApiService;
