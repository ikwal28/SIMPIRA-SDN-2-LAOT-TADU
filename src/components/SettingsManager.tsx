import React, { useState, useEffect } from 'react';
import { Shield, GraduationCap } from 'lucide-react';
import { User, Role } from '../types';
import { cn } from '../utils';
import { AdminManager } from './AdminManager';
import { GraduationManager } from './GraduationManager';

interface SettingsManagerProps {
  admins: User[];
  siswa: User[];
  currentRole: Role;
  onAddAdmin: (data: Partial<User>) => Promise<void>;
  onUpdateAdmin: (username: string, data: Partial<User>) => Promise<void>;
  onDeleteAdmin: (username: string) => Promise<void>;
  onPromoteClass: () => Promise<void>;
  onDeleteSiswaLulus: () => Promise<void>;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ 
  admins, 
  siswa, 
  currentRole, 
  onAddAdmin, 
  onUpdateAdmin, 
  onDeleteAdmin,
  onPromoteClass,
  onDeleteSiswaLulus
}) => {
  const canAccessGraduation = ['SUPERADMIN', 'ADMINSISWA'].includes(currentRole);
  const canAccessAdminManager = currentRole === 'SUPERADMIN';

  const [activeSubTab, setActiveSubTab] = useState<'admin' | 'graduation'>(
    canAccessAdminManager ? 'admin' : 'graduation'
  );

  // Sync tab if role changes or initial load
  useEffect(() => {
    if (!canAccessAdminManager && canAccessGraduation) {
      setActiveSubTab('graduation');
    } else if (canAccessAdminManager && !canAccessGraduation) {
      setActiveSubTab('admin');
    }
  }, [canAccessAdminManager, canAccessGraduation]);

  return (
    <div className="h-full flex flex-col space-y-6">
      {(canAccessAdminManager || canAccessGraduation) ? (
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
            {canAccessGraduation && (
              <button
                onClick={() => setActiveSubTab('graduation')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeSubTab === 'graduation' 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <GraduationCap size={18} />
                Kenaikan & Kelulusan
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
            {activeSubTab === 'graduation' && canAccessGraduation && (
              <GraduationManager 
                siswa={siswa} 
                onPromote={onPromoteClass} 
                onDeleteLulus={onDeleteSiswaLulus} 
              />
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
