import { Button } from "@/registry/syntaqx/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/syntaqx/ui/card";

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Deploy key</CardTitle>
        <CardDescription>Read-only access to one repository.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Rotate
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Added 12 days ago, last used 3 hours ago from a CI runner.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t">
        <Button variant="ghost">Cancel</Button>
        <Button variant="destructive">Revoke</Button>
      </CardFooter>
    </Card>
  );
}
