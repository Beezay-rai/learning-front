import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import coreApiClient from "./coreApiClient";
import { coreAPIRoutes } from "./coreApiRoutes";
import {
  RestApiBuilderModel,
  RestApiBuilderRequest,
} from "./interface/restApiBuilderModel";

const getRestApiBuilders = async (): Promise<
  PaginatedResponse<RestApiBuilderModel>
> => {
  const response = await coreApiClient.get<
    PaginatedResponse<RestApiBuilderModel>
  >(coreAPIRoutes.builder.restApi);
  return response.data;
};

const addRestApiBuilders = async (data: RestApiBuilderRequest) => {
  const response = await coreApiClient.post(
    coreAPIRoutes.builder.restApi,
    data
  );
  return response.data;
};

const coreApiService = {
  useGetRestApiBuilder: () => {
    return useQuery<PaginatedResponse<RestApiBuilderModel>>({
      queryKey: ["core", "getRestApiBuilders"],
      queryFn: getRestApiBuilders,
    });
  },
  useAddRestApiBuilder: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: addRestApiBuilders,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["getRestApiBuilders"] });
      },
    });
  },
};

export default coreApiService;
