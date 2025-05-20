import type { LucideProps } from 'lucide-react';
import {
  BookOpen, Code2, Palette, Music2, Brain, FlaskConical, Target, Feather, Star, Zap, Leaf, Sun, Moon, Coffee
} from 'lucide-react';

export const availableIcons: { name: string; component: React.FC<LucideProps> }[] = [
  { name: 'BookOpen', component: BookOpen },
  { name: 'Code2', component: Code2 },
  { name: 'Palette', component: Palette },
  { name: 'Music2', component: Music2 },
  { name: 'Brain', component: Brain },
  { name: 'FlaskConical', component: FlaskConical },
  { name: 'Target', component: Target },
  { name: 'Feather', component: Feather },
  { name: 'Star', component: Star },
  { name: 'Zap', component: Zap },
  { name: 'Leaf', component: Leaf },
  { name: 'Sun', component: Sun },
  { name: 'Moon', component: Moon },
  { name: 'Coffee', component: Coffee },
];

export const defaultIconName = availableIcons[0].name;

export function getIconComponent(name: string): React.FC<LucideProps> {
  const icon = availableIcons.find(icon => icon.name === name);
  return icon ? icon.component : BookOpen; // Default to BookOpen if not found
}
