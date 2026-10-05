'use client';

import React from 'react';
import { 
  Sparkles, 
  Droplets, 
  Moon, 
  CigaretteOff, 
  Pill, 
  Flame, 
  Award, 
  Utensils, 
  Dumbbell, 
  Footprints, 
  BookOpen, 
  Heart, 
  Apple, 
  Coffee, 
  Snowflake, 
  Bike, 
  Timer, 
  Target, 
  Sun, 
  Brain, 
  Shield, 
  Smile, 
  Bed, 
  Zap 
} from 'lucide-react';

export const RenderHabitIcon: React.FC<{ iconKey: string; className?: string }> = ({ 
  iconKey, 
  className = 'w-5 h-5' 
}) => {
  switch (iconKey) {
    case 'zap': return <Zap className={className} />;
    case 'droplets': return <Droplets className={className} />;
    case 'moon': return <Moon className={className} />;
    case 'pill': return <Pill className={className} />;
    case 'cigarette-off': return <CigaretteOff className={className} />;
    case 'flame': return <Flame className={className} />;
    case 'utensils': return <Utensils className={className} />;
    case 'dumbbell': return <Dumbbell className={className} />;
    case 'footprints': return <Footprints className={className} />;
    case 'book': return <BookOpen className={className} />;
    case 'heart': return <Heart className={className} />;
    case 'apple': return <Apple className={className} />;
    case 'coffee': return <Coffee className={className} />;
    case 'snowflake': return <Snowflake className={className} />;
    case 'bike': return <Bike className={className} />;
    case 'timer': return <Timer className={className} />;
    case 'target': return <Target className={className} />;
    case 'sun': return <Sun className={className} />;
    case 'brain': return <Brain className={className} />;
    case 'shield': return <Shield className={className} />;
    case 'award': return <Award className={className} />;
    case 'smile': return <Smile className={className} />;
    case 'bed': return <Bed className={className} />;
    default: return <Sparkles className={className} />;
  }
};
