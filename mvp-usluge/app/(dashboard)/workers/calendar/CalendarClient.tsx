'use client';

import { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface WorkerBooking {
  id: string;
  workerName: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  clientName: string;
}

export default function CalendarClient() {
  const [bookings, setBookings] = useState<WorkerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workers/bookings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setBookings(data.data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getBookingsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.scheduledDate.startsWith(dateStr));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' });
  const dayNames = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            ← Prethodni
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Danas
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            Sledeći →
          </Button>
        </div>
        <h2 className="text-xl font-bold text-gray-900 capitalize">{monthName}</h2>
        <div className="flex gap-2">
          <Button
            variant={view === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            Mesec
          </Button>
          <Button
            variant={view === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            Lista
          </Button>
        </div>
      </div>

      {/* Calendar */}
      {view === 'month' ? (
        <Card variant="elevated">
          <CardContent className="p-0">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-blue-50 border-b">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center font-semibold text-gray-700 text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-0 border">
              {days.map((day, idx) => {
                const dayBookings = day ? getBookingsForDate(day) : [];
                const isToday =
                  day &&
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={idx}
                    className={`min-h-28 p-2 border-r border-b ${
                      !day ? 'bg-gray-50' : isToday ? 'bg-blue-50' : 'bg-white'
                    } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                  >
                    {day && (
                      <>
                        <div
                          className={`text-sm font-semibold mb-1 ${
                            isToday ? 'text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayBookings.slice(0, 2).map((booking) => (
                            <div
                              key={booking.id}
                              className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getStatusColor(
                                booking.status
                              )}`}
                              title={`${booking.workerName} - ${booking.serviceName}`}
                            >
                              {booking.workerName.split(' ')[0]}
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className="text-xs text-gray-500 px-1">
                              +{dayBookings.length - 2} više
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List view */
        <Card variant="elevated">
          <CardContent className="p-0">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nema zakazanih termina</p>
              </div>
            ) : (
              <div className="divide-y">
                {bookings
                  .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                  .map((booking) => {
                    const bookingDate = new Date(booking.scheduledDate);
                    const dateStr = bookingDate.toLocaleDateString('sr-RS', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });

                    return (
                      <div key={booking.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {booking.workerName}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              📅 {dateStr} • ⏰ {booking.scheduledTime}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              📋 {booking.serviceName}
                            </div>
                            <div className="text-sm text-gray-600">
                              👤 Klijent: {booking.clientName}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-4 ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
