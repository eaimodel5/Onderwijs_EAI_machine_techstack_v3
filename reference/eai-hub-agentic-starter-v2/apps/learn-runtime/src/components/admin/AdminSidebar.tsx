import React from 'react';
import { Database, Settings, Activity, AlertOctagon } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

type ActiveTab = 'masterflow' | 'knowledge' | 'hitl' | 'settings';

interface AdminSidebarProps {
  active: ActiveTab;
  onChange: (value: ActiveTab) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ active, onChange }) => {
  const items: { key: ActiveTab; label: string; icon: typeof Activity }[] = [
    { key: 'masterflow', label: 'MasterFlow', icon: Activity },
    { key: 'knowledge', label: 'Knowledge', icon: Database },
    { key: 'hitl', label: 'HITL', icon: AlertOctagon },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    onClick={() => onChange(item.key)}
                    isActive={active === item.key}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
