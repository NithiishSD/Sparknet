import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../api/postApi';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/helpers';
import { profileApi } from '../api/profileApi';

/* ── Post Composer ─────────────────────────────────────── */
const Composer = ({ onPosted }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  
  // Media & Tags
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const fileInputRef = useRef(null);

  const avatarL = user?.username?.[0]?.toUpperCase() ?? '?';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Image too large (> 5MB)');
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setBusy(true);

    try {
      const formData = new FormData();
      formData.append('content_text', content);
      if (image) formData.append('media', image);
      if (tags.trim()) {
        const tagArray = tags.split(',').map(t => t.trim().replace('#', '')).filter(Boolean);
        tagArray.forEach(t => formData.append('tags[]', t));
      }

      await postApi.createPost(formData);
      
      toast.success('Posted! ⚡');
      setContent('');
      setTags('');
      removeImage();
      setFocused(false);
      setShowTagInput(false);
      onPosted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 rounded-3xl bg-surface-container ${
        focused ? 'shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-2 ring-primary/40' : 'shadow-2xl hover:bg-surface-container-high'
      }`}
    >
      <form onSubmit={submit}>
        <div className="flex gap-4 p-6">
          <div className="w-12 h-12 rounded-full flex-shrink-0 bg-surface-container-highest flex items-center justify-center text-on-surface font-headline font-bold text-lg overflow-hidden border border-outline-variant/30">
            {user?.oauthAvatarUrl
              ? <img src={user.oauthAvatarUrl} alt="me" className="w-full h-full object-cover" />
              : avatarL}
          </div>
          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-on-surface placeholder:text-slate-500 font-medium py-2 outline-none"
            placeholder={`What's on your mind, ${user?.username?.split('_')[0]}?`}
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            rows={focused ? 3 : 2}
          />
        </div>

        {(focused || content || image) && (
          <div className="px-6 pb-6 animate-fade-in space-y-4">
            {/* Tag Input Field */}
            {showTagInput && (
              <div className="flex items-center gap-3 bg-surface-container-highest/50 px-4 py-2 rounded-2xl border border-outline-variant/10 animate-slide-up">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">label</span>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Add tags (comma separated)..."
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1 outline-none text-on-surface"
                />
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-2xl overflow-hidden border border-outline-variant/20 animate-slide-up group/img">
                <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-64 object-cover" />
                <button 
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-error transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2 text-slate-400">
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Add Photo"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none ${image ? 'bg-primary/20 text-primary' : 'hover:bg-surface-container-highest hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined">photo_camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTagInput(!showTagInput)}
                  title="Add Tags"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none ${tags ? 'bg-primary/20 text-primary' : 'hover:bg-surface-container-highest hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined">label</span>
                </button>

                <button
                  type="button"
                  title="Mood"
                  onClick={() => setContent(c => c + ' 😊')}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-highest hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined">mood</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-xs font-headline ${content.length > 1800 ? 'text-error' : 'text-slate-500'}`}>
                  {2000 - content.length} chars
                </span>
                <button
                  type="submit"
                  disabled={(!content.trim() && !image) || busy}
                  className="btn-primary py-2 px-6 disabled:opacity-40"
                >
                  {busy ? 'Processing...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

/* ── CommentItem ─────────────────────────────────────────── */
const CommentItem = ({ comment, onReply, depth = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const replies = comment.replies || [];

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(comment._id, replyText);
    setReplyText('');
    setShowReplyInput(false);
    setShowReplies(true);
  };

  return (
    <div className={`space-y-3 ${depth > 0 ? 'ml-8 mt-2 border-l-2 border-outline-variant/10 pl-4' : ''}`}>
      <div className="flex gap-4 animate-slide-up">
        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 text-xs font-bold font-headline text-slate-300">
          {comment.authorName?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 bg-surface-container rounded-2xl rounded-tl-none p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-primary font-headline">
                {comment.authorName}
              </span>
              <span className="text-[10px] text-slate-500 font-headline uppercase leading-none">
                {formatDateTime(comment.createdAt)}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            {comment.content}
          </p>
          
          <div className="flex items-center gap-4">
            {depth === 0 && (
              <button 
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">reply</span>
                {showReplyInput ? 'Cancel' : 'Reply'}
              </button>
            )}
            
            {replies.length > 0 && depth === 0 && (
              <button 
                onClick={() => setShowReplies(!showReplies)}
                className="text-[10px] uppercase tracking-widest font-bold text-tertiary-fixed hover:text-tertiary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">
                  {showReplies ? 'expand_less' : 'expand_more'}
                </span>
                {showReplies ? 'Hide' : `Show ${replies.length}`} Replies
              </button>
            )}
          </div>

          {showReplyInput && (
            <form onSubmit={handleReplySubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                autoFocus
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Reply to this comment..."
                className="input-base flex-1 !text-xs !py-1.5 !bg-surface-container-lowest"
              />
              <button 
                type="submit" 
                disabled={!replyText.trim()}
                className="btn-primary !py-1 !px-3 !text-[10px] !rounded-lg"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>

      {showReplies && replies.map(reply => (
        <CommentItem key={reply._id} comment={reply} onReply={onReply} depth={depth + 1} />
      ))}
    </div>
  );
};

/* ── PostCard ───────────────────────────────────────────── */
const PostCard = ({ post, style, onSaveToggle, onFollowChange }) => {
  const [liked, setLiked] = useState(post.isLikedByMe);
  const [count, setCount]  = useState(post.likesCount ?? post.likeCount ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment]     = useState('');
  const [comments, setComments]         = useState(post.comments ?? []);
  const [saved, setSaved] = useState(post.isSavedByMe ?? false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportCategory, setReportCategory] = useState('inappropriate');
  const [reporting, setReporting] = useState(false);

  const authorName = post.authorName ?? post.user?.username ?? 'Unknown';
  const authorAvatar = post.user?.oauthAvatarUrl ?? null;
  const avatarL = authorName?.[0]?.toUpperCase() ?? '?';

  const [followState, setFollowState] = useState(post.followStatus || null); // null, 'pending', 'accepted'
  
  useEffect(() => {
    setFollowState(post.followStatus || null);
  }, [post.followStatus]);

  const [followingBusy, setFollowingBusy] = useState(false);
  const { user } = useAuth();
  const isOwner = String(user?._id || user?.id) === String(post.user?._id || post.user?.id);
  
  const handleFollowClick = async () => {
    if (followState || followingBusy) return;
    setFollowingBusy(true);
    try {
      const { data } = await profileApi.followUser(post.user?._id || post.user?.id);
      if (data.message.includes('pending') || data.message.includes('sent to guardian')) {
        setFollowState('pending');
        onFollowChange?.(post.user?._id || post.user?.id, 'pending');
        toast.success('Follow request sent to guardian');
      } else {
        setFollowState('accepted');
        onFollowChange?.(post.user?._id || post.user?.id, 'accepted');
        toast.success(`Following ${authorName}`);
      }
    } catch {
      toast.error('Failed to follow user');
    } finally {
      setFollowingBusy(false);
    }
  };

  const toggleLike = async () => {
    const prev = liked;
    setLiked(!liked);
    setCount(c => liked ? c - 1 : c + 1);
    try {
      liked ? await postApi.unlikePost(post._id ?? post.id)
             : await postApi.likePost(post._id ?? post.id);
    } catch {
      setLiked(prev);
      setCount(c => prev ? c + 1 : c - 1);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await postApi.addComment(post._id ?? post.id, newComment);
      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      }
    } catch { toast.error('Failed to post comment'); }
  };

  const handleReplyComment = async (commentId, content) => {
    try {
      const { data } = await postApi.replyToComment(commentId, content);
      if (data.success) {
        // Find parent comment and append reply locally
        setComments(prev => prev.map(c => {
          if (c._id === commentId) {
            return { ...c, replies: [data.comment, ...(c.replies || [])] };
          }
          return c;
        }));
      }
    } catch { toast.error('Failed to post reply'); }
  };

  const toggleSave = async () => {
    const prev = saved;
    setSaved(!saved);
    try {
      saved ? await postApi.unsavePost(post._id ?? post.id) : await postApi.savePost(post._id ?? post.id);
      if (!saved) toast.success('Post saved!');
      onSaveToggle?.();
    } catch {
      setSaved(prev);
      toast.error('Failed to save post');
    }
  };

  const submitReport = async () => {
    if (!reportReason.trim()) return toast.error('Please provide a reason');
    setReporting(true);
    try {
      await postApi.reportPost(post._id ?? post.id, reportReason, reportCategory);
      toast.success('Report submitted. Thank you!');
      setShowReport(false);
      setReportReason('');
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setReporting(false);
    }
  };

  return (
    <div
      className="bg-surface-container rounded-3xl overflow-hidden hover:bg-surface-container-high transition-colors duration-300 glass-card animate-fade-in group"
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/20 bg-surface-container-highest flex items-center justify-center font-bold text-on-surface">
            {authorAvatar
              ? <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              : avatarL}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-headline font-bold text-on-surface tracking-tight">
                {authorName}
              </p>
              {post.user?.role === 'child' && (
                <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_good</span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium font-headline">
              {formatDateTime(post.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Follow Button - Admin does not need following logic */}
          {(user?.role !== 'admin' && post.user?.role !== 'admin') && String(user?._id || user?.id) !== String(post.user?._id || post.user?.id) && (
            <button
              onClick={handleFollowClick}
              disabled={!!followState || followingBusy}
              className={`px-4 py-1.5 rounded-full text-xs font-bold font-headline uppercase tracking-widest transition-all ${
                followState === 'accepted' 
                  ? 'bg-surface-container-highest text-primary border border-primary/20'
                  : followState === 'pending'
                  ? 'bg-surface-container-highest text-tertiary border border-tertiary/20 opacity-80'
                  : 'bg-primary text-on-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(173,198,255,0.2)]'
              }`}
            >
              {followingBusy ? '...' : followState === 'accepted' ? 'Following' : followState === 'pending' ? 'Requested' : 'Follow'}
            </button>
          )}

          {/* Risk badge */}
          {post.risk_score > 0.3 && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-error-container text-on-error-container">
              Mod Review
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-medium">
          {post.content_text ?? post.content}
        </p>

        {post.media_url && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-outline-variant/10">
            {post.media_url.match(/\.(mp4|webm|ogg)$|pexels/i) ? (
              <video
                src={post.media_url}
                controls
                className="w-full h-auto max-h-[500px] bg-black"
                poster="/video-placeholder.jpg"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={post.media_url}
                alt="Post media"
                className="w-full h-auto object-cover max-h-[500px] hover:scale-[1.02] transition-transform duration-500"
              />
            )}
          </div>
        )}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-surface-container-highest text-[10px] font-headline uppercase tracking-widest text-primary rounded-full hover:bg-primary/20 cursor-pointer transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low">
        {isOwner ? (
          // Owner sees stats, not action buttons
          <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold bg-primary/5 text-primary/80">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="font-headline tracking-tighter">
              {count} {count === 1 ? 'Like' : 'Likes'}
            </span>
          </div>
        ) : (
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 outline-none ${
              liked 
                ? 'bg-primary/15 text-primary shadow-[0_4px_12px_rgba(173,198,255,0.2)]' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-container-highest hover:shadow-lg'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            <span className="font-headline tracking-tighter decoration-0">
              {count > 0 ? count : ''} Like
            </span>
          </button>
        )}

        {/* Comment */}
        <button
          onClick={() => setShowComments(s => !s)}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 outline-none ${
            showComments 
              ? 'bg-tertiary/15 text-tertiary shadow-[0_4px_12px_rgba(255,218,102,0.2)]' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-container-highest hover:shadow-lg'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: showComments ? "'FILL' 1" : "'FILL' 0" }}>chat_bubble</span>
          <span className="font-headline tracking-tighter">
            {(post.commentCount ?? 0) > 0 ? post.commentCount : ''} Comment
          </span>
        </button>

        {/* Save */}
        <button
          onClick={toggleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 outline-none ml-auto ${
            saved ? 'bg-tertiary/10 text-tertiary' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-container-highest'
          }`}
          title={saved ? 'Unsave' : 'Save'}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
        </button>

        {/* Report / Report Count */}
        {isOwner ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-full text-error/60 font-bold text-xs" title="Total reports received">
            <span className="material-symbols-outlined text-[18px]">flag</span>
            <span>{post.reportCount || 0}</span>
          </div>
        ) : (
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-slate-600 hover:text-error hover:bg-error/10 transition-all duration-200 outline-none"
            title="Report post"
          >
            <span className="material-symbols-outlined text-[18px]">flag</span>
          </button>
        )}
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowReport(false)} />
          <div className="relative bg-surface-container rounded-3xl w-full max-w-sm border border-outline-variant/10 shadow-2xl p-6 animate-slide-up">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">flag</span> Report Post
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-headline uppercase tracking-widest text-slate-500 font-bold mb-2 block">Category</label>
                <select
                  value={reportCategory}
                  onChange={e => setReportCategory(e.target.value)}
                  className="input-base w-full"
                >
                  {['inappropriate', 'spam', 'harassment', 'misinformation', 'hate_speech', 'other'].map(c => (
                    <option key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-headline uppercase tracking-widest text-slate-500 font-bold mb-2 block">Reason</label>
                <textarea
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Describe the issue..."
                  className="input-base w-full min-h-[80px] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowReport(false)} className="flex-1 py-2 rounded-xl border border-outline-variant/20 text-slate-400 hover:text-slate-200 text-sm font-bold font-headline transition-colors">Cancel</button>
                <button onClick={submitReport} disabled={reporting} className="flex-1 py-2 rounded-xl bg-error text-white text-sm font-bold font-headline disabled:opacity-50">
                  {reporting ? 'Sending...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Drawer */}
      {showComments && (
        <div className="px-6 pb-6 pt-4 bg-surface-container-low animate-fade-in outline-none rounded-b-3xl">
          <form onSubmit={postComment} className="flex gap-3 mt-2">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="input-base flex-1 !rounded-full !bg-surface-container-highest text-sm"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="btn-primary !rounded-full px-6 disabled:opacity-40"
            >
              Post
            </button>
          </form>

          {comments.length > 0 && (
            <div className="space-y-6 mt-8">
              {comments.map((c, i) => (
                <CommentItem 
                  key={c._id ?? i} 
                  comment={c} 
                  onReply={handleReplyComment} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Skeleton ───────────────────────────────────────────── */
const PostSkeleton = () => (
  <div className="bg-surface-container rounded-3xl overflow-hidden p-6">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-full bg-surface-container-highest animate-pulse" />
      <div className="space-y-3 flex-1">
        <div className="h-3 bg-surface-container-highest rounded animate-pulse w-1/3" />
        <div className="h-2 bg-surface-container-highest rounded animate-pulse w-1/4" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-surface-container-highest rounded animate-pulse w-[90%]" />
      <div className="h-3 bg-surface-container-highest rounded animate-pulse w-[75%]" />
      <div className="h-3 bg-surface-container-highest rounded animate-pulse w-[55%]" />
    </div>
  </div>
);

/* ── Main Page ──────────────────────────────────────────── */
export const HomeFeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('foryou');

  const fetchFeed = async (currentTab = tab) => {
    try {
      setLoading(true);
      let res;
      if (currentTab === 'foryou') res = await postApi.getFeed();
      else if (currentTab === 'trending') res = await postApi.getTrending();
      else if (currentTab === 'following') res = await postApi.getFollowingFeed();
      else if (currentTab === 'yourposts') res = await postApi.getUserPosts(user?._id || user?.id);
      
      if(res) {
        setPosts(res.data.posts ?? []);
      }
    } catch {
      toast.error('Failed to sync feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user && tab !== 'saved') fetchFeed(tab); 
  }, [tab, user]);

  const [followStatuses, setFollowStatuses] = useState({});
  
  const fetchFollowStatuses = async () => {
    try {
      const { data } = await profileApi.getConnectionStatuses();
      setFollowStatuses(data.statuses || {});
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowChange = (userId, newStatus) => {
    setFollowStatuses(prev => ({
      ...prev,
      [userId]: newStatus
    }));
  };

  useEffect(() => { 
    if (user) {
      fetchFollowStatuses();
    }
  }, [user]);

  // Load saved posts when tab changes
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const fetchSaved = async () => {
    setLoadingSaved(true);
    try {
      const { data } = await postApi.getSavedPosts();
      setSavedPosts(data.posts ?? data.data ?? []);
    } catch { toast.error('Failed to load saved posts'); }
    finally { setLoadingSaved(false); }
  };

  useEffect(() => {
    if (tab === 'saved') fetchSaved();
  }, [tab]);

  return (
    <div className="flex gap-8 page-enter w-full max-w-6xl mx-auto py-8 px-4 sm:px-6">

      {/* ── Main Column ── */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* Tab Bar */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-on-surface font-headline tracking-tighter">
            Feed <span className="text-primary pulse-dot inline-block ml-2 mb-1 w-2 h-2 rounded-full"></span>
          </h1>
          <div className="flex bg-surface-container p-1 rounded-full border border-outline-variant/10">
            {[{ id: 'foryou', label: 'For You' },
              ...(user?.role !== 'admin' ? [{ id: 'following', label: 'Following' }] : []),
              { id: 'trending', label: 'Trending' },
              { id: 'yourposts', label: 'Your Posts' },
              { id: 'saved', label: 'Saved' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-2 rounded-full text-[11px] font-bold font-headline uppercase tracking-widest transition-all duration-300 ${
                  tab === t.id 
                  ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(173,198,255,0.3)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-container-highest'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Composer */}
        {user?.role !== 'child' && (
          <Composer onPosted={fetchFeed} />
        )}

        {/* Feed */}
        <div className="space-y-6 pb-20">
          {tab === 'saved' ? (
            // ── Saved posts
            loadingSaved ? (
              Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)
            ) : savedPosts.length === 0 ? (
              <div className="text-center py-24 bg-surface-container rounded-3xl border border-outline-variant/10 flex flex-col items-center">
                <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">bookmark</span>
                <p className="font-bold text-slate-300 font-headline text-lg">No Saved Posts</p>
                <p className="text-sm text-slate-500 mt-1">Bookmark posts you want to revisit.</p>
              </div>
            ) : (
              savedPosts.map((post, i) => (
                <PostCard 
                  key={post._id ?? i} 
                  post={{...post, followStatus: followStatuses[post.user?._id || post.user?.id]}} 
                  style={{ animationDelay: `${i * 50}ms` }} 
                  onSaveToggle={fetchSaved} 
                  onFollowChange={handleFollowChange}
                />
              ))
            )
          ) : loading ? (
            Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
          ) : posts.length === 0 ? (
            <div className="text-center py-24 bg-surface-container rounded-3xl border border-outline-variant/10 flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 font-light animate-pulse">radar</span>
              <p className="font-bold text-slate-300 font-headline text-xl tracking-tight mb-2">No Posts Yet</p>
              <p className="text-sm text-slate-500 font-medium">Your feed is quiet. Be the first to create a post.</p>
            </div>
          ) : (
            posts.map((post, i) => (
              <PostCard
                key={post._id ?? post.id ?? i}
                post={{...post, followStatus: followStatuses[post.user?._id || post.user?.id]}}
                style={{ animationDelay: `${i * 50}ms` }}
                onFollowChange={handleFollowChange}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right Column ── */}
      <aside className="hidden xl:flex flex-col gap-6 w-80 shrink-0 sticky top-24 self-start">

        {/* Spark Stats */}
        <div className="bg-surface-container rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
          <h3 className="font-bold text-on-surface text-sm mb-5 font-headline uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">analytics</span>
            Profile Info
          </h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {[
              { label: 'Credits',  value: user?.points ?? 0,         color: 'text-primary' },
              { label: 'Badges',   value: user?.badges?.length ?? 0, color: 'text-tertiary-fixed' },
              { label: 'Status',value: user?.status ?? '—',       color: 'text-slate-300' },
              { label: 'Role',     value: user?.role ?? '—',         color: 'text-slate-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-surface-container-highest p-4 rounded-2xl flex flex-col items-center justify-center border border-outline-variant/10 hover:border-primary/30 transition-colors">
                <p className={`font-black text-xl font-headline ${stat.color}`}>
                  {String(stat.value).toUpperCase()}
                </p>
                <p className="text-[9px] mt-1 font-bold font-headline uppercase tracking-[0.2em] text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-container rounded-3xl p-6">
          <h3 className="font-bold text-on-surface text-sm mb-4 font-headline uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">bolt</span>
            Quick Links
          </h3>
          <div className="space-y-3">
            {[
              { href:'/profile',     icon:'person',             label:'View Profile',    sub:'Your public page' },
              ...(user?.role !== 'admin' ? [
                { href:'/challenges',  icon:'workspace_premium',  label:'Challenges',        sub:'Earn more credits' },
                { href:'/messages',    icon:'chat',               label:'Messages',    sub:'Check your messages' }
              ] : [])
            ].map(a => (
              <a
                key={a.href}
                href={a.href}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-surface-container-highest group"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all">
                   <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors font-headline">
                    {a.label}
                  </p>
                  <p className="text-xs text-slate-500">{a.sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Platform info */}
        <div className="text-center">
            <p className="text-[10px] text-slate-500 font-headline uppercase tracking-widest font-bold">
            SparkNet<br/>Secure Social Platform<br/>{new Date().getFullYear()}
            </p>
        </div>
      </aside>
    </div>
  );
};
