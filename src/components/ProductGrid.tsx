
import { useState, useEffect } from "react";
import { fetchGoogleSheetData } from "@/utils/googleSheetsService";
import ProductCard, { Product } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AlertCircle, FileSpreadsheet, Download } from "lucide-react";
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

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProgress(0);

        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + 2;
            if (newProgress >= 30) {
              clearInterval(progressInterval);
              return 30;
            }
            return newProgress;
          });
        }, 150);

        toast.info("Analyzing products from Google Sheet", {
          description: "This may take a minute as we analyze the product data."
        });

        const sheetProducts = await fetchGoogleSheetData(sheetUrl);
        
        if (sheetProducts.length === 0) {
          setError("No valid products found in the Google Sheet. Please check that your sheet has 'Product Name' and 'Creative Links' columns, with product names in column A and creative links in column B.");
          clearInterval(progressInterval);
          setIsLoading(false);
          return;
        }

        clearInterval(progressInterval);
        setProgress(60);

        const analyzedProducts: Product[] = sheetProducts.map((product, index) => {
          const totalScore = product.scores ? 
            Math.min(
              100, 
              Math.floor(product.scores.reduce((sum, item) => sum + item.score, 0) / product.scores.length * 10)
            ) : 50;
          
          // Always use the product name from the sheet
          return {
            id: `product-${index}`,
            name: product.productName,
            imageUrl: "",
            productUrl: product.productLink || product.videoCreativeFolderLink, // Fallback to video link if no product URL
            totalScore,
            status: product.status || 'complete',
            scores: product.scores || [],
            insights: product.insights || generateInsights(totalScore, product.scores || [])
          };
        });

        setProgress(100);
        setProducts(analyzedProducts);
        
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
        
        toast.success(`Analyzed ${analyzedProducts.length} products successfully`, {
          description: "Products have been processed and scored based on our AI analysis."
        });
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

  const generateInsights = (totalScore: number, scores: {name: string, score: number}[]): string => {
    if (totalScore >= 80) {
      return "This product has excellent potential for the Indian market with strong trend status and market fit.";
    } else if (totalScore >= 60) {
      return "Good product with moderate potential. Consider optimizing ad creative and targeting.";
    } else {
      return "Limited potential for the Indian market. Consider alternatives with better market fit and higher urgency scores.";
    }
  };

  const handleExportResults = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }

    // Create CSV header with product name, score category columns, and insights
    const csvRows = [
      ['Product Name', 'Total Score', ...products[0].scores.map(s => s.name), 'Insights'].join(','),
      ...products.map(product => [
        `"${product.name}"`,
        product.totalScore,
        ...product.scores.map(s => s.score),
        `"${product.insights}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'product_analysis_results.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Export completed successfully");
  };

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
              {progress < 30 && "Loading data from Google Sheet..."}
              {progress >= 30 && progress < 60 && "Processing product data..."}
              {progress >= 60 && progress < 90 && "Evaluating market potential..."}
              {progress >= 90 && "Finalizing analysis..."}
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
                <Button 
                  variant="outline" 
                  onClick={handleExportResults}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
