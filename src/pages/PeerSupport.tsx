import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Users, MessageCircle, Heart, ThumbsUp, Plus, Send, X, AlertTriangle } from 'lucide-react';

const PeerSupport = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Dealing with exam anxiety - need support",
      author: "Anonymous Student",
      content: "Anyone else feeling overwhelmed with finals coming up? Looking for study strategies that work...",
      upvotes: 24,
      comments: [
        { id: 1, author: "Study Buddy", content: "Try the Pomodoro technique! 25min study, 5min break. Really helps with focus.", timeAgo: "1h ago", likes: 5 },
        { id: 2, author: "Calm Mind", content: "Deep breathing exercises before studying helped me a lot. You've got this! 💪", timeAgo: "45m ago", likes: 3 }
      ],
      timeAgo: "2h ago",
      liked: false,
      userUpvoted: false
    },
    {
      id: 2,
      title: "Successfully managed my sleep schedule!",
      author: "Night Owl",
      content: "After months of poor sleep, I finally found a routine that works. Happy to share tips!",
      upvotes: 18,
      comments: [
        { id: 1, author: "Sleepy Head", content: "What's your routine? I'm struggling with the same issue.", timeAgo: "3h ago", likes: 2 },
        { id: 2, author: "Night Owl", content: "No screens 1hr before bed, consistent bedtime, and chamomile tea! Game changer.", timeAgo: "2h ago", likes: 8 }
      ],
      timeAgo: "4h ago",
      liked: false,
      userUpvoted: false
    }
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [contentWarning, setContentWarning] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  // Content filter for harmful language
  const harmfulWords = [
    'stupid', 'idiot', 'hate', 'kill', 'die', 'suicide', 'harm', 'hurt', 'ugly', 'worthless',
    'loser', 'pathetic', 'failure', 'useless', 'trash', 'garbage', 'disgusting', 'awful',
    'terrible', 'horrible', 'worst', 'suck', 'dumb', 'moron', 'freak', 'weird', 'crazy'
  ];

  const checkContent = (text) => {
    const lowerText = text.toLowerCase();
    const foundHarmful = harmfulWords.find(word => lowerText.includes(word));
    return foundHarmful;
  };

  const handleContentSubmission = (text, type, callback) => {
    const harmfulWord = checkContent(text);
    if (harmfulWord) {
      setContentWarning(`We noticed your ${type} contains language that might not be supportive. Our community focuses on kindness and encouragement. Please consider rephrasing your message to be more positive and helpful.`);
      setShowWarning(true);
      return false;
    }
    callback();
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <GlobalButtons
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      {/* Floating Theme Toggle - Always Visible */}
      <ThemeToggle variant="floating" />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Peer Support Forum 🤝  
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with other students in a safe, anonymous community for mutual support and understanding.
            </p>
          </div>

          <div className="mb-8">
            <Button 
              className="gradient-button"
              onClick={() => setShowNewPostForm(!showNewPostForm)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {showNewPostForm ? 'Cancel' : 'Create New Post'}
            </Button>
          </div>

          {/* New Post Form */}
          {showNewPostForm && (
            <Card className="wellness-card mb-8 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Share Your Thoughts Anonymously</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowNewPostForm(false);
                      setNewPostTitle('');
                      setNewPostContent('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Your post will be completely anonymous. Share your experiences, ask for support, or offer help to others.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post title (e.g., 'Need help with study motivation')"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="text-lg"
                />
                <Textarea
                  placeholder="Share your thoughts, experiences, or questions. Remember, this is a safe space for support and understanding."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Be kind, supportive, and respectful. We're all here to help each other.
                  </p>
                  <Button 
                    className="gradient-button"
                    onClick={() => {
                      if (newPostTitle.trim() && newPostContent.trim()) {
                        handleContentSubmission(
                          newPostTitle + ' ' + newPostContent,
                          'post',
                          () => {
                            const newPost = {
                              id: posts.length + 1,
                              title: newPostTitle,
                              author: `Anonymous ${Math.floor(Math.random() * 1000)}`,
                              content: newPostContent,
                              upvotes: 0,
                              comments: [],
                              timeAgo: 'Just now',
                              liked: false,
                              userUpvoted: false
                            };
                            setPosts([newPost, ...posts]);
                            setNewPostTitle('');
                            setNewPostContent('');
                            setShowNewPostForm(false);
                          }
                        );
                      }
                    }}
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Post Anonymously
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="wellness-card hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-2 text-foreground">{post.title}</CardTitle>
                      <CardDescription className="nav-item">by {post.author} • {post.timeAgo}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.content}</p>
                  <div className="flex items-center space-x-4 mb-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`nav-item ${post.userUpvoted ? 'text-primary bg-primary/10' : ''}`}
                      onClick={() => {
                        setPosts(posts.map(p => 
                          p.id === post.id 
                            ? { ...p, upvotes: p.userUpvoted ? p.upvotes - 1 : p.upvotes + 1, userUpvoted: !p.userUpvoted }
                            : p
                        ));
                      }}
                    >
                      <ThumbsUp className={`mr-1 h-4 w-4 ${post.userUpvoted ? 'fill-current' : ''}`} />
                      {post.upvotes}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="nav-item"
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      {post.comments.length}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`nav-item ${post.liked ? 'text-red-500' : ''}`}
                      onClick={() => {
                        setPosts(posts.map(p => 
                          p.id === post.id ? { ...p, liked: !p.liked } : p
                        ));
                      }}
                    >
                      <Heart className={`mr-1 h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                      {post.liked ? 'Supported' : 'Support'}
                    </Button>
                  </div>

                  {/* Comments Section */}
                  {expandedPost === post.id && (
                    <div className="border-t border-border/50 pt-4 mt-4">
                      <h4 className="font-medium text-foreground mb-3">Comments ({post.comments.length})</h4>
                      
                      {/* Existing Comments */}
                      <div className="space-y-3 mb-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="bg-accent/50 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-foreground">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs h-6 px-2"
                              onClick={() => {
                                setPosts(posts.map(p => 
                                  p.id === post.id 
                                    ? {
                                        ...p, 
                                        comments: p.comments.map(c => 
                                          c.id === comment.id 
                                            ? { ...c, likes: c.likes + 1 }
                                            : c
                                        )
                                      }
                                    : p
                                ));
                              }}
                            >
                              <Heart className="mr-1 h-3 w-3" />
                              {comment.likes}
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment Form */}
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Add a supportive comment..."
                          value={replyingTo === post.id ? newComment : ''}
                          onChange={(e) => {
                            setNewComment(e.target.value);
                            setReplyingTo(post.id);
                          }}
                          className="flex-1 min-h-[60px] text-sm"
                        />
                        <Button 
                          className="gradient-button self-end"
                          onClick={() => {
                            if (newComment.trim()) {
                              handleContentSubmission(
                                newComment,
                                'comment',
                                () => {
                                  const newCommentObj = {
                                    id: post.comments.length + 1,
                                    author: `Anonymous ${Math.floor(Math.random() * 1000)}`,
                                    content: newComment,
                                    timeAgo: 'Just now',
                                    likes: 0
                                  };
                                  setPosts(posts.map(p => 
                                    p.id === post.id 
                                      ? { ...p, comments: [...p.comments, newCommentObj] }
                                      : p
                                  ));
                                  setNewComment('');
                                  setReplyingTo(null);
                                }
                              );
                            }
                          }}
                          disabled={!newComment.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Warning Modal */}
          {showWarning && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="wellness-card w-full max-w-md bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Let's Keep It Positive
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {contentWarning}
                  </p>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      💙 <strong>Remember:</strong> This is a safe space where we support each other through challenges. 
                      Kind words can make a real difference in someone's day.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowWarning(false);
                        setContentWarning('');
                      }}
                    >
                      I'll Rephrase
                    </Button>
                    <Button
                      className="flex-1 gradient-button"
                      onClick={() => {
                        setShowWarning(false);
                        setContentWarning('');
                      }}
                    >
                      Got It
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PeerSupport;