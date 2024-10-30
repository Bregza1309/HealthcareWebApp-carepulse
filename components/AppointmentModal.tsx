import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import clsx from 'clsx';
import AppointmentForm from './forms/AppointmentForm';
import { Appointment } from '@/types/appwrite.types';

type Props = {
  type: 'schedule' | 'cancel';
  patientId: string;
  userId: string;
  appointment?: Appointment;
  title?: string;
  description?: string;
};
const AppointmentModal = ({ type, patientId, appointment, userId }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={clsx('capitalize', {
            'text-green-500': type === 'schedule',
          })}
        >
          {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog  sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize">{type} Appointment</DialogTitle>
          <DialogDescription>
            PLease fill in the following details to {type} an appointment
          </DialogDescription>
        </DialogHeader>
        <AppointmentForm
          userId={userId}
          patientId={patientId}
          type={type}
          appointment={appointment}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
