import { ACCESS_KEY, HOSTNAME, STORAGE_ZONE_NAME } from "../../constants/BunnyAPI";

export const uploadToBunny = async (
  file: File | Blob,
  type: "capsule_pdf" | "capsule_img" | "profile_avatar",
  name_with_extension: string | number,
  user_id: any,
) => {
  const contentType = "image/jpeg";
  let bunnyUrl: string;
  let pullZoneUrl: string;

  console.log("Starting uploadToBunny", { type, name_with_extension });

  switch (type) {

    case "capsule_pdf":
      bunnyUrl = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/capsule/${user_id}/pdf/${name_with_extension}`;
      pullZoneUrl = `https://roar-ai.b-cdn.net/capsule/${user_id}/pdf/${name_with_extension}`;
      break;

      case "capsule_img":
      bunnyUrl = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/capsule/${user_id}/img/${name_with_extension}`;
      pullZoneUrl = `https://roar-ai.b-cdn.net/capsule/${user_id}/img/${name_with_extension}`;
      break;

      case "profile_avatar":
      bunnyUrl = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/profile/${user_id}/avatar/${name_with_extension}`;
      pullZoneUrl = `https://roar-ai.b-cdn.net/profile/${user_id}/avatar/${name_with_extension}`;
      break;

    default:
      throw new Error(`Unsupported file type: ${type}`);
  }

  console.log("Upload URLs:", { bunnyUrl, pullZoneUrl });

  const response = await fetch(bunnyUrl, {
    method: "PUT",
    headers: {
      AccessKey: ACCESS_KEY ?? "",
      "Content-Type": contentType,
    },
    body: file,
  });

  console.log("Upload request sent to Bunny CDN", ACCESS_KEY);
  console.log("Upload response status:", response.status);
  console.log("Upload response statusText:", response.statusText);

  if (!response.ok) {
    const text = await response.text();
    console.error(`Failed to upload ${type}. Response text:`, text);
    throw new Error(`Failed to upload ${type} (status ${response.status})`);
  }

  console.log(`Upload successful: ${pullZoneUrl}`);
  return pullZoneUrl;
};
