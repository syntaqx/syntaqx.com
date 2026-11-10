import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/syntaqx/ui/card";

export default function CardSmall() {
  return (
    <Card size="sm" className="w-full max-w-xs">
      <CardHeader>
        <CardTitle asChild>
          <h2 className="flex items-center gap-2">
            <Info className="size-4 text-primary" />
            How it works
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal space-y-2 pl-4 text-muted-foreground">
          <li>Your browser encrypts the secret with a key it makes.</li>
          <li>Only the ciphertext is sent; the key stays in the link.</li>
          <li>The server deletes it the moment it&apos;s read.</li>
        </ol>
      </CardContent>
    </Card>
  );
}
