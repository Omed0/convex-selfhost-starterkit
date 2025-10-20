'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Plus, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  useAuthQuery,
  useAuthMutation,
  useCurrentUser,
} from '@/lib/convex/hooks';
import { api } from '@convex/_generated/api';
import { toast } from 'sonner';
import { WithSkeleton } from '@/components/ui/skeleton';
import { Id } from '@convex/_generated/dataModel';

export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [selectedOrgSlug, setSelectedOrgSlug] = useState<string | null>(null);
  const router = useRouter();
  const user = useCurrentUser();

  const { data: orgsData, isLoading } = useAuthQuery(
    api.organization.listOrganizations,
    {},
    {
      placeholderData: {
        canCreateOrganization: true,
        organizations: [
          {
            id: '1' as any,
            createdAt: Date.now(),
            isPersonal: true,
            logo: null,
            name: 'Personal',
            slug: 'personal',
          },
          {
            id: '2' as any,
            createdAt: Date.now(),
            isPersonal: false,
            logo: null,
            name: 'Team Organization',
            slug: 'team-org',
          },
        ],
      },
    }
  );

  const setActiveOrganization = useAuthMutation(
    api.organization.setActiveOrganization,
    {
      onSuccess: () => {
        toast.success('Switched organization successfully');
        setOpen(false);
        // Navigate to the organization page after switching
        if (selectedOrgSlug) {
          router.push(`/org/${selectedOrgSlug}`);
          setSelectedOrgSlug(null);
        } else {
          router.refresh();
        }
      },
      onError: (error: any) => {
        toast.error(error.data?.message ?? 'Failed to switch organization');
      },
    }
  );

  const createOrganization = useAuthMutation(
    api.organization.createOrganization,
    {
      onSuccess: (result) => {
        toast.success('Organization created successfully');
        setShowCreateDialog(false);
        setOrgName('');
        // Navigate to the new organization
        router.push(`/org/${result.slug}`);
      },
      onError: (error: any) => {
        toast.error(error.data?.message ?? 'Failed to create organization');
      },
    }
  );

  if (!user) return null;

  const currentOrg = user.activeOrganization;
  if (!currentOrg) return null;

  const handleSelectOrganization = (
    organizationId: Id<'organization'>,
    slug: string
  ) => {
    if (organizationId === currentOrg.id) {
      setOpen(false);
      return;
    }
    setSelectedOrgSlug(slug);
    setActiveOrganization.mutate({ organizationId });
  };

  const handleCreateOrganization = () => {
    if (!orgName.trim()) {
      toast.error('Organization name is required');
      return;
    }
    createOrganization.mutate({ name: orgName.trim() });
  };

  const allOrganizations = [
    // Current organization first
    {
      id: currentOrg.id,
      name: currentOrg.name,
      slug: currentOrg.slug,
      isPersonal: currentOrg.id === user.personalOrganizationId,
      logo: currentOrg.logo,
    },
    // Other organizations
    ...(orgsData?.organizations ?? []),
  ];

  // Remove duplicates by ID
  const uniqueOrganizations = allOrganizations.filter(
    (org, index, self) => index === self.findIndex((o) => o.id === org.id)
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[240px] justify-between"
            size="sm"
          >
            <div className="flex items-center gap-2 truncate">
              {currentOrg.id === user.personalOrganizationId ? (
                <User className="h-4 w-4 shrink-0" />
              ) : (
                <Building2 className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{currentOrg.name}</span>
              {currentOrg.id === user.personalOrganizationId && (
                <Badge variant="secondary" className="ml-1">
                  Personal
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search organizations..." />
            <CommandList>
              <WithSkeleton isLoading={isLoading}>
                <CommandEmpty>No organization found.</CommandEmpty>
                <CommandGroup heading="Organizations">
                  {uniqueOrganizations.map((org) => (
                    <CommandItem
                      key={org.id}
                      value={org.slug}
                      onSelect={() =>
                        handleSelectOrganization(org.id, org.slug)
                      }
                    >
                      <div className="flex w-full flex-1 items-center gap-2">
                        {org.isPersonal ? (
                          <User className="h-4 w-4 shrink-0" />
                        ) : (
                          <Building2 className="h-4 w-4 shrink-0" />
                        )}
                        <span className="truncate">{org.name}</span>
                        {org.isPersonal && org.id !== currentOrg.id && (
                          <Badge
                            variant="secondary"
                            className="ml-auto shrink-0"
                          >
                            Personal
                          </Badge>
                        )}
                      </div>
                      <Check
                        className={cn(
                          'ml-2 h-4 w-4 shrink-0',
                          currentOrg.id === org.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
                {orgsData?.canCreateOrganization && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setOpen(false);
                          setShowCreateDialog(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Organization
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </WithSkeleton>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="My Team"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateOrganization();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setOrgName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrganization}
              disabled={createOrganization.isPending || !orgName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
