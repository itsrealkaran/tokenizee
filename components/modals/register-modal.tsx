"use client";

import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegisterFormData) => void;
  initialData?: RegisterFormData;
  isEditing?: boolean;
}

export interface RegisterFormData {
  newUsername: string;
  displayName: string;
  dateOfBirth: string;
  bio: string;
}

export function RegisterModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: RegisterModalProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    newUsername: "",
    displayName: "",
    dateOfBirth: "",
    bio: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

    if (!formData.newUsername) {
      newErrors.newUsername = "Username is required";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.newUsername)) {
      newErrors.newUsername =
        "Username can only contain letters, numbers, and underscores";
    } else if (formData.newUsername.length < 3) {
      newErrors.newUsername = "Username must be at least 3 characters";
    } else if (formData.newUsername.length > 30) {
      newErrors.newUsername = "Username must be less than 30 characters";
    }

    if (!formData.displayName) {
      newErrors.displayName = "Display name is required";
    } else if (formData.displayName.length > 50) {
      newErrors.displayName = "Display name must be less than 50 characters";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = "You must be at least 13 years old";
      }
    }

    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = "Bio must be less than 160 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const inputClassName = (hasError: boolean) =>
    `mt-1 block w-full rounded-md border-2 ${
      hasError ? "border-destructive" : "border-input"
    } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring`;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-background p-4 sm:p-6 text-left align-middle shadow-xl transition-all border border-border">
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-base sm:text-lg font-medium leading-6 text-foreground"
                  >
                    {isEditing ? "Update Profile" : "Create Your Profile"}
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
                      htmlFor="username"
                      className="block text-sm font-medium text-foreground"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="newUsername"
                      value={formData.newUsername}
                      onChange={handleChange}
                      className={inputClassName(!!errors.newUsername)}
                      placeholder="Choose a username"
                      required
                      disabled={isSubmitting}
                    />
                    {errors.newUsername && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.newUsername}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-foreground"
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className={inputClassName(!!errors.displayName)}
                      placeholder="Your display name"
                      required
                      disabled={isSubmitting}
                    />
                    {errors.displayName && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.displayName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-foreground"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className={inputClassName(!!errors.bio)}
                      placeholder="Tell us about yourself"
                      rows={3}
                      disabled={isSubmitting}
                    />
                    {errors.bio && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.bio}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground text-right">
                      {formData.bio.length}/160
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="block text-sm font-medium text-foreground"
                    >
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={inputClassName(!!errors.dateOfBirth)}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="h-8 sm:h-9 text-sm"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="h-8 sm:h-9 text-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? "Saving..." : "Creating..."}
                        </>
                      ) : isEditing ? (
                        "Save Changes"
                      ) : (
                        "Create Profile"
                      )}
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
