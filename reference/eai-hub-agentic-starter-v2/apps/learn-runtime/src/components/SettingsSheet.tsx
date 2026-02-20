
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ExternalLink, Gauge, Server } from 'lucide-react';
import RubricSettings from './RubricSettings';
import ServerSideApiStatus from './shared/ServerSideApiStatus';

interface SettingsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState('rubrics');

  const handleGoToAdmin = () => {
    window.open('/admin', '_blank');
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="font-inter sm:max-w-xl overflow-y-auto glass-strong border-border/30 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle>Instellingen</SheetTitle>
          <SheetDescription>
            Configureer rubrics, bekijk API status, of ga naar Admin Dashboard.
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rubrics" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Rubrics
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              API Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rubrics" className="mt-4 space-y-4">
            <RubricSettings />
          </TabsContent>

          <TabsContent value="api" className="mt-4 space-y-4">
            <ServerSideApiStatus />
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t">
          <Button 
            onClick={handleGoToAdmin}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Admin Dashboard
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
