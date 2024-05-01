'use client';
import { EMPTY_GUID } from '@/app/_apis/character';
import { createContext } from 'react';

export const SessionContext = createContext<string>(EMPTY_GUID);
