import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiFetchClient } from "../client.fetch";
import type {
  ChecklistStepResponse,
  DriverTripDetailsResponse,
  DriverTripStatus,
  PostRideChecklistAggregateResponse,
  PreRideChecklistSummaryResponse,
  SubmitDriverPhotoChecklistPayload,
  SubmitExteriorChecklistPayload,
  SubmitInteriorChecklistPayload,
  SubmitPreRideChecklistResponse,
  SubmitVehicleHealthChecklistPayload,
  TransitionDriverTripStatusResponse,
} from "../types";

export const DRIVER_APP_CHECKLISTS_PATH = "/driver-app/checklists";

export const PRE_RIDE_CHECKLIST_SUMMARY_QUERY_KEY = [
  "pre-ride-checklist-summary",
] as const;

export const POST_RIDE_CHECKLIST_AGGREGATE_QUERY_KEY = [
  "post-ride-checklist-aggregate",
] as const;

const buildChecklistPath = (tripId: string, step: string) =>
  `${DRIVER_APP_CHECKLISTS_PATH}/${encodeURIComponent(tripId)}/${step}`;

const buildTransitionPath = (
  tripId: string,
  driverTripStatus: DriverTripStatus,
) => {
  const params = new URLSearchParams();

  params.set("driverTripStatus", driverTripStatus);

  return `${buildChecklistPath(tripId, "transition")}?${params.toString()}`;
};

const logChecklistSubmit = ({
  checklistType,
  photoCount,
  step,
  tripId,
}: {
  checklistType?: string;
  photoCount?: number;
  step: string;
  tripId: string;
}) => {
  if (!__DEV__) {
    return;
  }

  console.log("[checklist:submit]", {
    checklistType,
    photoCount,
    step,
    tripId,
  });
};

const getPreRideChecklistSummaryQueryKey = (tripId?: string) => [
  ...PRE_RIDE_CHECKLIST_SUMMARY_QUERY_KEY,
  tripId,
];

const getPostRideChecklistAggregateQueryKey = (tripId?: string) => [
  ...POST_RIDE_CHECKLIST_AGGREGATE_QUERY_KEY,
  tripId,
];

const invalidateChecklistQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  tripId: string,
) => {
  void queryClient.invalidateQueries({
    queryKey: getPreRideChecklistSummaryQueryKey(tripId),
  });
  void queryClient.invalidateQueries({
    queryKey: getPostRideChecklistAggregateQueryKey(tripId),
  });
};

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

export const usePostRideChecklistAggregate = (tripId?: string) =>
  useQuery<PostRideChecklistAggregateResponse, Error>({
    queryKey: getPostRideChecklistAggregateQueryKey(tripId),
    queryFn: async () => {
      if (!tripId) {
        throw new Error("Missing trip ID.");
      }

      const response =
        await apiFetchClient.get<PostRideChecklistAggregateResponse>(
          buildChecklistPath(tripId, "aggregate"),
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
      logChecklistSubmit({
        checklistType: payload.checklistType,
        photoCount: payload.uploadPhotos.length,
        step: "exterior",
        tripId,
      });

      const response = await apiFetchClient.post<
        ChecklistStepResponse,
        SubmitExteriorChecklistPayload
      >(buildChecklistPath(tripId, "exterior"), payload);

      return response.data;
    },
    onSuccess: (_response, { tripId }) => {
      invalidateChecklistQueries(queryClient, tripId);
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
      logChecklistSubmit({
        checklistType: payload.checklistType,
        photoCount: payload.uploadPhotos.length,
        step: "interior",
        tripId,
      });

      const response = await apiFetchClient.post<
        ChecklistStepResponse,
        SubmitInteriorChecklistPayload
      >(buildChecklistPath(tripId, "interior"), payload);

      return response.data;
    },
    onSuccess: (_response, { tripId }) => {
      invalidateChecklistQueries(queryClient, tripId);
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
      logChecklistSubmit({
        photoCount: payload.uploadPhotos.length,
        step: "vehicle-health-check",
        tripId,
      });

      const response = await apiFetchClient.post<
        ChecklistStepResponse,
        SubmitVehicleHealthChecklistPayload
      >(buildChecklistPath(tripId, "vehicle-health-check"), payload);

      return response.data;
    },
    onSuccess: (_response, { tripId }) => {
      invalidateChecklistQueries(queryClient, tripId);
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
      logChecklistSubmit({
        photoCount: payload.uploadPhotos.length,
        step: "driver-photo",
        tripId,
      });

      const response = await apiFetchClient.post<
        ChecklistStepResponse,
        SubmitDriverPhotoChecklistPayload
      >(buildChecklistPath(tripId, "driver-photo"), payload);

      return response.data;
    },
    onSuccess: (_response, { tripId }) => {
      invalidateChecklistQueries(queryClient, tripId);
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
      logChecklistSubmit({
        step: "submit",
        tripId,
      });

      const response =
        await apiFetchClient.post<SubmitPreRideChecklistResponse>(
          buildChecklistPath(tripId, "submit"),
        );

      return response.data;
    },
    onSuccess: (_response, { tripId }) => {
      invalidateChecklistQueries(queryClient, tripId);
      void queryClient.invalidateQueries({
        queryKey: ["driver-trip", tripId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["driver-trips"],
      });
    },
  });
};

export const useTransitionDriverTripStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TransitionDriverTripStatusResponse,
    Error,
    { driverTripStatus: DriverTripStatus; tripId: string }
  >({
    mutationFn: async ({ driverTripStatus, tripId }) => {
      const response =
        await apiFetchClient.put<TransitionDriverTripStatusResponse>(
          buildTransitionPath(tripId, driverTripStatus),
        );

      return response.data;
    },
    onSuccess: (response, { tripId }) => {
      queryClient.setQueryData<DriverTripDetailsResponse>(
        ["driver-trip", tripId],
        (currentTrip) => {
          if (!currentTrip?.data) {
            return currentTrip;
          }

          return {
            ...currentTrip,
            data: {
              ...currentTrip.data,
              driverTripStatus: response.data.driverTripStatus,
            },
          };
        },
      );
      invalidateChecklistQueries(queryClient, tripId);
      void queryClient.invalidateQueries({
        queryKey: ["driver-trip", tripId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["driver-trips"],
      });
    },
  });
};
