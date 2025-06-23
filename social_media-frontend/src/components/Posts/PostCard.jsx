export function PostCard({ post, onLike }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center space-x-4">
        <img
          src={post.profile_pic || '/default-avatar.png'}
          alt={post.name || 'Unknown Author'}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{post?.name || 'Unknown authorrr'}</p>
          <p className="text-gray-500 text-sm">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <p className="mt-4">{post.content}</p>

      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="mt-4 rounded-lg max-h-96 w-full object-cover"
        />
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-gray-600">
          👍 {post.likes} {post.likes === 1 ? 'like' : 'likes'}
        </p>
        <button
          onClick={() => onLike(post.id)}
          className="text-blue-500 hover:underline"
        >
          Like
        </button>
      </div>
    </div>
  );
}
