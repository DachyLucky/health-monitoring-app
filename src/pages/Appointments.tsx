import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppointments } from '@/hooks/useAppointments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, Clock, MapPin, User, Trash2, Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export const Appointments = () => {
  const { appointments, isLoading, createAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    appointment_date: '',
    appointment_time: '',
    doctor_name: '',
    location: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      appointment_date: '',
      appointment_time: '',
      doctor_name: '',
      location: '',
      notes: '',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAppointment.mutateAsync({ id: editingId, ...formData });
        toast({ title: 'Appointment updated successfully' });
      } else {
        await createAppointment.mutateAsync(formData);
        toast({ title: 'Appointment created successfully' });
      }
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (apt: typeof appointments[0]) => {
    setFormData({
      title: apt.title,
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time,
      doctor_name: apt.doctor_name || '',
      location: apt.location || '',
      notes: apt.notes || '',
    });
    setEditingId(apt.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAppointment.mutateAsync(id);
      toast({ title: 'Appointment deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(`${apt.appointment_date}T${apt.appointment_time}`) >= new Date()
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(`${apt.appointment_date}T${apt.appointment_time}`) < new Date()
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your healthcare visits</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update your appointment details' : 'Schedule a new healthcare appointment'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Annual checkup"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor/Provider</Label>
                <Input
                  id="doctor"
                  placeholder="Dr. Smith"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City Medical Center"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Remember to bring insurance card..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={createAppointment.isPending || updateAppointment.isPending}
              >
                {(createAppointment.isPending || updateAppointment.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingId ? 'Update Appointment' : 'Create Appointment'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Appointments
          </CardTitle>
          <CardDescription>{upcomingAppointments.length} scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                    <span className="text-xs font-medium">
                      {format(parseISO(apt.appointment_date), 'MMM')}
                    </span>
                    <span className="text-xl font-bold leading-none">
                      {format(parseISO(apt.appointment_date), 'd')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{apt.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {apt.appointment_time}
                      </span>
                      {apt.doctor_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {apt.doctor_name}
                        </span>
                      )}
                      {apt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {apt.location}
                        </span>
                      )}
                    </div>
                    {apt.notes && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{apt.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(apt)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(apt.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Past Appointments</CardTitle>
            <CardDescription>{pastAppointments.length} completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastAppointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 opacity-70"
                >
                  <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground">
                    <span className="text-xs">{format(parseISO(apt.appointment_date), 'MMM')}</span>
                    <span className="text-lg font-bold leading-none">
                      {format(parseISO(apt.appointment_date), 'd')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-muted-foreground truncate">{apt.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {apt.appointment_time} {apt.doctor_name && `• ${apt.doctor_name}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Appointments;
