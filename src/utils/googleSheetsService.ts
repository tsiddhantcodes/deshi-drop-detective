
import { supabase } from '@/integrations/supabase/client';

// Type for the product data we'll extract from the sheet
export interface ProductData {
  productLink: string;
  videoCreaitiveFolderLink: string;
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

    // Validate and transform the fetched data
    const products: ProductData[] = data.values
      .slice(1) // Skip header row
      .map(([productLink, videoCreaitiveFolderLink]: string[]) => ({
        productLink: productLink || '',
        videoCreaitiveFolderLink: videoCreaitiveFolderLink || ''
      }))
      .filter(product => product.productLink && product.videoCreaitiveFolderLink);

    console.log(`Found ${products.length} valid products in the sheet`);
    return products;
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    throw error;
  }
};
