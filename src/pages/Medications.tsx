import { useState } from 'react';
import { useMedications } from '@/hooks/useMedications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pill, Plus, Trash2, Edit, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export const Medications = () => {
  const { medications, medicationLogs, isLoading, createMedication, updateMedication, deleteMedication, logMedicationTaken } = useMedications();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    time_of_day: ['08:00'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
    is_active: true,
  });
  const [newTime, setNewTime] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'daily',
      time_of_day: ['08:00'],
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: '',
      is_active: true,
    });
    setEditingId(null);
    setNewTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        end_date: formData.end_date || null,
      };
      if (editingId) {
        await updateMedication.mutateAsync({ id: editingId, ...data });
        toast({ title: 'Medication updated successfully' });
      } else {
        await createMedication.mutateAsync(data);
        toast({ title: 'Medication added successfully' });
      }
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (med: typeof medications[0]) => {
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      time_of_day: med.time_of_day,
      start_date: med.start_date,
      end_date: med.end_date || '',
      notes: med.notes || '',
      is_active: med.is_active,
    });
    setEditingId(med.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedication.mutateAsync(id);
      toast({ title: 'Medication deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const addTime = () => {
    if (newTime && !formData.time_of_day.includes(newTime)) {
      setFormData({ ...formData, time_of_day: [...formData.time_of_day, newTime].sort() });
      setNewTime('');
    }
  };

  const removeTime = (time: string) => {
    if (formData.time_of_day.length > 1) {
      setFormData({ ...formData, time_of_day: formData.time_of_day.filter((t) => t !== time) });
    }
  };

  const isMedicationTakenToday = (medicationId: string, time: string) => {
    return medicationLogs.some(
      (log) => log.medication_id === medicationId && log.scheduled_time === time
    );
  };

  const activeMedications = medications.filter((med) => med.is_active);
  const inactiveMedications = medications.filter((med) => !med.is_active);

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
          <h1 className="text-3xl font-bold text-foreground">Medications</h1>
          <p className="text-muted-foreground mt-1">Track your medication schedule</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update medication details' : 'Add a new medication to track'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name *</Label>
                <Input
                  id="name"
                  placeholder="Aspirin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  placeholder="100mg"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Input
                  id="frequency"
                  placeholder="Daily, Twice daily, etc."
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Times of Day</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.time_of_day.map((time) => (
                    <Badge key={time} variant="secondary" className="gap-1">
                      {time}
                      <button
                        type="button"
                        onClick={() => removeTime(time)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addTime}>
                    Add
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Take with food..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMedication.isPending || updateMedication.isPending}
              >
                {(createMedication.isPending || updateMedication.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingId ? 'Update Medication' : 'Add Medication'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            Active Medications
          </CardTitle>
          <CardDescription>{activeMedications.length} medications</CardDescription>
        </CardHeader>
        <CardContent>
          {activeMedications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active medications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMedications.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Pill className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{med.name}</h3>
                        <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {med.time_of_day.map((time) => {
                            const taken = isMedicationTakenToday(med.id, time);
                            return (
                              <button
                                key={time}
                                onClick={() => !taken && logMedicationTaken.mutate({ medicationId: med.id, scheduledTime: time })}
                                disabled={taken}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  taken
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-accent text-accent-foreground hover:bg-primary/10 hover:text-primary'
                                }`}
                              >
                                {taken ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                {time}
                              </button>
                            );
                          })}
                        </div>
                        {med.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">{med.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(med)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(med.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Medications */}
      {inactiveMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Inactive Medications</CardTitle>
            <CardDescription>{inactiveMedications.length} paused/completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveMedications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 opacity-70"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Pill className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-muted-foreground truncate">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(med)}>
                    Reactivate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Medications;
