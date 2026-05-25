import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token || !user) return;
    try {
      const [notifsRes, countRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/notifications?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const notifsData = notifsRes.data?.data || notifsRes.data || [];
      const unreadData = countRes.data?.data || countRes.data || { unreadCount: 0 };
      
      setNotifications(Array.isArray(notifsData) ? notifsData : []);
      setUnreadCount(unreadData.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, [token, user]);

  useEffect(() => {
    setIsLoading(true);
    fetchNotifications().finally(() => setIsLoading(false));

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    if (!token) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
