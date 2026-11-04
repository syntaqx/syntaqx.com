import { CircleAlert, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/registry/syntaqx/ui/alert";

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Alert>
        <Info />
        <AlertTitle>Runs in your browser</AlertTitle>
        <AlertDescription>Nothing you paste here is sent to a server.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Couldn&apos;t parse the input</AlertTitle>
        <AlertDescription>Unexpected token at line 3, column 14.</AlertDescription>
      </Alert>
    </div>
  );
}
