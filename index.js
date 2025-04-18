const express = require("express");
const app = express();
app.use(express.json());

const PORT = 8000;

// In-memory store
let posts = [];

// Ingest new post
app.post("/ingest", (req, res) => {
  const { username, platform, content, likes, comments, shares, timestamp } =
    req.body;

  if (
    !username ||
    !platform ||
    !content ||
    likes < 0 ||
    comments < 0 ||
    shares < 0 ||
    !timestamp
  ) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const post = {
    username,
    platform,
    content,
    likes,
    comments,
    shares,
    timestamp,
  };
  posts.push(post);
  res.json({ message: "Post ingested successfully" });
});

// Get summary analytics
app.get("/analytics/summary", (req, res) => {
  if (posts.length === 0) {
    return res.status(404).json({ message: "No data available" });
  }

  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);

  const userActivity = {};
  posts.forEach((post) => {
    userActivity[post.username] = (userActivity[post.username] || 0) + 1;
  });

  const mostActiveUser = Object.entries(userActivity).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  res.json({
    total_posts: totalPosts,
    total_likes: totalLikes,
    average_likes_per_post: Number((totalLikes / totalPosts).toFixed(2)),
    most_active_user: mostActiveUser,
  });
});

// Get analytics for a specific user
app.get("/analytics/user/:username", (req, res) => {
  const username = req.params.username;
  const userPosts = posts.filter((post) => post.username === username);

  if (userPosts.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = userPosts.reduce((sum, post) => sum + post.comments, 0);
  const totalShares = userPosts.reduce((sum, post) => sum + post.shares, 0);

  res.json({
    username,
    total_posts: userPosts.length,
    total_likes: totalLikes,
    total_comments: totalComments,
    total_shares: totalShares,
    average_likes: Number((totalLikes / userPosts.length).toFixed(2)),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
