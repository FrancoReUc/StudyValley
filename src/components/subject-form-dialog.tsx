"use client";

import type { StudySubject, LevelMarker, StudySubjectFormData } from "@/types";
import React, { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, PlusCircle } from "lucide-react";
import { pastelColors, defaultSubjectColor } from "@/lib/subject-colors";
import { availableIcons, defaultIconName, getIconComponent } from "@/lib/available-icons";
import { useToast } from "@/hooks/use-toast";

const levelMarkerSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required").max(20, "Label too long"),
  hours: z.number().positive("Hours must be positive").max(9999, "Max 9999 hours"),
});

const subjectFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  icon: z.string().min(1, "Icon is required"),
  targetHours: z.number().positive("Target hours must be positive").max(9999, "Max 9999 hours"),
  levelMarkers: z
    .array(levelMarkerSchema)
    .max(5, "Maximum 5 level markers")
    .refine(
      (markers, ctx) => {
        const uniqueLabels = new Set(markers.map((m) => m.label.toLowerCase()));
        if (uniqueLabels.size !== markers.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Level marker labels must be unique.",
            path: ["levelMarkers"], 
          });
          return false;
        }
        const uniqueHours = new Set(markers.map((m) => m.hours));
        if (uniqueHours.size !== markers.length) {
           ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Level marker hours must be unique.",
            path: ["levelMarkers"],
          });
          return false;
        }
        return true;
      },
      { message: "Level marker labels and hours must be unique." }
    ),
});


interface SubjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudySubject) => void;
  initialData?: StudySubject | null;
}

export function SubjectFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SubjectFormDialogProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm<StudySubjectFormData>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          name: "",
          color: defaultSubjectColor,
          icon: defaultIconName,
          targetHours: 100,
          levelMarkers: [{ id: crypto.randomUUID(), label: "Basic", hours: 40 }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "levelMarkers",
  });

  const selectedColor = watch("color", defaultSubjectColor);
  const selectedIconName = watch("icon", defaultIconName);
  const IconComponent = getIconComponent(selectedIconName);

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? { ...initialData }
          : {
              name: "",
              color: defaultSubjectColor,
              icon: defaultIconName,
              targetHours: 100,
              levelMarkers: [{ id: crypto.randomUUID(), label: "Basic", hours: 40 }],
            }
      );
    }
  }, [isOpen, initialData, reset]);

  const processSubmit = (data: StudySubjectFormData) => {
    const finalData: StudySubject = {
      id: initialData?.id || crypto.randomUUID(),
      totalHours: initialData?.totalHours || 0,
      ...data,
      levelMarkers: data.levelMarkers.map(lm => ({...lm, id: lm.id || crypto.randomUUID()})),
    };
    
    // Ensure level marker hours are not greater than target hours
    const invalidMarker = finalData.levelMarkers.find(lm => lm.hours > finalData.targetHours);
    if (invalidMarker) {
      toast({
        title: "Invalid Level Marker",
        description: `Marker "${invalidMarker.label}" (${invalidMarker.hours}h) cannot exceed target hours (${finalData.targetHours}h).`,
        variant: "destructive",
      });
      return;
    }

    onSubmit(finalData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-card text-card-foreground shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {initialData ? "Edit Study Subject" : "Create New Study Subject"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for your study subject. Time to get learning!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 p-1">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Subject Name</Label>
                <Input id="name" {...register("name")} className="mt-1 bg-input" />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color" className="text-sm font-medium">Color</Label>
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="color" className="mt-1 bg-input">
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {pastelColors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center">
                                <span
                                  className="w-4 h-4 rounded-full mr-2 border"
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.color && <p className="text-destructive text-xs mt-1">{errors.color.message}</p>}
                </div>
                <div>
                  <Label htmlFor="icon" className="text-sm font-medium">Icon</Label>
                   <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="icon" className="mt-1 bg-input">
                           <SelectValue>
                            <div className="flex items-center">
                              <IconComponent className="w-4 h-4 mr-2" style={{ color: selectedColor }} />
                              {field.value}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map((icon) => {
                            const CurrentIconComponent = icon.component;
                            return (
                            <SelectItem key={icon.name} value={icon.name}>
                              <div className="flex items-center">
                                <CurrentIconComponent className="w-4 h-4 mr-2" />
                                {icon.name}
                              </div>
                            </SelectItem>
                          );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.icon && <p className="text-destructive text-xs mt-1">{errors.icon.message}</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="targetHours" className="text-sm font-medium">Target Hours</Label>
                <Input
                  id="targetHours"
                  type="number"
                  {...register("targetHours", { valueAsNumber: true })}
                  className="mt-1 bg-input"
                />
                {errors.targetHours && (
                  <p className="text-destructive text-xs mt-1">{errors.targetHours.message}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Level Markers</Label>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mt-2 p-3 border rounded-md bg-background">
                    <Input
                      placeholder="Label (e.g., Basic)"
                      {...register(`levelMarkers.${index}.label`)}
                      className="flex-grow bg-input"
                    />
                    <Input
                      type="number"
                      placeholder="Hours"
                      {...register(`levelMarkers.${index}.hours`, { valueAsNumber: true })}
                      className="w-24 bg-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove marker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                 {errors.levelMarkers && !errors.levelMarkers.message && errors.levelMarkers.length && errors.levelMarkers.map((err, i) => (
                  <div key={i} className="mt-1">
                    {err?.label && <p className="text-destructive text-xs">{`Marker ${i+1} Label: ${err.label.message}`}</p>}
                    {err?.hours && <p className="text-destructive text-xs">{`Marker ${i+1} Hours: ${err.hours.message}`}</p>}
                  </div>
                ))}
                {errors.levelMarkers?.message && (
                   <p className="text-destructive text-xs mt-1">{errors.levelMarkers.message}</p>
                )}

                {fields.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ id: crypto.randomUUID(), label: "", hours: 0 })}
                    className="mt-2 border-dashed hover:bg-secondary"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Marker
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: selectedColor, color: pastelColors.find(pc => pc.value === selectedColor) ? 'hsl(var(--primary-foreground))' : undefined }}>
              {initialData ? "Save Changes" : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
