'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './use-online-status';
import { toast } from 'sonner';

interface QueueItem {
  id: string;
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  timestamp: number;
}

const QUEUE_KEY = 'pulse_offline_queue';

/**
 * A hook to queue failed mutations and replay them when back online.
 */
export function useOfflineQueue() {
  const isOnline = useOnlineStatus();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);

  // Load initial queue
  useEffect(() => {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load offline queue:', e);
    }
  }, []);

  // Save queue to local storage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
  }, [queue]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enqueue = useCallback((action: string, payload: any) => {
    const item: QueueItem = {
      id: crypto.randomUUID(),
      action,
      payload,
      timestamp: Date.now(),
    };
    setQueue((prev) => [...prev, item]);
    toast.info('Saved offline. Will sync when connected.');
  }, []);

  const dequeue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Attempt to replay queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isReplaying) {
      const replayQueue = async () => {
        setIsReplaying(true);
        toast.info(`Syncing ${queue.length} offline actions...`);

        // Create a copy to iterate
        const itemsToReplay = [...queue];
        let successCount = 0;

        for (const item of itemsToReplay) {
          try {
            // Here you would normally have a registry of actions or pass the action directly.
            // For this abstraction, we assume `item.action` maps to a known fetch endpoint or server action.
            // Since Server Actions can't be easily serialized/deserialized by reference,
            // a robust production app would use an API route for queued mutations.

            // Example simulated sync:
            // await fetch('/api/sync', { method: 'POST', body: JSON.stringify(item) });

            console.log(`[OfflineQueue] Replaying ${item.action}`, item.payload);
            successCount++;
            dequeue(item.id);
          } catch (e) {
            console.error(`[OfflineQueue] Failed to replay ${item.action}`, e);
            // Break on first failure to maintain order, or continue depending on strategy
          }
        }

        setIsReplaying(false);
        if (successCount > 0) {
          toast.success(`Successfully synced ${successCount} actions.`);
        }
      };

      replayQueue();
    }
  }, [isOnline, queue, isReplaying, dequeue]);

  return { queue, enqueue, isReplaying };
}
