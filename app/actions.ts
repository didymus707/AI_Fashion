"use server";

export async function uploadToYouCam(formData: FormData) {
  const file = formData.get("image") as File;

  if (!file) {
    return { success: false, error: "No file uploaded" };
  }

  const apiKey = process.env.YOUCAM_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "API key missing in environment variables",
    };
  }

  try {
    const initialResponse = await fetch(
      "https://yce-api-01.makeupar.com/s2s/v2.0/file",
      {
        method: "post",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: [
            {
              content_type: file.type || "image/jpeg",
              file_name: file.name || "upload.jpg",
              file_size: file.size,
            },
          ],
        }),
      },
    );
    const initialData = await initialResponse.json();
    if (!initialResponse.ok || !initialData.data?.files?.[0]) {
      return { success: false, error: "Failed to initialize YouCam upload" };
    }
    const fileData = initialData.data.files[0];
    const fileId = fileData.file_id;
    const uploadUrl = fileData.requests[0].url;

    const arrayBuffer = await file.arrayBuffer();

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "image/jpeg",
        "Content-Length": file.size.toString(),
      },
      body: arrayBuffer,
    });

    if (!uploadResponse.ok) {
      return {
        success: false,
        error: "Failed to upload image data to secure URL",
      };
    }

    return { success: true, fileId: fileId };
  } catch (error) {
    console.error("Server upload error:", error);
    return { success: false, error: "Internal server error during upload" };
  }
}

export async function startVirtualTryOn(
  modelFileId: string,
  garmentFileId: string,
  garmentCategory: string = "auto",
) {
  const apiKey = process.env.YOUCAM_API_KEY;
  if (!apiKey) return { success: false, error: "API Key is missing" };

  try {
    const response = await fetch(
      "https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth-v4",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          src_file_id: modelFileId,
          ref_file_id: garmentFileId,
          garment_category: garmentCategory,
        }),
      },
    );
    const data = await response.json();

    if (!response.ok)
      return {
        success: false,
        error: data?.message || "Failed to start Try-On task",
      };

    return { success: true, taskId: data.task_id || data.data?.task_id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Internal server error" };
  }
}

export async function checkTaskStatus(taskId: string) {
  const apiKey = process.env.YOUCAM_API_KEY;
  if (!apiKey) return { success: false, error: "API key missing" };

  try {
    const response = await fetch(
      `https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth-v4/${taskId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    console.log("POLLING RESPONSE:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to check task status",
      };
    }

    // YouCam returns 'task_status' inside 'data' (e.g., "success", "processing", "failed")
    const taskStatus = data.data?.task_status || "processing";

    // The final result image URL is inside data.data.results.url
    const resultUrl = data.data?.results?.url || null;

    return {
      success: true,
      taskStatus: String(taskStatus).toLowerCase(),
      resultUrl,
    };
  } catch (error) {
    console.error("Polling Error:", error);
    return { success: false, error: "Internal server error" };
  }
}
