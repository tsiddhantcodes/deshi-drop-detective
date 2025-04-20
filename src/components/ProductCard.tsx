
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface ProductScore {
  name: string;
  score: number;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  productUrl: string;
  totalScore: number;
  scores: ProductScore[];
  insights: string;
  status: 'analyzing' | 'complete';
}

export default function ProductCard({ product }: { product: Product }) {
  // Function to determine badge color based on total score
  const getBadgeVariant = (score: number) => {
    if (score <= 50) return "destructive";
    if (score <= 75) return "outline";
    return "default";
  };

  // Function to get color based on individual score
  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-brand-red";
    if (score <= 7) return "text-brand-yellow";
    return "text-brand-green";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
              {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />}
            </div>
            <div>
              <h3 className="font-medium leading-none mb-1" title={product.name}>
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {product.status === 'analyzing' ? (
                  <span className="flex items-center">
                    <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-brand-yellow"></span>
                    Analyzing...
                  </span>
                ) : (
                  <Badge variant={getBadgeVariant(product.totalScore)}>
                    Score: {product.totalScore}/100
                  </Badge>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {product.status === 'analyzing' ? (
          <div className="space-y-4 pt-2">
            <Progress value={45} className="h-2" />
            <p className="text-sm text-muted-foreground">Analyzing product data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative pt-2">
              <div className="score-gradient h-1.5 w-full rounded-full" />
              <div 
                className="absolute top-1 w-3 h-3 bg-white border-2 border-primary rounded-full transform -translate-y-1/2"
                style={{ left: `${product.totalScore}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {product.scores.map((item) => (
                <div key={item.name} className="flex justify-between">
                  <span>{item.name}:</span>
                  <span className={getScoreColor(item.score)}>{item.score}/10</span>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-1">Insights:</h4>
              <p className="text-xs text-muted-foreground">{product.insights}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
