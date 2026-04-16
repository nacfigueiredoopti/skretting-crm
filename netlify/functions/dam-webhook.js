import { getStore } from "@netlify/blobs";

const DAM_API = "https://api.cmp.optimizely.com/v3";
const TOKEN_URL = "https://accounts.cmp.optimizely.com/o/oauth2/v1/token";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Callback-Secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

async function getAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.OPTIMIZELY_DAM_CLIENT_ID,
      client_secret: process.env.OPTIMIZELY_DAM_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) return null;
  return (await res.json()).access_token;
}

async function getAssetWithCaseNumber(assetId, token) {
  const [assetRes, fieldsRes] = await Promise.all([
    fetch(`${DAM_API}/assets/${assetId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${DAM_API}/assets/${assetId}/fields?page_size=100`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  const asset = assetRes.ok ? await assetRes.json() : null;
  const fieldsData = fieldsRes.ok ? await fieldsRes.json() : { data: [] };
  const fields = fieldsData.data || [];

  const caseField = fields.find(
    (f) =>
      f.name &&
      (f.name === "NF - Case Number" ||
        f.name.toLowerCase().includes("case number") ||
        f.name.toLowerCase().includes("nf"))
  );

  const caseNumber = caseField
    ? caseField.value || (caseField.values && caseField.values[0]) || null
    : null;

  return { asset, caseNumber: caseNumber ? String(caseNumber).trim() : null };
}

async function storeAssetLink({ assetId, caseNumber, assetName, assetType, assetUrl, thumbnailUrl }) {
  const store = getStore("dam-case-assets");

  let existing = { assets: [] };
  try {
    existing = await store.get(`case-${caseNumber}`, { type: "json" });
    if (!existing) existing = { assets: [] };
  } catch (e) {
    existing = { assets: [] };
  }

  if (!existing.assets.find((a) => a.id === assetId)) {
    existing.assets.push({
      id: assetId,
      name: assetName || "Untitled Asset",
      type: assetType || "raw_file",
      thumbnail: thumbnailUrl || null,
      dam_url: assetUrl || `https://app.cmp.optimizely.com/assets/${assetId}`,
      linked_at: new Date().toISOString(),
    });
  }

  await store.setJSON(`case-${caseNumber}`, {
    caseNumber,
    assets: existing.assets,
    updated_at: new Date().toISOString(),
  });

  return existing.assets.length;
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  // ─── GET: Opal agent or browser can call this ───
  // Example: /dam-webhook?asset_id=X&case_number=Y&asset_name=Z
  if (req.method === "GET") {
    const url = new URL(req.url);
    const assetId = url.searchParams.get("asset_id");
    const caseNumber = url.searchParams.get("case_number");
    const assetName = url.searchParams.get("asset_name") || "DAM Asset";
    const assetType = url.searchParams.get("asset_type") || "raw_file";
    const assetUrl = url.searchParams.get("asset_url");

    if (!assetId || !caseNumber) {
      return new Response(
        JSON.stringify({
          info: "Skretting CRM - DAM Webhook Endpoint",
          usage: "GET ?asset_id=ID&case_number=NUM&asset_name=NAME or POST JSON body",
          status: "ready",
        }),
        { status: 200, headers: CORS }
      );
    }

    try {
      const count = await storeAssetLink({
        assetId,
        caseNumber,
        assetName,
        assetType,
        assetUrl: assetUrl || `https://app.cmp.optimizely.com/assets/${assetId}`,
        thumbnailUrl: null,
      });

      return new Response(
        JSON.stringify({
          success: true,
          case_number: caseNumber,
          asset_id: assetId,
          asset_name: assetName,
          total_assets: count,
        }),
        { status: 200, headers: CORS }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500, headers: CORS }
      );
    }
  }

  // ─── POST: CMP webhook or direct API call ───
  if (req.method === "POST") {
    try {
      const body = await req.json();

      let assetId = body.asset_id || body.id;
      let caseNumber = body.case_number;
      let assetName = body.asset_name || body.name || body.title;
      let assetType = body.asset_type || body.type;
      let assetUrl = body.asset_url;
      let thumbnailUrl = body.thumbnail_url;

      if (!assetId) {
        return new Response(
          JSON.stringify({ error: "asset_id is required" }),
          { status: 400, headers: CORS }
        );
      }

      // If no case_number, try to fetch from DAM API
      if (!caseNumber && process.env.OPTIMIZELY_DAM_CLIENT_ID) {
        const token = await getAccessToken();
        if (token) {
          const result = await getAssetWithCaseNumber(assetId, token);
          caseNumber = result.caseNumber;
          if (result.asset) {
            assetName = assetName || result.asset.title;
            assetType = assetType || result.asset.type;
            thumbnailUrl = thumbnailUrl || result.asset.thumbnail_url;
            assetUrl =
              assetUrl ||
              result.asset.content?.value ||
              `https://app.cmp.optimizely.com/assets/${assetId}`;
          }
        }
      }

      if (!caseNumber) {
        return new Response(
          JSON.stringify({
            error: "Could not determine case_number. Provide it or ensure the DAM field is set.",
          }),
          { status: 400, headers: CORS }
        );
      }

      const count = await storeAssetLink({
        assetId,
        caseNumber,
        assetName,
        assetType,
        assetUrl: assetUrl || `https://app.cmp.optimizely.com/assets/${assetId}`,
        thumbnailUrl,
      });

      return new Response(
        JSON.stringify({
          success: true,
          case_number: caseNumber,
          asset_id: assetId,
          asset_name: assetName,
          total_assets: count,
        }),
        { status: 200, headers: CORS }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500, headers: CORS }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: CORS }
  );
};
