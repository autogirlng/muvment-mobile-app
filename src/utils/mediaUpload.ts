import { Image } from "react-native";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import { ApiRequestError } from "../api/client.fetch";
import { createPresignedMediaUrl, deleteMedia } from "../api/media";

export interface ChecklistPhotoUploadResult {
  fileUrl: string;
}

const CHECKLIST_MEDIA_CATEGORY = "RIDE_PHOTO";
const CHECKLIST_PHOTO_CONTENT_TYPE = "image/jpeg";
const CHECKLIST_PHOTO_QUALITY = 0.8;
const CHECKLIST_PHOTO_MAX_SIDE = 2048;
const CHECKLIST_UPLOAD_RETRY_COUNT = 1;
const USE_PLACEHOLDER_UPLOAD =
  process.env.EXPO_PUBLIC_USE_PLACEHOLDER_UPLOAD === "true";
const DEFAULT_IMAGE_URL =
  process.env.EXPO_PUBLIC_DEFAULT_IMAGE_URL?.trim() ?? "";

export const CHECKLIST_UPLOAD_FAILED_MESSAGE =
  "We couldn't upload this photo. Check your internet connection and tap the photo to try again.";

type ImageDimensions = {
  height: number;
  width: number;
};

class UploadRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "UploadRequestError";
    this.status = status;
  }
}

const getImageDimensions = (uri: string): Promise<ImageDimensions | undefined> =>
  new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ height, width }),
      () => resolve(undefined),
    );
  });

const getResizeTarget = (dimensions?: ImageDimensions) => {
  if (!dimensions) {
    return undefined;
  }

  const longestSide = Math.max(dimensions.width, dimensions.height);

  if (longestSide <= CHECKLIST_PHOTO_MAX_SIDE) {
    return undefined;
  }

  return dimensions.width >= dimensions.height
    ? { width: CHECKLIST_PHOTO_MAX_SIDE }
    : { height: CHECKLIST_PHOTO_MAX_SIDE };
};

const prepareChecklistPhoto = async (localUri: string) => {
  const dimensions = await getImageDimensions(localUri);
  const resizeTarget = getResizeTarget(dimensions);
  const context = ImageManipulator.manipulate(localUri);

  if (resizeTarget) {
    context.resize(resizeTarget);
  }

  const renderedImage = await context.renderAsync();

  return renderedImage.saveAsync({
    compress: CHECKLIST_PHOTO_QUALITY,
    format: SaveFormat.JPEG,
  });
};

const buildFileName = (label: string) => {
  const safeLabel = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `${safeLabel || "ride-photo"}-${uniqueSuffix}.jpg`;
};

const fetchLocalBlob = async (localUri: string) => {
  const response = await fetch(localUri);

  if (!response.ok) {
    throw new UploadRequestError(
      "Unable to prepare the photo for upload.",
      response.status,
    );
  }

  return response.blob();
};

const uploadToS3 = async ({
  contentType,
  localUri,
  uploadUrl,
}: {
  contentType: string;
  localUri: string;
  uploadUrl: string;
}) => {
  const blob = await fetchLocalBlob(localUri);
  const response = await fetch(uploadUrl, {
    body: blob,
    headers: {
      "Content-Type": contentType,
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new UploadRequestError(
      `Photo upload failed with status ${response.status}.`,
      response.status,
    );
  }
};

const isTransientUploadError = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    return (
      error.code === "ERR_NETWORK" ||
      error.status === 408 ||
      error.status === 429 ||
      (typeof error.status === "number" && error.status >= 500)
    );
  }

  if (error instanceof UploadRequestError) {
    return (
      error.status === undefined ||
      error.status === 408 ||
      error.status === 429 ||
      error.status >= 500
    );
  }

  return error instanceof TypeError;
};

const uploadChecklistPhotoOnce = async ({
  label,
  localUri,
  tripId,
}: {
  label: string;
  localUri: string;
  tripId: string;
}): Promise<ChecklistPhotoUploadResult> => {
  const preparedPhoto = await prepareChecklistPhoto(localUri);
  const presignedUrlResponse = await createPresignedMediaUrl({
    category: CHECKLIST_MEDIA_CATEGORY,
    contentType: CHECKLIST_PHOTO_CONTENT_TYPE,
    entityId: tripId,
    fileName: buildFileName(label),
  });
  const presignedUrlData = presignedUrlResponse.data;

  if (!presignedUrlData?.uploadUrl || !presignedUrlData.fileUrl) {
    throw new UploadRequestError(
      "Media upload response was missing upload details.",
    );
  }

  await uploadToS3({
    contentType: CHECKLIST_PHOTO_CONTENT_TYPE,
    localUri: preparedPhoto.uri,
    uploadUrl: presignedUrlData.uploadUrl,
  });

  return {
    fileUrl: presignedUrlData.fileUrl,
  };
};

export const uploadChecklistPhoto = async (
  localUri: string,
  label: string,
  tripId: string,
): Promise<ChecklistPhotoUploadResult> => {
  if (!tripId.trim()) {
    throw new Error("Missing trip ID for photo upload.");
  }

  if (USE_PLACEHOLDER_UPLOAD) {
    if (!DEFAULT_IMAGE_URL) {
      throw new Error(
        "Placeholder upload is enabled, but EXPO_PUBLIC_DEFAULT_IMAGE_URL is missing.",
      );
    }

    return {
      fileUrl: DEFAULT_IMAGE_URL,
    };
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= CHECKLIST_UPLOAD_RETRY_COUNT; attempt += 1) {
    try {
      return await uploadChecklistPhotoOnce({
        label,
        localUri,
        tripId: tripId.trim(),
      });
    } catch (error) {
      lastError = error;

      if (
        attempt >= CHECKLIST_UPLOAD_RETRY_COUNT ||
        !isTransientUploadError(error)
      ) {
        break;
      }
    }
  }

  if (__DEV__) {
    console.warn("[media:upload] checklist photo upload failed", lastError);
  }

  throw new Error(CHECKLIST_UPLOAD_FAILED_MESSAGE);
};

export const deleteChecklistPhoto = async (fileUrl: string) => {
  if (!fileUrl.trim() || USE_PLACEHOLDER_UPLOAD) {
    return;
  }

  await deleteMedia({ fileUrl });
};

export const deleteChecklistPhotoBestEffort = async (fileUrl?: string) => {
  if (!fileUrl) {
    return;
  }

  try {
    await deleteChecklistPhoto(fileUrl);
  } catch (error) {
    if (__DEV__) {
      console.warn("[media:delete] checklist cleanup failed", error);
    }
  }
};
