"use client";

import type { StudySubject } from "@/types";
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Edit3, Plus, Check } from "lucide-react";
import { getIconComponent } from "@/lib/available-icons";
import { cn } from "@/lib/utils";

const TUBE_HEIGHT_PX = 280;

interface SubjectTubeProps {
  subject: StudySubject;
  onAddTime: (subjectId: string, hours: number) => void;
  onEditSubject: (subject: StudySubject) => void;
}

export function SubjectTube({ subject, onAddTime, onEditSubject }: SubjectTubeProps) {
  const [customHours, setCustomHours] = useState("");
  const [showBubbles, setShowBubbles] = useState(false);
  const IconComponent = getIconComponent(subject.icon);

  const liquidHeightPercentage = subject.targetHours > 0
    ? Math.min(100, (subject.totalHours / subject.targetHours) * 100)
    : 0;

  const handleAddTime = (hours: number) => {
    if (hours <= 0) return;
    onAddTime(subject.id, hours);
    setShowBubbles(true);
    setTimeout(() => setShowBubbles(false), 2000); // Duration of bubble animation
  };

  const handleCustomAdd = () => {
    const hours = parseFloat(customHours);
    if (!isNaN(hours) && hours > 0) {
      handleAddTime(hours);
      setCustomHours("");
    }
  };

  const Bubbles = () => {
    if (!showBubbles) return null;
    return Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="bubble"
        style={{
          left: `${Math.random() * 80 + 10}%`, // Random horizontal position
          width: `${Math.random() * 8 + 4}px`,
          height: `${Math.random() * 8 + 4}px`,
          animationDelay: `${Math.random() * 0.5}s`,
          animationDuration: `${Math.random() * 1 + 1.5}s`,
          backgroundColor: subject.color ? `${subject.color}80` : 'hsla(var(--primary-foreground), 0.3)',
        }}
      />
    ));
  };

  return (
    <Card className="w-full max-w-xs flex flex-col shadow-lg rounded-xl overflow-hidden border-2" style={{ borderColor: subject.color }}>
      <CardHeader className="p-4 pb-2 border-b" style={{ backgroundColor: `${subject.color}33`}}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <IconComponent className="w-7 h-7" style={{ color: subject.color }} />
            <CardTitle className="text-xl truncate" title={subject.name}>{subject.name}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onEditSubject(subject)} className="text-muted-foreground hover:text-primary" aria-label="Edit subject">
            <Edit3 className="w-5 h-5" />
          </Button>
        </div>
        <CardDescription className="text-xs pt-1">
          {subject.totalHours.toFixed(1)}h / {subject.targetHours}h
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 flex-grow flex flex-col items-center">
        <div
          className="relative w-20 bg-muted rounded-t-lg mt-2"
          style={{ 
            height: `${TUBE_HEIGHT_PX}px`,
            boxShadow: 'inset 0 0 8px rgba(0,0,0,0.1)',
            border: `3px solid ${subject.color}55`,
            borderBottom: 'none',
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out rounded-t-sm"
            style={{
              height: `${liquidHeightPercentage}%`,
              backgroundColor: subject.color,
              boxShadow: `inset 0 -5px 10px ${subject.color}99, inset 0 5px 10px ${subject.color}33`,
            }}
          >
            <Bubbles />
          </div>
          {subject.levelMarkers.map((marker) => {
            if (subject.targetHours <= 0) return null;
            const markerPositionPercentage = Math.min(100, (marker.hours / subject.targetHours) * 100);
            return (
              <div
                key={marker.id}
                className="absolute left-0 right-0 group"
                style={{ bottom: `${markerPositionPercentage}%` }}
              >
                <div className="h-px bg-foreground opacity-30 group-hover:opacity-70 transition-opacity"></div>
                <span className="absolute -right-2 transform translate-x-full -translate-y-1/2 top-1/2 px-1.5 py-0.5 text-[10px] bg-card text-foreground rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border">
                  {marker.label} ({marker.hours}h)
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t flex-col items-stretch gap-2" style={{ backgroundColor: `${subject.color}1A`}}>
        <div className="flex gap-2">
          <Button onClick={() => handleAddTime(0.5)} variant="outline" className="flex-1 text-xs h-8 hover:border-primary" style={{ color: subject.color, borderColor: `${subject.color}80` }}>+30m</Button>
          <Button onClick={() => handleAddTime(1)} variant="outline" className="flex-1 text-xs h-8 hover:border-primary" style={{ color: subject.color, borderColor: `${subject.color}80` }}>+1h</Button>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full text-xs h-8 hover:border-primary" style={{ color: subject.color, borderColor: `${subject.color}80`}}>
              <Plus className="w-3 h-3 mr-1" /> Custom
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-3 bg-popover rounded-lg shadow-md">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Hours"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                className="flex-1 h-8 text-xs bg-input"
                step="0.1"
              />
              <Button onClick={handleCustomAdd} size="icon" className="h-8 w-8" style={{ backgroundColor: subject.color }}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  );
}
