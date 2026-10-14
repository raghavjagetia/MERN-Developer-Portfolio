import { Award, BookOpen, Brain, Briefcase, FileText, Home, LayoutGrid, User } from 'lucide-react';

export const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/projects', label: 'Work', icon: LayoutGrid },
  { to: '/experience', label: 'Experience', icon: Briefcase },
  { to: '/certifications', label: 'Achievements', icon: Award },
  { to: '/blog', label: 'Blog', icon: BookOpen },
  { to: '/about', label: 'About', icon: User },
  { to: '/insights', label: 'AI Insights', icon: Brain },
  { to: '/contact', label: 'Resume & Contact', icon: FileText },
];
