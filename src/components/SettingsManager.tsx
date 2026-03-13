import React, { useState, useEffect } from 'react';
import { Shield, FileText, GraduationCap } from 'lucide-react';
import { User, Role } from '../types';
import { cn } from '../utils';
import { AdminManager } from './AdminManager';
import { ManualFormManager } from './ManualFormManager';
import { ClassPromotionManager } from './ClassPromotionManager';

interface SettingsManagerProps {
  admins: User[];
  siswa: User[];
  currentRole: Role;
  onAddAdmin: (data: Partial<User>) => Promise<void>;
  onUpdateAdmin: (username: string, data: Partial<User>) => Promise<void>;
  onDeleteAdmin: (username: string) => Promise<void>;
  onPromoteClass: () => Promise<void>;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ 
  admins, 
  siswa, 
  currentRole, 
  onAddAdmin, 
  onUpdateAdmin, 
  onDeleteAdmin,
  onPromoteClass
}) => {
  const canAccessManualForm = ['SUPERADMIN', 'ADMINSISWA'].includes(currentRole);
  const canAccessAdminManager = currentRole === 'SUPERADMIN';
  const canAccessPromotion = currentRole === 'SUPERADMIN';

  const [activeSubTab, setActiveSubTab] = useState<'admin' | 'manual_form' | 'promotion'>(
    canAccessAdminManager ? 'admin' : 'manual_form'
  );

  // Sync tab if role changes or initial load
  useEffect(() => {
    if (!canAccessAdminManager && canAccessManualForm) {
      setActiveSubTab('manual_form');
    } else if (canAccessAdminManager && !canAccessManualForm) {
      setActiveSubTab('admin');
    }
  }, [canAccessAdminManager, canAccessManualForm]);

  return (
    <div className="h-full flex flex-col space-y-6">
      {(canAccessAdminManager || canAccessManualForm) ? (
        <>
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
            {canAccessAdminManager && (
              <button
                onClick={() => setActiveSubTab('admin')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeSubTab === 'admin' 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Shield size={18} />
                Manajemen Admin
              </button>
            )}
            {canAccessManualForm && (
              <button
                onClick={() => setActiveSubTab('manual_form')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeSubTab === 'manual_form' 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <FileText size={18} />
                Form Manual Tabungan
              </button>
            )}
            {canAccessPromotion && (
              <button
                onClick={() => setActiveSubTab('promotion')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeSubTab === 'promotion' 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <GraduationCap size={18} />
                Kenaikan Kelas
              </button>
            )}
          </div>

          <div className="flex-1">
            {activeSubTab === 'admin' && canAccessAdminManager && (
              <AdminManager 
                data={admins}
                currentRole={currentRole}
                onAdd={onAddAdmin}
                onUpdate={onUpdateAdmin}
                onDelete={onDeleteAdmin}
              />
            )}
            {activeSubTab === 'manual_form' && canAccessManualForm && (
              <ManualFormManager siswa={siswa} />
            )}
            {activeSubTab === 'promotion' && canAccessPromotion && (
              <ClassPromotionManager onPromote={onPromoteClass} />
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <Shield size={48} className="opacity-20" />
          <p className="font-medium">Anda tidak memiliki akses ke pengaturan sistem.</p>
        </div>
      )}
    </div>
  );
};
