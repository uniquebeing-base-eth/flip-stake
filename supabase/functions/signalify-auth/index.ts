import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SIGNALIFY_AUTH_URL = "https://ecgbkytzisotjbqwfjzd.supabase.co/functions/v1/wallet-auth";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SIGNALIFY_API_KEY = Deno.env.get("SIGNALIFY_API_KEY");
    if (!SIGNALIFY_API_KEY) {
      throw new Error("SIGNALIFY_API_KEY is not configured");
    }

    const { address, signature, message, username } = await req.json();

    if (!address || !signature || !message) {
      return new Response(
        JSON.stringify({ error: "Missing address, signature, or message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: Record<string, string> = { address, signature, message };
    if (username) {
      body.username = username;
    }

    const response = await fetch(SIGNALIFY_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SIGNALIFY_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error || "Authentication failed", status: response.status }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Signalify auth error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
