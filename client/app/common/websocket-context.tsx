'use client';
import { WebsocketEvent } from '@/app/_apis/eventType';
import { createContext } from 'react';

export const WebsocketContext = createContext<WebsocketEvent | null>(null);
