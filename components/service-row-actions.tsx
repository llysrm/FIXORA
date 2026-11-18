"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleServiceAction, deleteServiceAction } from "@/lib/actions/services";
import { ServiceForm } from "./service-form";
import { Button } from "./ui";

type Category = { id: string; name: string };

export function ServiceRowActions({
  service,
  categories,
}: {
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    priceUnit: string;
    categoryId: string;
    isActive: boolean;
  };
  categories: Category[];
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
          {editing ? "Close" : "Edit"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const fd = new FormData();
              fd.set("serviceId", service.id);
              await toggleServiceAction(fd);
              router.refresh();
            })
          }
        >
          {service.isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-danger"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this service permanently?")) return;
            startTransition(async () => {
              const fd = new FormData();
              fd.set("serviceId", service.id);
              await deleteServiceAction(fd);
              router.refresh();
            });
          }}
        >
          Delete
        </Button>
      </div>
      {editing && (
        <div className="w-full rounded-lg border border-line bg-background p-4 sm:col-span-2">
          <ServiceForm categories={categories} service={service} />
        </div>
      )}
    </>
  );
}
