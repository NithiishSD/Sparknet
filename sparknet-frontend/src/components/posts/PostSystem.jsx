import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postApi } from '../../api/postApi';
import { toast } from 'react-hot-toast';
import { formatDateTime } from '../../utils/helpers';

export const PostCard = ({ post, onLike, onReport }) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const handleLike = async () => {
    const originalLiked = isLiked;
    const originalCount = likesCount;

    // Optimistic Update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      if (originalLiked) {
        await postApi.unlikePost(post._id || post.id);
      } else {
        await postApi.likePost(post._id || post.id);
      }
      onLike && onLike(post._id || post.id);
    } catch (err) {
      // Rollback on error
      setIsLiked(originalLiked);
      setLikesCount(originalCount);
      toast.error(err.response?.data?.message || 'Failed to update like');
    }
  };

  return (
    <div className="spark-card overflow-hidden animate-fade-in group">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between border-b border-dark-600/50 hover:bg-dark-700/30 transition-colors">
        <Link to={`/users/${post.authorId}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-spark-500 to-purple-600 flex items-center justify-center text-white font-display font-700 shadow-lg shadow-spark-500/20">
            {post.authorName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-display font-600 text-gray-200 group-hover:text-spark-400 transition-colors">{post.authorName}</p>
            <p className="text-xs text-gray-500">{formatDateTime(post.createdAt)}</p>
          </div>
        </Link>
        <button 
          onClick={() => onReport && onReport(post._id || post.id)}
          className="text-gray-500 hover:text-red-400 p-2 rounded-full hover:bg-dark-600 transition-colors"
          title="Report Post"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </button>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content_text || post.content}</p>
        {post.mediaUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-dark-600">
            <img src={post.mediaUrl} alt="Post content" className="w-full h-auto object-cover max-h-96" />
          </div>
        )}
        {post.tags && post.tags.length > 0 && (
           <div className="flex flex-wrap gap-2 mt-4">
             {post.tags.map(tag => (
               <span key={tag} className="px-2 py-1 rounded-md bg-dark-600 text-xs font-mono text-spark-400 border border-dark-500">#{tag}</span>
             ))}
           </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 bg-dark-800/50 flex items-center gap-6 border-t border-dark-600">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}
        >
          <svg className={`w-5 h-5 transition-transform group-active:scale-75 ${isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          <span className="text-sm font-display font-500">{likesCount}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-400 hover:text-spark-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          <span className="text-sm font-display font-500">{post.commentsCount || 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-dark-800 border-t border-dark-600 p-4">
          <CommentSection postId={post._id || post.id} initialComments={post.comments} />
        </div>
      )}
    </div>
  );
};

export const CommentSection = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const { data } = await postApi.addComment(postId, newComment);
      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment('');
        toast.success('Comment posted');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-xs text-white shrink-0">
          Me
        </div>
        <div className="flex-1 flex gap-2">
          <input 
            type="text" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-spark-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={!newComment.trim()}
            className="bg-spark-600 hover:bg-spark-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm font-display font-600 transition-colors"
          >
            Post
          </button>
        </div>
      </form>

      <div className="space-y-3 mt-4">
        {comments.map(comment => (
          <div key={comment._id || comment.id} className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-xs text-white shrink-0">
              {comment.authorName?.[0]}
            </div>
            <div className="flex-1 bg-dark-700/50 rounded-xl rounded-tl-none p-3 border border-dark-600/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display font-600 text-sm text-gray-300">{comment.authorName}</span>
                <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-400">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
