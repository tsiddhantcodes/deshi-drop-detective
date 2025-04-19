
import { useState, useEffect } from "react";
import { fetchGoogleSheetData } from "@/utils/googleSheetsService";
import ProductCard, { Product } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AlertCircle, FileSpreadsheet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface ProductGridProps {
  sheetUrl: string;
}

const ITEMS_PER_PAGE = 8;

export default function ProductGrid({ sheetUrl }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("highest");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch and process Google Sheet data
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + 5;
            if (newProgress >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return newProgress;
          });
        }, 300);

        // Fetch sheet data
        const sheetProducts = await fetchGoogleSheetData(sheetUrl);
        
        if (sheetProducts.length === 0) {
          setError("No valid products found in the Google Sheet. Please check the sheet format.");
          clearInterval(progressInterval);
          setIsLoading(false);
          return;
        }

        // Transform sheet data into Product format and generate sample scores
        // In a real app, you would analyze each product here with AI or other APIs
        const analyzedProducts: Product[] = sheetProducts.map((product, index) => {
          // Calculate individual scores (random for now)
          const scores = [
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
          
          // Calculate total score based on all individual scores
          const totalScore = Math.min(
            100, 
            Math.floor(scores.reduce((sum, item) => sum + item.score, 0) / scores.length * 10)
          );
          
          // Generate insights based on scores
          const insights = generateInsights(totalScore, scores);

          // Extract product name/title from URL
          const productName = extractProductName(product.productLink);

          return {
            id: `product-${index}`,
            name: productName,
            imageUrl: "", // This would be extracted from product page in a real implementation
            productUrl: product.productLink,
            totalScore,
            status: 'complete',
            scores,
            insights
          };
        });

        // Final progress and complete loading
        setProgress(100);
        setProducts(analyzedProducts);
        clearInterval(progressInterval);
        setIsLoading(false);
        
        toast.success(`Analyzed ${analyzedProducts.length} products successfully`);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setIsLoading(false);
        toast.error('Failed to fetch product data', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    loadProductData();
  }, [sheetUrl]);

  // Helper function to extract product name from URL
  const extractProductName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Try to get the last meaningful part of the path
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        // Replace hyphens with spaces and capitalize words
        return pathParts[pathParts.length - 1]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
          .substring(0, 30); // Limit length
      }
      return `Product ${Math.floor(Math.random() * 1000)}`;
    } catch {
      return `Product ${Math.floor(Math.random() * 1000)}`;
    }
  };

  // Helper function to generate insights based on scores
  const generateInsights = (totalScore: number, scores: {name: string, score: number}[]): string => {
    if (totalScore >= 80) {
      return "This product has excellent potential for the Indian market with strong trend status and market fit.";
    } else if (totalScore >= 60) {
      return "Good product with moderate potential. Consider optimizing ad creative and targeting.";
    } else {
      return "Limited potential for the Indian market. Consider alternatives with better market fit and higher urgency scores.";
    }
  };

  // Filtering and sorting logic
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "highest") {
      return b.totalScore - a.totalScore;
    } else if (sortOption === "lowest") {
      return a.totalScore - b.totalScore;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-md mx-auto">
          <Progress value={progress} className="w-full" />
          <div className="text-center space-y-2">
            <p className="font-medium">Analyzing Products from Google Sheet</p>
            <p className="text-sm text-muted-foreground">
              Processing video creatives and evaluating market potential...
            </p>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading products</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Product Analysis Results</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                {products.length} products analyzed from your Google Sheet
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-[200px]"
              />
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highest">Highest Score</SelectItem>
                  <SelectItem value="lowest">Lowest Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator className="my-6" />

          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No products match your search criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
              
              <div className="mt-8 flex justify-center">
                <Button variant="outline">Export Results</Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
