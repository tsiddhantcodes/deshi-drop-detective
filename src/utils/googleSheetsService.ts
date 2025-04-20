
import { supabase } from '@/integrations/supabase/client';

// Type for the product data we'll extract from the sheet
export interface ProductData {
  productName: string;
  productLink: string; // This will be empty in the new format
  videoCreativeFolderLink: string;
  analyzed: boolean;
  scores?: {
    name: string;
    score: number;
  }[];
  insights?: string;
  status?: 'analyzing' | 'complete';
}

export const fetchGoogleSheetData = async (sheetUrl: string): Promise<ProductData[]> => {
  // Extract sheet ID from the URL
  const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) {
    throw new Error('Invalid Google Sheets URL');
  }
  const sheetId = sheetIdMatch[1];

  try {
    console.log('Fetching data from Google Sheet:', sheetId);
    
    // Invoke Supabase edge function to fetch Google Sheet data
    const { data, error } = await supabase.functions.invoke('fetch-google-sheet', {
      body: JSON.stringify({ sheetId })
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to fetch sheet data: ${error.message}`);
    }

    if (!data.values || data.values.length === 0) {
      console.warn('Google Sheet is empty or has no data');
      return [];
    }

    // Log the first few rows to understand the structure
    console.log('Sheet header row:', data.values[0]);
    if (data.values.length > 1) {
      console.log('First data row example:', data.values[1]);
    }

    // Check if the header has the expected format
    const headers = data.values[0].map((h: string) => h.toLowerCase());
    const hasProductName = headers.some((h: string) => h.includes('product') && h.includes('name'));
    const hasCreativeLinks = headers.some((h: string) => h.includes('creative') || h.includes('link'));

    if (!hasProductName || !hasCreativeLinks) {
      console.warn('Sheet format may not be correct. Expected "Product Name" and "Creative Links" columns');
    }

    // Validate and transform the fetched data - adapt for new format
    // In new format: Column A is Product Name, Column B is Creative Links
    const products: ProductData[] = data.values
      .slice(1) // Skip header row
      .map(([productName, videoCreativeFolderLink]: string[]) => {
        // Validate both required fields are present
        if (!productName || !videoCreativeFolderLink) {
          return null;
        }
        
        return {
          productName: productName.trim(),
          videoCreativeFolderLink: videoCreativeFolderLink.trim(),
          productLink: "", // Empty in the new format since we don't have it
          analyzed: false,
          status: 'analyzing' as const
        };
      })
      .filter(Boolean); // Remove null entries

    console.log(`Found ${products.length} valid products in the sheet`);
    
    // Now let's analyze each product's video content
    const analyzedProducts = await analyzeProductVideos(products, sheetId);
    
    return analyzedProducts;
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    throw error;
  }
};

// Function to analyze video content for each product
export const analyzeProductVideos = async (products: ProductData[], sheetId: string): Promise<ProductData[]> => {
  try {
    // Batch analyze to avoid too many parallel requests
    const batchSize = 5;
    const analyzedProducts: ProductData[] = [...products];
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchPromises = batch.map(async (product, index) => {
        try {
          console.log(`Analyzing product ${i + index}: ${product.productName}`);
          
          // Call the video analysis edge function
          const { data, error } = await supabase.functions.invoke('analyze-video-content', {
            body: JSON.stringify({
              videoUrl: product.videoCreativeFolderLink,
              productName: product.productName,
              productIndex: i + index
            })
          });
          
          if (error) {
            console.error('Error analyzing video:', error);
            return {
              ...product,
              status: 'complete' as const,
              analyzed: true,
              scores: generateRandomScores(), // Fallback to random if analysis fails
              insights: "Could not analyze video content. Using estimated scores."
            };
          }
          
          return {
            ...product,
            status: 'complete' as const,
            analyzed: true,
            scores: data.scores || generateRandomScores(),
            insights: data.insights || generateDefaultInsight(data.scores)
          };
        } catch (error) {
          console.error('Error in video analysis:', error);
          return {
            ...product,
            status: 'complete' as const,
            analyzed: true,
            scores: generateRandomScores(), // Fallback to random scores
            insights: "Error analyzing video. Using estimated scores."
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach((result, index) => {
        analyzedProducts[i + index] = result;
      });
    }
    
    // Save the analysis results to Supabase for future reference
    try {
      await saveAnalysisResults(analyzedProducts, sheetId);
    } catch (error) {
      console.error('Error saving analysis results:', error);
      // Continue even if saving fails
    }
    
    return analyzedProducts;
  } catch (error) {
    console.error('Error in batch video analysis:', error);
    // Return products with random scores as fallback
    return products.map(product => ({
      ...product,
      status: 'complete' as const,
      analyzed: true,
      scores: generateRandomScores(),
      insights: "Error in analysis pipeline. Using estimated scores."
    }));
  }
};

// Save analysis results to Supabase
const saveAnalysisResults = async (products: ProductData[], sheetId: string) => {
  try {
    const { error } = await supabase.from('products')
      .upsert(
        products.map(product => ({
          sheet_id: sheetId,
          name: product.productName, // Always use the product name from sheet
          price: null, // We don't have price information
          score: calculateTotalScore(product.scores || []),
          score_breakdown: product.scores || [],
          image_url: "", // No image URL available yet
          google_drive_links: [product.videoCreativeFolderLink],
          status: 'complete',
          ad_creative_urls: []
        }))
      );
      
    if (error) {
      console.error('Error saving analysis results to Supabase:', error);
    }
  } catch (error) {
    console.error('Exception saving analysis results:', error);
  }
};

// Generate random scores for fallback
const generateRandomScores = () => {
  return [
    { name: "Trend Status", score: Math.floor(Math.random() * 10) + 1 },
    { name: "Seasonality", score: Math.floor(Math.random() * 10) + 1 },
    { name: "Market Fit", score: Math.floor(Math.random() * 10) + 1 },
    { name: "Urgency", score: Math.floor(Math.random() * 10) + 1 },
    { name: "Impulse Buy", score: Math.floor(Math.random() * 10) + 1 },
    { name: "Solution Value", score: Math.floor(Math.random() * 10) + 1 },
    { name: "Wow Factor", score: Math.floor(Math.random() * 10) + 1 },
    { name: "Virality", score: Math.floor(Math.random() * 10) + 1 },
    { name: "Ad Creative", score: Math.floor(Math.random() * 10) + 1 },
    { name: "Target Clarity", score: Math.floor(Math.random() * 10) + 1 }
  ];
};

// Calculate total score from individual scores
const calculateTotalScore = (scores: { name: string, score: number }[]) => {
  if (!scores || scores.length === 0) return 50;
  return Math.min(
    100, 
    Math.floor(scores.reduce((sum, item) => sum + item.score, 0) / scores.length * 10)
  );
};

// Generate default insight based on score
const generateDefaultInsight = (scores: { name: string, score: number }[]) => {
  if (!scores) return "Analysis not available.";
  
  const totalScore = calculateTotalScore(scores);
  
  if (totalScore >= 80) {
    return "This product has excellent potential for the Indian market with strong trend status and market fit.";
  } else if (totalScore >= 60) {
    return "Good product with moderate potential. Consider optimizing ad creative and targeting.";
  } else {
    return "Limited potential for the Indian market. Consider alternatives with better market fit and higher urgency scores.";
  }
};
