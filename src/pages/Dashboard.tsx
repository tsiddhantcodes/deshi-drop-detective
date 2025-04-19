
import { useState } from "react";
import GoogleSheetInput from "@/components/GoogleSheetInput";
import ProductGrid from "@/components/ProductGrid";

export default function Dashboard() {
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  const handleAnalyze = (url: string) => {
    setSheetUrl(url);
  };

  return (
    <div className="container py-6 space-y-8">
      {!sheetUrl ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="max-w-lg text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Deshi Drop Detective</h1>
            <p className="text-muted-foreground mt-3">
              Evaluate dropshipping products for the Indian market by analyzing product information and video ad creatives.
            </p>
          </div>
          <GoogleSheetInput onAnalyze={handleAnalyze} />
        </div>
      ) : (
        <ProductGrid sheetUrl={sheetUrl} />
      )}
    </div>
  );
}
