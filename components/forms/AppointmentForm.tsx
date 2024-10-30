'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '../ui/form';
import { z } from 'zod';
import CustomFormField from '../CustomFormField';
import SubmitButton from '../SubmitButton';
import { getAppointmentSchema } from '@/lib/validation';
import { useRouter } from 'next/navigation';
import { Doctors } from '@/constants';
import { SelectItem } from '../ui/select';
import Image from 'next/image';
import { createAppointment, updateAppointment } from '@/lib/actions/appointment.actions';
import { Appointment } from '@/types/appwrite.types';

export enum FormFieldType {
  INPUT = 'input',
  CHECKBOX = 'checkbox',
  PHONE_INPUT = 'phoneInput',
  TEXTAREA = 'textarea',
  DATE_PICKER = 'datePicker',
  SELECT = 'select',
  SKELETON = 'skeleton',
}
type Props = {
  userId: string;
  patientId: string;
  type: 'create' | 'cancel' | 'schedule';
  appointment?: Appointment;
  setOpen?: (open: boolean) => void;
};
const AppointmentForm = ({ userId, patientId, type, appointment, setOpen }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // 1. Define your form.
  const typeInfered = getAppointmentSchema(type);
  const form = useForm<z.infer<typeof typeInfered>>({
    resolver: zodResolver(typeInfered),
    defaultValues: {
      primaryPhysician: appointment ? appointment.primaryPhysician : '',
      schedule: appointment ? new Date(appointment.schedule) : new Date(Date.now()),
      reason: appointment ? appointment.reason : '',
      note:appointment?.note || '',
      cancellationReason: appointment?.cancellationReason || '',
    },
    mode: 'onBlur',
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof typeInfered>) {
    setIsLoading(true);
    let status;
    switch (type) {
      case 'schedule':
        status = 'scheduled';
        break;
      case 'cancel':
        status = 'cancelled';
        break;

      default:
        status = 'pending';
        break;
    }
    try {
      //console.log(type);
      if (type === 'create' && patientId) {
        const appointmentData = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason: values.reason,
          note: values.note,
          status: status as Status,
        };

        const appointment = await createAppointment(appointmentData);

        if (appointment) {
          form.reset();
          router.push(
            `/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`,
          );
        }
      } else {
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id as string,
          appointment: {
            primaryPhysician: values.primaryPhysician,
            schedule: new Date(values.schedule),
            status: status as Status,
            cancellationReason: values.cancellationReason,
          },
          type,
        };
        const updatedAppointment = await updateAppointment(appointmentToUpdate);
        if (updatedAppointment) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }
  let buttonLabel;
  switch (type) {
    case 'cancel':
      buttonLabel = 'Cancel Appointment';
      break;
    case 'create':
      buttonLabel = 'Create Appointment';
      break;
    case 'schedule':
      buttonLabel = 'Schedule Appointment';
      break;
    default:
      break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {type === 'create' && (
          <section className="mb-12 space-y-4">
            <h1 className="header">New Appointment </h1>
            <p className="text-dark-700">Request a new appointment in 10 seconds</p>
          </section>
        )}
        {type != 'cancel' && (
          <>
            <CustomFormField
              formField={FormFieldType.SELECT}
              control={form.control}
              name="primaryPhysician"
              label="Doctor"
              placeholder="Select a Doctor"
            >
              {Doctors.map((doctor) => (
                <SelectItem key={doctor.name} value={doctor.name}>
                  <div className="flex cursor-pointer items-center gap-2">
                    <Image
                      src={doctor.image}
                      width={32}
                      height={32}
                      className="rounded-full border border-dark-500"
                      alt={doctor.name}
                    />
                    <p>{doctor.name}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>
            <CustomFormField
              formField={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected appointment date"
              showTimeSelect
              dateFormat="MM/dd/yyyy - h:mm aa"
            />
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                formField={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Reason for appointment"
                placeholder="Enter reason for appointment"
              />
              <CustomFormField
                formField={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Notes"
                placeholder="Enter notes"
              />
            </div>
          </>
        )}
        {type === 'cancel' && (
          <CustomFormField
            formField={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Reason for cancellation"
            placeholder="Enter reason for cancellation"
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${type === 'cancel' ? 'shad-danger-btn' : 'shad-primary-btn'} w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};
export default AppointmentForm;
