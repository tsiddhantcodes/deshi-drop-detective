
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

export default function GoogleSheetInput({ onAnalyze }: { onAnalyze: (sheetUrl: string) => void }) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateUrl = () => {
    setIsValidating(true);
    
    // Simplified validation - in a real app, we would check the URL format more thoroughly
    const isGoogleSheetUrl = sheetUrl.includes("docs.google.com/spreadsheets");
    
    if (!isGoogleSheetUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Sheet URL",
        variant: "destructive",
      });
      setIsValidating(false);
      return;
    }

    setTimeout(() => {
      setIsValidating(false);
      toast({
        title: "URL Validated",
        description: "Google Sheet URL is valid",
      });
      onAnalyze(sheetUrl);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Product Analysis</CardTitle>
        <CardDescription>
          Enter your Google Sheet URL containing product links and video creative folders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Required Format</AlertTitle>
            <AlertDescription>
              Your Google Sheet must have:
              <ul className="list-disc pl-5 pt-2">
                <li>Column A: Product link</li>
                <li>Column B: Google Drive folder link with video creatives</li>
              </ul>
            </AlertDescription>
          </Alert>
          <Input
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className="w-full"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={validateUrl} 
          disabled={!sheetUrl || isValidating}
          className="w-full"
        >
          {isValidating ? "Validating..." : "Analyze Products"}
        </Button>
      </CardFooter>
    </Card>
  );
}
