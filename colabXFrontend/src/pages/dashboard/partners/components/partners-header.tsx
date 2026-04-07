import { useRbac } from '@/hooks/useRbac';
import { AddPartnerDialog } from './add-partner-dialog';

export function PartnersHeader() {
  const { canManagePartners } = useRbac();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
      </div>
      {canManagePartners && <AddPartnerDialog />}
    </div>
  );
}
