import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiFetchClient } from "../client.fetch";
import type {
  ChecklistStepResponse,
  PreRideChecklistSummaryResponse,
  SubmitDriverPhotoChecklistPayload,
  SubmitExteriorChecklistPayload,
  SubmitInteriorChecklistPayload,
  SubmitPreRideChecklistResponse,
  SubmitVehicleHealthChecklistPayload,
} from "../types";

export const DRIVER_APP_CHECKLISTS_PATH = "/driver-app/checklists";

export const PRE_RIDE_CHECKLIST_SUMMARY_QUERY_KEY = [
  "pre-ride-checklist-summary",
] as const;

const buildChecklistPath = (tripId: string, step: string) =>
  `${DRIVER_APP_CHECKLISTS_PATH}/${encodeURIComponent(tripId)}/${step}`;

const getPreRideChecklistSummaryQueryKey = (tripId?: string) => [
  ...PRE_RIDE_CHECKLIST_SUMMARY_QUERY_KEY,
  tripId,
];

export const usePreRideChecklistSummary = (tripId?: string) =>
  useQuery<PreRideChecklistSummaryResponse, Error>({
    queryKey: getPreRideChecklistSummaryQueryKey(tripId),
    queryFn: async () => {
      if (!tripId) {
        throw new Error("Missing trip ID.");
      }

      const response =
        await apiFetchClient.get<PreRideChecklistSummaryResponse>(
          buildChecklistPath(tripId, "summary"),
        );

      return response.data;
    },
    enabled: Boolean(tripId),
    staleTime: 15_000,
  });

export const useSubmitExteriorChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ChecklistStepResponse,
    Error,
    { payload: SubmitExteriorChecklistPayload; tripId: string }
  >({
    mutationFn: async ({ payload, tripId }) => {
      const response = await apiFetchClient.post<
        ChecklistStepResponse,
        SubmitExteriorChecklistPayload
      >(buildChecklistPath(tripId, "exterior"), payload);

      return response.data;
    },
    onSuccess: (_response, { tripId }) => {
      void queryClient.invalidateQueries({
        queryKey: getPreRideChecklistSummaryQueryKey(tripId),
      });
    },
  });
};

export const useSubmitInteriorChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ChecklistStepResponse,
    Error,
    { payload: SubmitInteriorChecklistPayload; tripId: string }
  >({
    mutationFn: async ({ payload, tripId }) => {
      const response = await apiFetchClient.post<
        ChecklistStepResponse,
        SubmitInteriorChecklistPayload
      >(buildChecklistPath(tripId, "interior"), payload);

      return response.data;
    },
    onSuccess: (_response, { tripId }) => {
      void queryClient.invalidateQueries({
        queryKey: getPreRideChecklistSummaryQueryKey(tripId),
      });
    },
  });
};

export const useSubmitVehicleHealthChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ChecklistStepResponse,
    Error,
    { payload: SubmitVehicleHealthChecklistPayload; tripId: string }
  >({
    mutationFn: async ({ payload, tripId }) => {
      const response = await apiFetchClient.post<
        ChecklistStepResponse,
        SubmitVehicleHealthChecklistPayload
      >(buildChecklistPath(tripId, "vehicle-health-check"), payload);

      return response.data;
    },
    onSuccess: (_response, { tripId }) => {
      void queryClient.invalidateQueries({
        queryKey: getPreRideChecklistSummaryQueryKey(tripId),
      });
    },
  });
};

export const useSubmitDriverPhotoChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ChecklistStepResponse,
    Error,
    { payload: SubmitDriverPhotoChecklistPayload; tripId: string }
  >({
    mutationFn: async ({ payload, tripId }) => {
      const response = await apiFetchClient.post<
        ChecklistStepResponse,
        SubmitDriverPhotoChecklistPayload
      >(buildChecklistPath(tripId, "driver-photo"), payload);

      return response.data;
    },
    onSuccess: (_response, { tripId }) => {
      void queryClient.invalidateQueries({
        queryKey: getPreRideChecklistSummaryQueryKey(tripId),
      });
    },
  });
};

export const useSubmitPreRideChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SubmitPreRideChecklistResponse,
    Error,
    { tripId: string }
  >({
    mutationFn: async ({ tripId }) => {
      const response =
        await apiFetchClient.post<SubmitPreRideChecklistResponse>(
          buildChecklistPath(tripId, "submit"),
        );

      return response.data;
    },
    onSuccess: (_response, { tripId }) => {
      void queryClient.invalidateQueries({
        queryKey: getPreRideChecklistSummaryQueryKey(tripId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["driver-trip", tripId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["driver-trips"],
      });
    },
  });
};
