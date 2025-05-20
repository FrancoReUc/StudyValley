export interface LevelMarker {
  id: string;
  label: string;
  hours: number;
}

export interface StudySubject {
  id:string;
  name: string;
  color: string; // hex color string
  icon: string; // lucide-react icon name
  totalHours: number;
  targetHours: number;
  levelMarkers: LevelMarker[];
}

export type StudySubjectFormData = Omit<StudySubject, 'id' | 'totalHours'> & {
  id?: string;
  totalHours?: number;
};
