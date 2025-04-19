
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CriteriaTooltipProps {
  children: React.ReactNode;
  criteriaName: string;
}

export default function CriteriaTooltip({ children, criteriaName }: CriteriaTooltipProps) {
  const getCriteriaDescription = (name: string) => {
    const criteria = {
      "Trend Status": "How popular the product currently is in market trends",
      "Seasonality": "How the product's demand fluctuates with seasons",
      "Market Fit": "How well the product fits the Indian market specifically",
      "Urgency": "How likely customers feel they need to buy now",
      "Impulse Buy": "How likely a customer is to purchase without planning",
      "Solution Value": "How effectively the product solves a real problem",
      "Wow Factor": "How impressive the product is at first glance",
      "Virality": "How likely the product is to be shared on social media",
      "Ad Creative": "How well the product can be marketed in ads",
      "Target Clarity": "How clear the target audience is for this product"
    };
    
    return criteria[name as keyof typeof criteria] || "No description available";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{getCriteriaDescription(criteriaName)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
