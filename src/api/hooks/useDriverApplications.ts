import { useMutation } from "@tanstack/react-query";

import { apiFetchClient } from "../client.fetch";
import type {
  DriverApplicationPayload,
  DriverApplicationResponse,
} from "../types";

export const useCreateDriverApplication = () =>
  useMutation<
    DriverApplicationResponse,
    Error,
    DriverApplicationPayload
  >({
    mutationFn: async (payload) => {
      const response = await apiFetchClient.post<DriverApplicationResponse>(
        "/driver-applications",
        payload,
      );

      return response.data;
    },
  });
