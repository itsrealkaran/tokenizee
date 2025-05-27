"use client";

import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputClassName =
    "mt-1 block w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring";

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
                    {isEditing ? "Edit Profile" : "Create Your Profile"}
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
                      className={inputClassName + " mt-1.5 sm:mt-2 text-sm"}
                      placeholder="Choose a username"
                      required
                    />
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
                      className={inputClassName + " mt-1.5 sm:mt-2 text-sm"}
                      placeholder="Your display name"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-foreground"
                    >
                      Bio
                    </label>
                    <input
                      type="text"
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className={inputClassName + " mt-1.5 sm:mt-2 text-sm"}
                      placeholder="Your bio"
                      required
                    />
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
                      className={inputClassName + " mt-1.5 sm:mt-2 text-sm"}
                      required
                    />
                  </div>

                  <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="h-8 sm:h-9 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="h-8 sm:h-9 text-sm">
                      {isEditing ? "Save Changes" : "Create Profile"}
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
