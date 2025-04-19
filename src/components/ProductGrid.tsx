
import { useState, useEffect } from "react";
import ProductCard, { Product } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface ProductGridProps {
  sheetUrl: string;
}

export default function ProductGrid({ sheetUrl }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("highest");

  // Mock data generation
  useEffect(() => {
    const generateMockProducts = () => {
      const mockProducts: Product[] = [];
      
      for (let i = 1; i <= 10; i++) {
        const totalScore = Math.floor(Math.random() * 100);
        const status = i <= 2 ? 'analyzing' : 'complete';
        
        mockProducts.push({
          id: `product-${i}`,
          name: `Indian Product #${i}`,
          imageUrl: "",
          productUrl: "https://example.com/product",
          totalScore,
          status,
          scores: [
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
          ],
          insights: "This product shows strong potential for the Indian market with high engagement metrics and good problem-solution fit."
        });
      }
      
      return mockProducts;
    };
    
    let progressInterval: NodeJS.Timeout;
    
    const loadData = () => {
      setIsLoading(true);
      setProgress(0);
      
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            setProducts(generateMockProducts());
            setIsLoading(false);
            return 100;
          }
          return newProgress;
        });
      }, 300);
    };
    
    loadData();
    
    return () => {
      clearInterval(progressInterval);
    };
  }, [sheetUrl]);

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
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Product Analysis Results</h2>
              <p className="text-muted-foreground">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button variant="outline">Export Results</Button>
          </div>
        </>
      )}
    </div>
  );
}
