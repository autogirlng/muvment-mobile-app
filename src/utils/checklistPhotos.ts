import type { ChecklistUploadedPhoto } from "../api/types";

export type ChecklistPhotoUploadStatus =
  | "empty"
  | "failed"
  | "uploaded"
  | "uploading";

export interface ChecklistPhotoState {
  errorMessage?: string;
  imageURL?: string;
  localUri: string | null;
  publicCloudID?: string;
  status: ChecklistPhotoUploadStatus;
}

export const createEmptyChecklistPhoto = (): ChecklistPhotoState => ({
  localUri: null,
  status: "empty",
});

export const isChecklistPhotoUploaded = (
  photo: ChecklistPhotoState,
): photo is ChecklistPhotoState & Required<
  Pick<ChecklistPhotoState, "imageURL" | "publicCloudID">
> =>
  photo.status === "uploaded" &&
  Boolean(photo.imageURL) &&
  Boolean(photo.publicCloudID);

export const toChecklistUploadedPhoto = (
  photo: ChecklistPhotoState,
): ChecklistUploadedPhoto => {
  if (!isChecklistPhotoUploaded(photo)) {
    throw new Error("Photo has not finished uploading.");
  }

  return {
    imageURL: photo.imageURL,
    publicCloudID: photo.publicCloudID,
  };
};
