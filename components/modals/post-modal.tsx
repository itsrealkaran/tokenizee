"use client";

import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon } from "lucide-react";
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
  const { createPost } = useGlobal();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await createPost(formData.title, formData.content);
      if (success) {
        setFormData({ title: "", content: "" });
        setPreviewUrl(null);
        onClose();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-background p-4 sm:p-6 text-left align-middle shadow-xl transition-all border border-border">
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-base sm:text-lg font-medium leading-6 text-foreground"
                  >
                    Create New Post
                  </Dialog.Title>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-3 sm:mt-4 space-y-3 sm:space-y-4"
                >
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-foreground"
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
                      className="mt-1.5 sm:mt-2"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-foreground"
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
                      className="min-h-[120px] sm:min-h-[150px] mt-1.5 sm:mt-2"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="attachment"
                      className="block text-sm font-medium text-foreground"
                    >
                      Attachment
                    </label>
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-3 sm:gap-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          id="attachment"
                          name="attachment"
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                          disabled={true}
                        />
                        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-dashed border-input rounded-md text-muted-foreground">
                          <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          <span className="text-sm">Add Image</span>
                        </div>
                      </label>
                      {previewUrl && (
                        <div className="relative h-16 w-16 sm:h-20 sm:w-20">
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
                            className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                            disabled={isSubmitting}
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="h-8 sm:h-9 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-8 sm:h-9 text-sm"
                    >
                      {isSubmitting ? "Tokenizing..." : "Tokenize"}
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
