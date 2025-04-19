
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function GoogleSheetInput({ onAnalyze }: { onAnalyze: (sheetUrl: string) => void }) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const validateUrl = async () => {
    setIsValidating(true);
    
    try {
      // Check if the URL is a valid Google Sheet URL
      const isGoogleSheetUrl = sheetUrl.includes("docs.google.com/spreadsheets");
      
      if (!isGoogleSheetUrl) {
        toast.error("Invalid URL", {
          description: "Please enter a valid Google Sheet URL",
        });
        setIsValidating(false);
        return;
      }

      // Extract sheet ID for more validation
      const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        toast.error("Invalid Google Sheet URL format", {
          description: "The URL format is not recognized. Please check and try again.",
        });
        setIsValidating(false);
        return;
      }

      toast.success("URL validated", {
        description: "Starting product analysis...",
      });
      
      // Pass the validated URL back to parent component
      onAnalyze(sheetUrl);
    } catch (error) {
      toast.error("Validation Error", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsValidating(false);
    }
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
          <Alert variant="default" className="bg-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Required Format</AlertTitle>
            <AlertDescription>
              Your Google Sheet must have:
              <ul className="list-disc pl-5 pt-2">
                <li>Column A: Product link</li>
                <li>Column B: Google Drive folder link with video creatives</li>
                <li>First row should be headers</li>
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
