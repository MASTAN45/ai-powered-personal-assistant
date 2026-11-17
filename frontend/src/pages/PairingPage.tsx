import { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { pairingAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, X } from 'lucide-react';
import { brandColors } from '../utils/brandColors';

export default function PairingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [invitationCode, setInvitationCode] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const { data: pairings, isLoading } = useQuery({
    queryKey: ['pairings'],
    queryFn: () => pairingAPI.getMyPairings().then(res => res.data.data.pairings),
  });

  const createInvitation = useMutation({
    mutationFn: (email: string) => pairingAPI.createInvitation(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pairings'] });
      setClientEmail('');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Failed to create invitation'),
  });

  const acceptInvitation = useMutation({
    mutationFn: (code: string) => pairingAPI.acceptInvitation(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pairings'] });
      setInvitationCode('');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Invalid invitation code'),
  });

  const revokePairing = useMutation({
    mutationFn: (id: string) => pairingAPI.revoke(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pairings'] }),
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>

        <div className={`${brandColors.gradient.primary} text-white p-6 rounded-lg mb-8`}>
          <h1 className="text-3xl font-bold">Client Pairing</h1>
          <p className="text-white/90 mt-2">Manage your client relationships and invitations</p>
        </div>

        {user?.role === 'ASSISTANT' ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Invite New Client</h2>
              {error && <div className="mb-4 p-3 bg-brand-red-50 dark:bg-brand-red-900/20 border border-brand-red-200 dark:border-brand-red-800 rounded-lg text-brand-red-700 dark:text-red-300 text-sm">{error}</div>}
              <div className="flex gap-3">
                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500" />
                <button onClick={() => createInvitation.mutate(clientEmail)} disabled={!clientEmail || createInvitation.isPending}
                  className={`${brandColors.button.primary} px-6 py-2 rounded-lg disabled:opacity-50`}>
                  {createInvitation.isPending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Clients</h2>
              {isLoading ? <p className="text-gray-600 dark:text-gray-400">Loading...</p> :
                !pairings || pairings.length === 0 ? <p className="text-gray-600 dark:text-gray-400">No clients paired yet</p> :
                <div className="space-y-3">
                  {pairings.map((pairing: any) => (
                    <div key={pairing._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{pairing.client?.fullName || 'Client'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{pairing.client?.email}</p>
                        {pairing.status === 'PENDING' && (
                          <div className="mt-2 flex items-center gap-2">
                            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">{pairing.invitationCode}</code>
                            <button onClick={() => handleCopy(pairing.invitationCode)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              {copied ? <Check className="w-4 h-4 text-brand-green-600" /> : <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${pairing.status === 'ACCEPTED' ? brandColors.badge.green : brandColors.badge.yellow}`}>
                          {pairing.status === 'ACCEPTED' ? 'ACTIVE' : 'PENDING'}
                        </span>
                        <button onClick={() => revokePairing.mutate(pairing._id)} className={`p-2 ${brandColors.primary.text} hover:bg-brand-red-50 dark:hover:bg-brand-red-900/20 rounded-lg transition-colors`}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Accept Invitation</h2>
              {error && <div className="mb-4 p-3 bg-brand-red-50 dark:bg-brand-red-900/20 border border-brand-red-200 dark:border-brand-red-800 rounded-lg text-brand-red-700 dark:text-red-300 text-sm">{error}</div>}
              <div className="flex gap-3">
                <input type="text" value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} placeholder="Enter invitation code"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500" />
                <button onClick={() => acceptInvitation.mutate(invitationCode)} disabled={!invitationCode || acceptInvitation.isPending}
                  className={`${brandColors.button.primary} px-6 py-2 rounded-lg disabled:opacity-50`}>
                  {acceptInvitation.isPending ? 'Accepting...' : 'Accept'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Assistant</h2>
              {isLoading ? <p className="text-gray-600 dark:text-gray-400">Loading...</p> :
                !pairings || pairings.length === 0 ? <p className="text-gray-600 dark:text-gray-400">No assistant linked yet</p> :
                pairings.map((pairing: any) => (
                  <div key={pairing._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{pairing.assistant?.fullName || 'Assistant'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{pairing.assistant?.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${brandColors.badge.green}`}>ACTIVE</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  
    </AppLayout>
  );
}

