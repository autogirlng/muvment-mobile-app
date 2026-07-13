export interface ChecklistPhotoUploadResult {
  imageURL: string;
  publicCloudID: string;
}

interface CloudinaryUploadResponse {
  public_id?: string;
  secure_url?: string;
}

type ReactNativeUploadFile = {
  name: string;
  type: string;
  uri: string;
};

const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() ?? "";
const USE_PLACEHOLDER_UPLOAD =
  process.env.EXPO_PUBLIC_USE_PLACEHOLDER_UPLOAD === "true";
const DEFAULT_IMAGE_URL =
  process.env.EXPO_PUBLIC_DEFAULT_IMAGE_URL?.trim() ?? "";

const getFileExtension = (uri: string) => {
  const cleanUri = uri.split("?")[0] ?? uri;
  const extension = cleanUri.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();

  return extension || "jpg";
};

const getMimeType = (extension: string) => {
  switch (extension) {
    case "heic":
      return "image/heic";
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
};

const buildUploadFile = (
  localUri: string,
  key: string,
): ReactNativeUploadFile => {
  const extension = getFileExtension(localUri);

  return {
    name: `${key.toLowerCase()}.${extension}`,
    type: getMimeType(extension),
    uri: localUri,
  };
};

const getCloudinaryUploadUrl = () => {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      "Cloudinary cloud name is missing. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and restart Expo.",
    );
  }

  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
};

const getUploadPreset = () => {
  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary upload preset is missing. Set EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET and restart Expo.",
    );
  }

  return CLOUDINARY_UPLOAD_PRESET;
};

export const uploadChecklistPhoto = async (
  localUri: string,
  key: string,
): Promise<ChecklistPhotoUploadResult> => {
  if (USE_PLACEHOLDER_UPLOAD) {
    if (!DEFAULT_IMAGE_URL) {
      throw new Error(
        "Placeholder upload is enabled, but EXPO_PUBLIC_DEFAULT_IMAGE_URL is missing.",
      );
    }

    return {
      imageURL: DEFAULT_IMAGE_URL,
      publicCloudID: "placeholder",
    };
  }

  const formData = new FormData();
  const uploadFile = buildUploadFile(localUri, key);

  formData.append("file", uploadFile as unknown as Blob);
  formData.append("upload_preset", getUploadPreset());

  const response = await fetch(getCloudinaryUploadUrl(), {
    body: formData,
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to upload ${key}. Please try again.`);
  }

  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!data.secure_url || !data.public_id) {
    throw new Error("Cloudinary upload response was missing image details.");
  }

  return {
    imageURL: data.secure_url,
    publicCloudID: data.public_id,
  };
};
