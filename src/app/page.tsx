"use client";

import React, { useState, useEffect } from "react";
import type { StudySubject } from "@/types";
import { Button } from "@/components/ui/button";
import { SubjectTube } from "@/components/subject-tube";
import { SubjectFormDialog } from "@/components/subject-form-dialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, BarChart3, Sun, Moon } from "lucide-react";
import { defaultSubjectColor } from "@/lib/subject-colors";
import { defaultIconName } from "@/lib/available-icons";

const initialSubjectsData: StudySubject[] = [
  {
    id: crypto.randomUUID(),
    name: "Programming",
    color: "#ADD8E6", // Sky Blue
    icon: "Code2",
    totalHours: 25,
    targetHours: 200,
    levelMarkers: [
      { id: crypto.randomUUID(), label: "Basics", hours: 50 },
      { id: crypto.randomUUID(), label: "Advanced", hours: 120 },
      { id: crypto.randomUUID(), label: "Expert", hours: 200 },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: "Illustration",
    color: "#E6E6FA", // Lavender
    icon: "Palette",
    totalHours: 70,
    targetHours: 150,
    levelMarkers: [
      { id: crypto.randomUUID(), label: "Beginner", hours: 40 },
      { id: crypto.randomUUID(), label: "Intermediate", hours: 90 },
      { id: crypto.randomUUID(), label: "Pro", hours: 150 },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: "Guitar",
    color: "#FFDAB9", // Peach
    icon: "Music2",
    totalHours: 5,
    targetHours: 100,
    levelMarkers: [
      { id: crypto.randomUUID(), label: "Chords", hours: 20 },
      { id: crypto.randomUUID(), label: "Songs", hours: 60 },
      { id: crypto.randomUUID(), label: "Mastery", hours: 100 },
    ],
  },
];


export default function Home() {
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<StudySubject | null>(null);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage
    const storedSubjects = localStorage.getItem("studyValleySubjects");
    if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects));
    } else {
      setSubjects(initialSubjectsData);
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(document.documentElement.classList.contains('dark') || (!('theme' in localStorage) && prefersDark));
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("studyValleySubjects", JSON.stringify(subjects));
    }
  }, [subjects, mounted]);
  
  useEffect(() => {
    if (mounted) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDarkMode, mounted]);


  const handleFormSubmit = (data: StudySubject) => {
    setSubjects((prevSubjects) => {
      const existingIndex = prevSubjects.findIndex((s) => s.id === data.id);
      if (existingIndex > -1) {
        const updatedSubjects = [...prevSubjects];
        updatedSubjects[existingIndex] = data;
        return updatedSubjects;
      }
      return [...prevSubjects, data];
    });
    toast({
      title: `Subject ${data.id === editingSubject?.id ? "Updated" : "Created"}!`,
      description: `"${data.name}" is ready for tracking.`,
    });
    setIsFormOpen(false);
    setEditingSubject(null);
  };

  const handleAddTime = (subjectId: string, hours: number) => {
    setSubjects((prevSubjects) =>
      prevSubjects.map((s) =>
        s.id === subjectId
          ? { ...s, totalHours: Math.min(s.targetHours, s.totalHours + hours) }
          : s
      )
    );
    toast({
      title: "Time Added!",
      description: `${hours}h added to ${subjects.find(s => s.id === subjectId)?.name}.`,
    });
  };

  const handleEditSubject = (subject: StudySubject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleAddNewSubject = () => {
    setEditingSubject(null); // Ensure it's a new subject form
    setIsFormOpen(true);
  };
  
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground text-xl">Loading Study Valley...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
        <header className="mb-8">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                Study Valley
              </h1>
            </div>
            <div className="flex items-center gap-4">
               <Button onClick={handleAddNewSubject} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all">
                <PlusCircle className="w-5 h-5 mr-2" />
                Add New Subject
              </Button>
              <Button variant="outline" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode" className="rounded-full border-2">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          <p className="container mx-auto mt-2 text-muted-foreground text-sm">
            Track your learning journey, one hour at a time. Inspired by cozy farm life.
          </p>
        </header>

        <main className="flex-grow container mx-auto">
          {subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[50vh] bg-card p-8 rounded-xl shadow-inner">
              <img src="https://placehold.co/200x150.png" alt="Empty state illustration" data-ai-hint="cozy desk plant" className="mb-6 rounded-lg opacity-70" />
              <h2 className="text-2xl font-semibold mb-2">No Subjects Yet!</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Looks like your learning valley is still waiting for its first seed! Click "Add New Subject" to start cultivating your knowledge.
              </p>
              <Button onClick={handleAddNewSubject} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all">
                <PlusCircle className="w-5 h-5 mr-2" />
                Create Your First Subject
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subjects.map((subject) => (
                <SubjectTube
                  key={subject.id}
                  subject={subject}
                  onAddTime={handleAddTime}
                  onEditSubject={handleEditSubject}
                />
              ))}
            </div>
          )}
        </main>

        <footer className="text-center py-8 mt-12 text-muted-foreground text-xs border-t">
          <p>&copy; {new Date().getFullYear()} Study Valley. Happy learning!</p>
        </footer>
      </div>
      <SubjectFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSubject(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingSubject}
      />
      <Toaster />
    </>
  );
}
