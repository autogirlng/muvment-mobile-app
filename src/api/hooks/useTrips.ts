import { useQuery } from "@tanstack/react-query";

import { apiFetchClient } from "../client.fetch";
import type {
  DriverTripDetailsResponse,
  DriverTripsQueryParams,
  DriverTripsResponse,
} from "../types";

export const DRIVER_APP_TRIPS_PATH = "/driver-app/trips";

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_SIZE = 10;

const buildDriverTripsPath = ({
  endDate,
  page = DEFAULT_PAGE,
  search,
  size = DEFAULT_PAGE_SIZE,
  startDate,
  tripStatus,
}: DriverTripsQueryParams) => {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("size", String(size));

  if (tripStatus) {
    params.set("tripStatus", tripStatus);
  }

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  if (startDate) {
    params.set("startDate", startDate);
  }

  if (endDate) {
    params.set("endDate", endDate);
  }

  return `${DRIVER_APP_TRIPS_PATH}?${params.toString()}`;
};

const buildDriverTripPath = (id: string) =>
  `${DRIVER_APP_TRIPS_PATH}/${encodeURIComponent(id)}`;

export const useDriverTrips = (params: DriverTripsQueryParams = {}) =>
  useQuery<DriverTripsResponse, Error>({
    queryKey: ["driver-trips", params],
    queryFn: async () => {
      const response = await apiFetchClient.get<DriverTripsResponse>(
        buildDriverTripsPath(params),
      );

      return response.data;
    },
    staleTime: 30_000,
  });

export const useDriverTrip = (id?: string) =>
  useQuery<DriverTripDetailsResponse, Error>({
    queryKey: ["driver-trip", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing trip ID.");
      }

      const response = await apiFetchClient.get<DriverTripDetailsResponse>(
        buildDriverTripPath(id),
      );

      return response.data;
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
