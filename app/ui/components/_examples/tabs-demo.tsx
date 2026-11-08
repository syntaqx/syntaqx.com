import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/syntaqx/ui/tabs";

export default function TabsDemo() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-muted-foreground">
        What this is, at a glance.
      </TabsContent>
      <TabsContent value="usage" className="text-muted-foreground">
        How often it ran this month.
      </TabsContent>
      <TabsContent value="settings" className="text-muted-foreground">
        What you can change.
      </TabsContent>
    </Tabs>
  );
}
