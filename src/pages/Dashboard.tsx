import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { useAppointments } from '@/hooks/useAppointments';
import { useMedications } from '@/hooks/useMedications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Pill, Clock, Bell, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export const Dashboard = () => {
  const { appointments, isLoading: loadingAppointments } = useAppointments();
  const { medications, medicationLogs, isLoading: loadingMedications, logMedicationTaken } = useMedications();

  const upcomingAppointments = appointments
    .filter((apt) => new Date(`${apt.appointment_date}T${apt.appointment_time}`) >= new Date())
    .slice(0, 3);

  const activeMedications = medications.filter((med) => med.is_active);

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const isMedicationTakenToday = (medicationId: string, time: string) => {
    return medicationLogs.some(
      (log) => log.medication_id === medicationId && log.scheduled_time === time
    );
  };

  if (loadingAppointments || loadingMedications) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your health overview at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{upcomingAppointments.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-accent/50 border-accent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Pill className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeMedications.length}</p>
                <p className="text-xs text-muted-foreground">Medications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-secondary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {activeMedications.reduce((acc, med) => acc + med.time_of_day.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Daily Doses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted border-muted">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{medicationLogs.length}</p>
                <p className="text-xs text-muted-foreground">Taken Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your next scheduled visits</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/appointments">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming appointments</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/appointments">Schedule one now</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary">
                      <span className="text-xs font-medium">
                        {format(parseISO(apt.appointment_date), 'MMM')}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {format(parseISO(apt.appointment_date), 'd')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{apt.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{apt.appointment_time}</span>
                        {apt.doctor_name && (
                          <>
                            <span>•</span>
                            <span className="truncate">{apt.doctor_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {getDateLabel(apt.appointment_date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Medications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Today's Medications
              </CardTitle>
              <CardDescription>Track your daily doses</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/medications">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeMedications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active medications</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/medications">Add one now</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeMedications.map((med) =>
                  med.time_of_day.map((time) => {
                    const taken = isMedicationTakenToday(med.id, time);
                    return (
                      <div
                        key={`${med.id}-${time}`}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                          taken ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            taken ? 'bg-primary text-primary-foreground' : 'bg-accent'
                          }`}
                        >
                          {taken ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Pill className="w-5 h-5 text-accent-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${taken ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {med.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{time}</p>
                          {!taken && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary hover:text-primary"
                              onClick={() =>
                                logMedicationTaken.mutate({ medicationId: med.id, scheduledTime: time })
                              }
                            >
                              Mark taken
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
