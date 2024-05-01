'use client'
import { createContext } from 'react';
import { APIReference } from '@/app/_apis/dnd5eTypings';

export const ConditionsContext = createContext<APIReference[]>([]);