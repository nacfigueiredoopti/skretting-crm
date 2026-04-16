const DAM_API = "https://api.cmp.optimizely.com/v3";
const TOKEN_URL = "https://accounts.cmp.optimizely.com/o/oauth2/v1/token";

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.OPTIMIZELY_DAM_CLIENT_ID,
      client_secret: process.env.OPTIMIZELY_DAM_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function damFetch(path, token) {
  const res = await fetch(`${DAM_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DAM API error (${res.status}): ${text}`);
  }
  return res.json();
}

async function getAssetFields(assetId, token) {
  try {
    const data = await damFetch(
      `/assets/${assetId}/fields?page_size=100`,
      token
    );
    return data.data || [];
  } catch {
    return [];
  }
}

async function getAssetDownloadUrl(fileId, token) {
  try {
    const res = await fetch(`${DAM_API}/file-urls`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_ids: [fileId] }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0]?.url || null;
  } catch {
    return null;
  }
}

export default async (req) => {
  const url = new URL(req.url);
  const caseNumber = url.searchParams.get("case_number");

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (!caseNumber) {
    return new Response(
      JSON.stringify({ error: "case_number parameter is required" }),
      { status: 400, headers }
    );
  }

  if (
    !process.env.OPTIMIZELY_DAM_CLIENT_ID ||
    !process.env.OPTIMIZELY_DAM_CLIENT_SECRET
  ) {
    return new Response(
      JSON.stringify({ error: "DAM API credentials not configured" }),
      { status: 500, headers }
    );
  }

  try {
    const token = await getAccessToken();

    // Fetch assets — paginate through up to 300 assets
    const matchingAssets = [];
    let offset = 0;
    const pageSize = 100;
    const maxPages = 3;

    for (let page = 0; page < maxPages; page++) {
      const assetsData = await damFetch(
        `/assets?page_size=${pageSize}&offset=${offset}`,
        token
      );
      const assets = assetsData.data || [];
      if (assets.length === 0) break;

      // Check fields for each asset in parallel
      const fieldChecks = await Promise.all(
        assets.map(async (asset) => {
          const fields = await getAssetFields(asset.id, token);
          const caseField = fields.find(
            (f) =>
              f.name === "NF - Case Number" &&
              f.value &&
              String(f.value).trim() === String(caseNumber).trim()
          );
          return caseField ? asset : null;
        })
      );

      for (const asset of fieldChecks) {
        if (asset) {
          matchingAssets.push({
            id: asset.id,
            name: asset.name || asset.title || "Untitled",
            type: asset.type,
            created_at: asset.created_at,
            modified_at: asset.modified_at,
            thumbnail: asset.thumbnail_url || asset.preview_url || null,
            dam_url: `https://app.cmp.optimizely.com/assets/${asset.id}`,
          });
        }
      }

      // Stop if no more pages
      if (!assetsData.pagination?.next) break;
      offset += pageSize;
    }

    return new Response(
      JSON.stringify({
        case_number: caseNumber,
        assets: matchingAssets,
        scanned_up_to: offset + pageSize,
      }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers }
    );
  }
};
