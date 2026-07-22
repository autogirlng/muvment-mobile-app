import type { ChecklistUploadedPhoto } from "../api/types";

export type ChecklistPhotoUploadStatus =
  | "empty"
  | "failed"
  | "uploaded"
  | "uploading";

export interface ChecklistPhotoState {
  errorMessage?: string;
  fileUrl?: string;
  localUri: string | null;
  status: ChecklistPhotoUploadStatus;
}

export const createEmptyChecklistPhoto = (): ChecklistPhotoState => ({
  localUri: null,
  status: "empty",
});

export const isChecklistPhotoUploaded = (
  photo: ChecklistPhotoState,
): photo is ChecklistPhotoState & Required<
  Pick<ChecklistPhotoState, "fileUrl">
> =>
  photo.status === "uploaded" &&
  Boolean(photo.fileUrl);

export const toChecklistUploadedPhoto = (
  photo: ChecklistPhotoState,
): ChecklistUploadedPhoto => {
  if (!isChecklistPhotoUploaded(photo)) {
    throw new Error("Photo has not finished uploading.");
  }

  return {
    fileUrl: photo.fileUrl,
  };
};
