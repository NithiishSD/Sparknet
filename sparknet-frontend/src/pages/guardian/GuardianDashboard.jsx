import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { guardianApi } from '../../api/guardianApi';
import { StatusBadge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

export const GuardianDashboard = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlinkTarget, setUnlinkTarget] = useState(null);

  const fetchChildren = async () => {
    try {
      const { data } = await guardianApi.getChildren();
      setChildren(data.children || []);
    } catch { toast.error('Failed to load children'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchChildren(); }, []);

  const handleUnlink = async () => {
    try {
      await guardianApi.unlinkChild(unlinkTarget.child._id);
      toast.success('Child unlinked');
      setUnlinkTarget(null);
      fetchChildren();
    } catch { toast.error('Failed to unlink child'); }
  };

  const handleStatusToggle = async (childId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await guardianApi.setChildStatus(childId, newStatus);
      toast.success(`Account ${newStatus}`);
      fetchChildren();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8 page-enter py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
        <div>
          <h1 className="font-headline font-black text-4xl text-on-surface tracking-tighter flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl">admin_panel_settings</span>
            Guardian Dashboard
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Monitoring {children.length} linked account{children.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="bg-surface-container rounded-3xl border border-outline-variant/5 p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-600 mb-4 opacity-50">family_restroom</span>
          <h3 className="font-headline font-bold text-xl text-on-surface mb-2">No active parent-child links</h3>
          <p className="text-slate-500 font-medium">Accounts citing you as primary guardian will populate here upon authorization.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {children.map((link) => (
            <ChildCard
              key={link.child?._id}
              link={link}
              onUnlink={() => setUnlinkTarget(link)}
              onStatusToggle={() => handleStatusToggle(link.child._id, link.child.status)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!unlinkTarget}
        title="Unlink Child Account"
        message={`Are you sure you want to unlink from ${unlinkTarget?.child?.username}? The account will be suspended.`}
        onConfirm={handleUnlink}
        onCancel={() => setUnlinkTarget(null)}
        danger
      />
    </div>
  );
};

const ChildCard = ({ link, onUnlink, onStatusToggle }) => {
  const { child, controls, approvedAt } = link;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface-container rounded-3xl border border-outline-variant/10 overflow-hidden shadow-sm hover:border-primary/20 transition-colors">
      <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center text-2xl font-headline font-black text-slate-300 shadow-inner">
            {child?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-1 tracking-wide">{child?.username}</h3>
            <p className="text-sm font-headline uppercase tracking-widest text-slate-500 font-bold">{child?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <StatusBadge status={child?.status} />
              <span className="text-[10px] bg-surface-container-highest px-3 py-1 rounded-full text-slate-400 font-headline font-bold uppercase tracking-widest border border-outline-variant/5">
                Linked on {formatDateTime(approvedAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <Link to={`/guardian/children/${child?._id}/activity`} className="btn-secondary py-2 flex-1 lg:flex-none text-center">
            Logs
          </Link>
          <button
            onClick={onStatusToggle}
            className={`py-2 px-4 rounded-xl font-headline font-bold text-[11px] uppercase tracking-widest transition-all flex-1 lg:flex-none ${child?.status === 'active' ? 'bg-error/10 text-error hover:bg-error/20 border border-error/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}`}
          >
            {child?.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="btn-secondary py-2 flex-1 lg:flex-none">
            {expanded ? 'Collapse' : 'Settings'}
          </button>
          <button onClick={onUnlink} className="py-2 px-4 rounded-xl font-headline font-bold text-[11px] uppercase tracking-widest bg-error text-on-error hover:bg-red-600 transition-colors flex-1 lg:flex-none">
             Unlink
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-outline-variant/10 p-6 md:p-8 bg-surface-container-high transition-all space-y-8">
          <ChildControls childId={child?._id} controls={controls} />
          <div className="border-t border-outline-variant/10 pt-8 mt-8">
            <ChildFollowRequests childId={child?._id} />
          </div>
        </div>
      )}
    </div>
  );
};

const ChildControls = ({ childId, controls: initialControls }) => {
  const [controls, setControls] = useState(initialControls || {});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await guardianApi.updateChildControls(childId, controls);
      toast.success('Changes saved');
    } catch { toast.error('Failed to save changes'); }
    finally { setSaving(false); }
  };

  const toggle = (field) => setControls({ ...controls, [field]: !controls[field] });
  const setVal = (field) => (e) => setControls({ ...controls, [field]: e.target.value });

  return (
    <div className="space-y-6">
      <h4 className="font-headline font-bold text-xs text-primary uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">settings_accessibility</span>
        Account Controls
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <ToggleRow label="Allow Messaging" value={controls.messagingAllowed} onChange={() => toggle('messagingAllowed')} />
        <ToggleRow label="Friend Requests & Follows" value={controls.friendRequestsAllowed} onChange={() => toggle('friendRequestsAllowed')} />
        <ToggleRow label="Enforce Time Limits" value={controls.screenTimeEnabled} onChange={() => toggle('screenTimeEnabled')} />
        
        <div className="bg-surface-container-highest p-4 rounded-2xl border border-outline-variant/10 flex flex-col justify-center">
          <label className="text-[11px] font-headline text-slate-500 uppercase tracking-widest block font-bold mb-2">Content Filtering</label>
          <select value={controls.contentLevel || 'strict'} onChange={setVal('contentLevel')} className="input-base w-full py-2.5">
            <option value="strict">Maximum Restrictions (Strict)</option>
            <option value="moderate">Standard Guardrails (Moderate)</option>
            <option value="relaxed">Minimal Interference (Relaxed)</option>
          </select>
        </div>
        
        {controls.screenTimeEnabled && (
          <div className="bg-surface-container-highest p-4 rounded-2xl border border-outline-variant/10 flex flex-col justify-center lg:col-span-2">
            <label className="text-[11px] font-headline text-slate-500 uppercase tracking-widest block font-bold mb-2">Daily Threshold (Minutes)</label>
            <input type="number" value={controls.screenTimeLimitMinutes || 120} onChange={setVal('screenTimeLimitMinutes')} min={15} max={1440} className="input-base w-full py-2.5" />
          </div>
        )}
      </div>
      <div className="pt-2">
        <button onClick={save} disabled={saving} className="btn-primary py-3 px-6 text-sm">
          {saving ? <><Spinner /> Saving...</> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

const ToggleRow = ({ label, value, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-surface-container-highest border border-outline-variant/10 hover:border-outline-variant/30 transition-all h-full">
    <span className="text-sm font-headline font-bold text-slate-300">{label}</span>
    <div onClick={onChange} className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-surface-container'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-[1.75rem]' : 'translate-x-1'}`} />
    </div>
  </label>
);

const ChildFollowRequests = ({ childId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await guardianApi.getPendingFollowRequests(childId);
      setRequests(data.requests || []);
    } catch {
      toast.error('Failed to load follow requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [childId]);

  const handleAction = async (requestId, action) => {
    try {
      if (action === 'approve') {
        await guardianApi.approveFollowRequest(childId, requestId);
        toast.success('Request approved');
      } else {
        await guardianApi.declineFollowRequest(childId, requestId);
        toast.success('Request declined');
      }
      setRequests(reqs => reqs.filter(r => r._id !== requestId));
    } catch {
      toast.error(`Failed to ${action} request`);
    }
  };

  if (loading) return <div className="py-4"><Spinner size="sm" /></div>;

  return (
    <div className="space-y-4">
      <h4 className="font-headline font-bold text-xs text-primary uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">group_add</span>
        Pending Follow Queries ({requests.length})
      </h4>
      {requests.length === 0 ? (
        <p className="text-slate-500 text-sm italic">No pending follow requests.</p>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req._id} className="bg-surface-container rounded-2xl p-4 flex items-center justify-between border border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center font-bold text-on-surface overflow-hidden">
                  {req.follower?.oauthAvatarUrl ? (
                    <img src={req.follower.oauthAvatarUrl} alt={req.follower.username} className="w-full h-full object-cover" />
                  ) : (
                    req.follower?.username?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm font-headline">{req.follower?.username}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Role: {req.follower?.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(req._id, 'decline')} className="px-4 py-1.5 rounded-full text-xs font-bold font-headline uppercase bg-surface-container-highest text-slate-300 hover:text-error hover:bg-error/10 transition-colors">
                  Decline
                </button>
                <button onClick={() => handleAction(req._id, 'approve')} className="px-4 py-1.5 rounded-full text-xs font-bold font-headline uppercase bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-[0_0_10px_rgba(173,198,255,0.2)]">
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
