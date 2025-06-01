"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContentWrapper,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useGlobal } from "@/context/global-context";
import { toast } from "react-hot-toast";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostModal({ isOpen, onClose }: PostModalProps) {
  const { createPost, topic } = useGlobal();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    topics: [] as string[],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topicSearch, setTopicSearch] = useState("");

  const filteredTopics = topic.filter((t) =>
    t.toLowerCase().includes(topicSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.topics.length === 0) {
      toast.error("Please select at least one topic");
      return;
    }
    setIsSubmitting(true);

    try {
      const { postId } = await createPost(
        formData.title,
        formData.content,
        formData.topics
      );
      if (postId) {
        setFormData({ title: "", content: "", topics: [] });
        setPreviewUrl(null);
        onClose();
        toast.success("Post created successfully!");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTopicSelect = (selectedTopic: string) => {
    setFormData((prev) => {
      if (prev.topics.includes(selectedTopic)) {
        return {
          ...prev,
          topics: prev.topics.filter((t) => t !== selectedTopic),
        };
      }
      return {
        ...prev,
        topics: [...prev.topics, selectedTopic],
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogContentWrapper>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Title
                </label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter post title"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Content
                </label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="What's on your mind?"
                  required
                  className="min-h-[120px] w-full resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="topics"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Topics
                </label>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Search topics..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    className="w-full"
                  />
                  <div className="max-h-32 overflow-y-auto rounded-md border bg-muted/5 p-2">
                    <div className="flex flex-wrap gap-2">
                      {filteredTopics.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleTopicSelect(t)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            formData.topics.includes(t)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {formData.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.topics.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleTopicSelect(t)}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {t}
                          <X className="h-3 w-3 ml-1" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="attachment"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Attachment
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex-1">
                    <input
                      type="file"
                      id="attachment"
                      name="attachment"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                      disabled={true}
                    />
                    <div className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-input rounded-md text-muted-foreground hover:bg-muted/5 transition-colors">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Add Image</span>
                    </div>
                  </label>
                  {previewUrl && (
                    <div className="relative h-16 w-16 flex-none">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                        }}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContentWrapper>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 text-sm"
            >
              {isSubmitting ? "Tokenizing..." : "Tokenize"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
