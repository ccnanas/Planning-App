import { useState } from 'react';

export function CommentSection({ comments, onAddComment, onDeleteComment, sectionId, theme }) {
  const { primary, dark, border, surface } = theme;
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem('commentAuthor') || '';
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    localStorage.setItem('commentAuthor', authorName);

    onAddComment({
      id: Date.now().toString(),
      author: authorName.trim(),
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
      sectionId,
    });

    setNewComment('');
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sectionComments = comments.filter(c => c.sectionId === sectionId);

  return (
    <div style={{ marginTop: 16, borderTop: `1px solid ${border}`, paddingTop: 16 }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: primary, padding: 0,
        }}
      >
        <span style={{
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>▶</span>
        Comments ({sectionComments.length})
      </button>

      {isExpanded && (
        <div style={{ marginTop: 12 }}>
          {sectionComments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {sectionComments.map((comment) => (
                <div key={comment.id} style={{
                  background: surface, borderRadius: 8,
                  padding: '12px 14px', border: `1px solid ${border}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: dark }}>{comment.author}</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8 }}>{formatDate(comment.timestamp)}</span>
                    </div>
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 14, color: '#9CA3AF', padding: '2px 6px', borderRadius: 4,
                      }}
                      title="Delete comment"
                    >
                      ×
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="Your name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                style={{
                  flex: '0 0 150px', padding: '8px 12px', borderRadius: 6,
                  border: `1px solid ${border}`, fontSize: 13, outline: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 6,
                  border: `1px solid ${border}`, fontSize: 13, outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || !authorName.trim()}
                style={{
                  padding: '8px 16px', borderRadius: 6, border: 'none',
                  background: newComment.trim() && authorName.trim() ? primary : '#D1D9E6',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: newComment.trim() && authorName.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                }}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
