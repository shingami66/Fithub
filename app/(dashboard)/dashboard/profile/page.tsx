import { User, Settings, LogOut, Shield } from 'lucide-react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-full bg-[#050505] p-6 pb-32">
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

        {/* User Card */}
        <div className="bg-[#111111] border border-white/[0.05] rounded-3xl p-6 flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#deff9a]/10 flex items-center justify-center border border-[#deff9a]/20">
            <User className="w-8 h-8 text-[#deff9a]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{session.user?.name || 'Athlete'}</h2>
            <p className="text-sm text-neutral-500">{session.user?.email}</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-[#111111] border border-white/[0.05] rounded-3xl overflow-hidden">
          <button className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors border-b border-white/[0.02]">
            <Settings className="w-5 h-5 text-neutral-400" />
            <span className="text-sm font-medium text-white">App Settings</span>
          </button>
          <button className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors border-b border-white/[0.02]">
            <Shield className="w-5 h-5 text-neutral-400" />
            <span className="text-sm font-medium text-white">Privacy & Security</span>
          </button>
          <button className="w-full flex items-center gap-4 p-5 hover:bg-[#ff9a9a]/5 transition-colors">
            <LogOut className="w-5 h-5 text-[#ff9a9a]" />
            <span className="text-sm font-medium text-[#ff9a9a]">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
