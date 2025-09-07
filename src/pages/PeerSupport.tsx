import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Heart, ThumbsUp } from 'lucide-react';

const PeerSupport = () => {
  const posts = [
    {
      title: "Dealing with exam anxiety - need support",
      author: "Anonymous Student",
      content: "Anyone else feeling overwhelmed with finals coming up? Looking for study strategies that work...",
      upvotes: 24,
      comments: 8,
      timeAgo: "2h ago"
    },
    {
      title: "Successfully managed my sleep schedule!",
      author: "Night Owl",
      content: "After months of poor sleep, I finally found a routine that works. Happy to share tips!",
      upvotes: 18,
      comments: 12,
      timeAgo: "4h ago"
    }
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <GlobalButtons
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
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
            <Button className="gradient-button">
              <MessageCircle className="mr-2 h-4 w-4" />
              Create New Post
            </Button>
          </div>

          <div className="space-y-6">
            {posts.map((post, index) => (
              <Card key={index} className="hover-lift">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                      <CardDescription>by {post.author} • {post.timeAgo}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.content}</p>
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      {post.upvotes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="mr-1 h-4 w-4" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Heart className="mr-1 h-4 w-4" />
                      Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PeerSupport;