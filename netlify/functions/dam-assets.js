import { getStore } from "@netlify/blobs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const store = getStore("dam-case-assets");

  // POST — register a DAM asset link for a case
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { case_number, asset_id, asset_name, asset_url, asset_type, thumbnail_url } = body;

      if (!case_number || !asset_id) {
        return new Response(
          JSON.stringify({ error: "case_number and asset_id are required" }),
          { status: 400, headers: CORS }
        );
      }

      // Get existing assets for this case
      let existing = { assets: [] };
      try {
        existing = await store.get(`case-${case_number}`, { type: "json" });
        if (!existing) existing = { assets: [] };
      } catch (e) {
        existing = { assets: [] };
      }

      // Avoid duplicates
      if (!existing.assets.find((a) => a.id === asset_id)) {
        existing.assets.push({
          id: asset_id,
          name: asset_name || "Untitled Asset",
          type: asset_type || "raw_file",
          thumbnail: thumbnail_url || null,
          dam_url: asset_url || `https://app.cmp.optimizely.com/assets/${asset_id}`,
          linked_at: new Date().toISOString(),
        });
      }

      await store.setJSON(`case-${case_number}`, {
        caseNumber: case_number,
        assets: existing.assets,
        updated_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: true,
          case_number,
          total_assets: existing.assets.length,
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

  // GET — retrieve DAM assets for a case
  const url = new URL(req.url);
  const caseNumber = url.searchParams.get("case_number");

  if (!caseNumber) {
    return new Response(
      JSON.stringify({ error: "case_number parameter is required" }),
      { status: 400, headers: CORS }
    );
  }

  try {
    let data = null;
    try {
      data = await store.get(`case-${caseNumber}`, { type: "json" });
    } catch (e) {}

    return new Response(
      JSON.stringify({
        case_number: caseNumber,
        assets: data?.assets || [],
        updated_at: data?.updated_at || null,
      }),
      { status: 200, headers: CORS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: CORS }
    );
  }
};
