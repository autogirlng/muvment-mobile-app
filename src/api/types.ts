export type ApiStatus = "SUCCESSFUL";

export type DriverApplicationStatus = "PENDING";
export type DriverTripStatus =
  | "NOT_STARTED"
  | "CHECKED_IN"
  | "AWAITING_PICKUP"
  | "RUNNING_LATE"
  | "ONGOING"
  | "EXTRA_TIME"
  | "COMPLETE"
  | "CANCELLED";

export interface ApiResponse<TData> {
  status: ApiStatus;
  message: string;
  errorCode?: string;
  data: TData;
  timestamp: string;
}

export interface ApiMessageResponse {
  status: ApiStatus;
  message: string;
  errorCode?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  status?: string;
  message?: string | string[];
  timestamp?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginRoute {
  id: string;
  name: string;
  href: string;
  iconName: string;
  path: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  canSeeApi: boolean;
  roles: string[];
  organizations: string[];
  accessibleRoutes: LoginRoute[];
  emailVerified: boolean;
  phoneVerified: boolean;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
}

export type RefreshTokenResponse = ApiResponse<RefreshTokenResponseData>;

export interface ForgotPasswordPayload {
  email: string;
}

export type ForgotPasswordResponse = ApiMessageResponse;

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export type ResetPasswordResponse = ApiMessageResponse;

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: string;
  driverIdentifier: string;
  canSeeApi: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export type UserProfileResponse = ApiResponse<UserProfile>;

export interface DriverNotificationSettings {
  sendNotification: boolean;
  driverId: string;
  userId: string;
}

export type DriverNotificationSettingsResponse =
  ApiResponse<DriverNotificationSettings>;

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export type ChangePasswordResponse = ApiMessageResponse;

export interface DriverApplicationPayload {
  fullName: string;
  email: string;
  primaryPhoneNumber: string;
  alternativePhoneNumber?: string;
  yearsOfExperience: number;
}

export interface DriverApplicationResponseData {
  id: string;
  fullName: string;
  email: string;
  primaryPhoneNumber: string;
  alternativePhoneNumber: string;
  yearsOfExperience: number;
  status: DriverApplicationStatus;
  createdAt: string;
}

export type DriverApplicationResponse =
  ApiResponse<DriverApplicationResponseData>;

export interface PaginatedApiResponseData<TData> {
  content: TData[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type NotificationType = "INFO" | "WARNING" | "ERROR" | "SUCCESS";
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH";

export interface UserNotification {
  createdAt: string;
  updatedAt?: string | null;
  id: string;
  title: string;
  isRead: boolean;
  message: string;
  entityId?: string | null;
  entityName?: string | null;
  type: NotificationType;
  priority: NotificationPriority;
  isDeleted: boolean;
}

export interface UserNotificationsPage {
  content: UserNotification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export type UserNotificationsResponse =
  ApiResponse<UserNotificationsPage>;

export type MarkNotificationReadResponse =
  ApiResponse<Record<string, never>>;

export interface DriverTrip {
  id: string;
  vehicleId?: string | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  vehicleIdentifier?: string | null;
  vehicleName?: string | null;
  primaryVehicleImage?: string | null;
  driverName?: string | null;
  driverPhoneNumber?: string | null;
  tripDuration?: number | null;
  city?: string | null;
  pickupLocation?: string | null;
  customerName?: string | null;
  bookingTypeName?: string | null;
  driverOwnerType?: string | null;
  createdAt?: string | null;
  tripCustomId?: string | null;
  tripStatus?: DriverTripStatus | null;
  status?: DriverTripStatus | null;
}

export interface DriverTripLocation {
  lat?: number | null;
  lng?: number | null;
  location?: string | null;
}

export interface DriverTripDetails {
  id: string;
  vehicleId?: string | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  vehicleIdentifier?: string | null;
  vehicleName?: string | null;
  primaryVehicleImage?: string | null;
  driverName?: string | null;
  driverPhoneNumber?: string | null;
  tripDuration?: number | null;
  city?: string | null;
  pickupLocation?: DriverTripLocation | null;
  dropOffLocation?: DriverTripLocation | null;
  customerName?: string | null;
  customerPhoneNumber?: string | null;
  bookingTypeName?: string | null;
  driverOwnerType?: string | null;
  tripCustomId?: string | null;
}

export interface DriverTripsQueryParams {
  page?: number;
  size?: number;
  tripStatus?: DriverTripStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export type DriverTripsResponse =
  ApiResponse<PaginatedApiResponseData<DriverTrip>>;

export type DriverTripDetailsResponse = ApiResponse<DriverTripDetails>;

export type ExteriorUploadImage =
  | "FRONT"
  | "BACK"
  | "LEFT_SIDE"
  | "RIGHT_SIDE"
  | "DAMAGE";

export type InteriorUploadImage =
  | "DASHBOARD"
  | "DRIVER_SIDE"
  | "PASSENGER"
  | "REAR_SEATS"
  | "BOOT";

export type VehicleHealthCheckPhoto =
  | "OIL_LEVEL"
  | "COOLANT_LEVEL"
  | "SAFETY_EQUIPMENT";

export type ChecklistType = "PRE_TRIP" | "POST_TRIP";

export interface ChecklistUploadedPhoto {
  imageURL: string;
  publicCloudID: string;
}

export interface ExteriorChecklistUploadedPhoto
  extends ChecklistUploadedPhoto {
  exteriorUploadImage: ExteriorUploadImage;
}

export interface InteriorChecklistUploadedPhoto
  extends ChecklistUploadedPhoto {
  interiorUploadImage: InteriorUploadImage;
}

export interface VehicleHealthChecklistUploadedPhoto
  extends ChecklistUploadedPhoto {
  vehicleHealthCheckPhotos: VehicleHealthCheckPhoto;
}

export interface DriverPhotoChecklistUploadedPhoto
  extends ChecklistUploadedPhoto {}

export interface SubmitExteriorChecklistPayload {
  checklistType: ChecklistType;
  uploadPhotos: ExteriorChecklistUploadedPhoto[];
}

export interface VehicleMetadata {
  fuelLevelInPercentage: number;
  odometerKM: number;
}

export interface SubmitInteriorChecklistPayload {
  checklistType: ChecklistType;
  metadata: VehicleMetadata;
  uploadPhotos: InteriorChecklistUploadedPhoto[];
}

export interface SubmitVehicleHealthChecklistPayload {
  uploadPhotos: VehicleHealthChecklistUploadedPhoto[];
}

export interface SubmitDriverPhotoChecklistPayload {
  uploadPhotos: DriverPhotoChecklistUploadedPhoto[];
}

export interface ChecklistRideImage {
  id: string;
  publicId: string;
  type: string;
  url: string;
}

export interface ChecklistStepResponseData {
  rideImages: ChecklistRideImage[];
  step: string;
  tripId: string;
  type: string;
  vehicleMetadata?: VehicleMetadata;
}

export type ChecklistStepResponse =
  ApiResponse<ChecklistStepResponseData>;

export interface PreRideChecklistSummarySection {
  photosCaptured: number;
  photosNotCaptured?: number;
  photoNotCaptured?: number;
  valid: boolean;
}

export interface PreRideInteriorChecklistSummarySection
  extends PreRideChecklistSummarySection {
  metadata?: VehicleMetadata;
}

export interface PreRideChecklistSummary {
  driverPhoto: PreRideChecklistSummarySection;
  driverTripStatus?: DriverTripStatus;
  exteriorPhotos: PreRideChecklistSummarySection;
  interiorPhotos: PreRideInteriorChecklistSummarySection;
  totalCompletionTime: string;
  vehicleHealthCheckPhotos: PreRideChecklistSummarySection;
  vehicleInfo: {
    vehicleIdentifier: string;
    vehicleName: string;
  };
}

export type PreRideChecklistSummaryResponse =
  ApiResponse<PreRideChecklistSummary>;

export interface PostRideChecklistSummary {
  dropOffLocation: string;
  exteriorPhotos: PreRideChecklistSummarySection;
  interiorPhotos: PreRideInteriorChecklistSummarySection;
  totalCompletionTime: string;
  vehicleMetadata?: VehicleMetadata;
}

export interface PostRideChecklistAggregate {
  postTripSummary: PostRideChecklistSummary;
  preTripSummary: PreRideChecklistSummary;
}

export type PostRideChecklistAggregateResponse =
  ApiResponse<PostRideChecklistAggregate>;

export interface SubmitPreRideChecklistResponseData {
  driverId: string;
  driverTripStatus: DriverTripStatus;
  tripId: string;
}

export type SubmitPreRideChecklistResponse =
  ApiResponse<SubmitPreRideChecklistResponseData>;

export interface TransitionDriverTripStatusResponseData {
  driverId: string;
  driverTripStatus: DriverTripStatus;
  prevTripStatus: DriverTripStatus;
  tripId: string;
}

export type TransitionDriverTripStatusResponse =
  ApiResponse<TransitionDriverTripStatusResponseData>;
