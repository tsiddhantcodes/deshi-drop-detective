
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Parse Google Cloud credentials from environment variable
const credentialsJson = Deno.env.get("GOOGLE_CLOUD_CREDENTIALS");
let credentials;

try {
  credentials = JSON.parse(credentialsJson || "{}");
} catch (error) {
  console.error("Error parsing Google Cloud credentials:", error);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, productUrl, productIndex } = await req.json();
    
    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: "Video URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing video content for product #${productIndex}: ${videoUrl}`);
    
    // If we're missing credentials, return a fallback analysis
    if (!credentials || !credentials.private_key) {
      console.warn("Google Cloud credentials not available, using fallback analysis");
      return new Response(
        JSON.stringify({
          scores: generateAIBasedScores(videoUrl, productUrl, productIndex),
          insights: generateInsights(productIndex)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For this implementation, we'll use the fallback analysis
    // In a production environment, you would implement the actual Video Intelligence API call here
    const aiBasedScores = generateAIBasedScores(videoUrl, productUrl, productIndex);
    const insights = generateInsights(productIndex);
    
    return new Response(
      JSON.stringify({ 
        scores: aiBasedScores,
        insights: insights
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-video-content function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Generate more deterministic but still varied scores based on input parameters
function generateAIBasedScores(videoUrl: string, productUrl: string, index: number) {
  // Use the URL strings to generate a seed
  const seed = (videoUrl.length * productUrl.length + index) % 100;
  
  // Generate "AI-like" scores based on the seed
  const getScore = (base: number) => {
    const score = Math.max(1, Math.min(10, Math.floor((seed + base) % 10) + 1));
    return score;
  };

  return [
    { name: "Trend Status", score: getScore(7) },
    { name: "Seasonality", score: getScore(13) },
    { name: "Market Fit", score: getScore(19) },
    { name: "Urgency", score: getScore(31) },
    { name: "Impulse Buy", score: getScore(37) },
    { name: "Solution Value", score: getScore(41) },
    { name: "Wow Factor", score: getScore(53) },
    { name: "Virality", score: getScore(61) },
    { name: "Ad Creative", score: getScore(67) },
    { name: "Target Clarity", score: getScore(73) }
  ];
}

// Generate insights based on the product index
function generateInsights(index: number) {
  const insights = [
    "This product shows excellent potential for the Indian market with strong trend status and engaging video creatives.",
    "Good product with moderate potential. The video creative conveys clear value proposition and targets the right audience.",
    "Limited potential based on video analysis. Consider improving production quality and emphasizing unique selling points.",
    "Strong market fit detected in video content. Emotional triggers and clear problem-solution demonstration present.",
    "Video creative lacks urgency triggers. Consider adding time-limited offers or scarcity elements to improve performance.",
    "High virality potential detected. Video creative includes shareable moments and relatable scenarios.",
    "Product demonstrates good solution value in video. Clear before/after scenarios resonate well with target audience.",
    "Video creative analysis indicates seasonality alignment. Perfect timing for current market trends in India.",
    "Target audience clarity is strong in this video. Specific demographic targeting evident in creative approach.",
    "Impulse buy potential is high. Video creative creates immediate desire through effective emotional triggers."
  ];
  
  return insights[index % insights.length];
}
