'use server';
import { ID, Query } from 'node-appwrite';
import { databases, DATABASE_ID, APPOINTMENT_COLLECTION_ID, messaging } from '../appwrite';
import { formatDateTime, parseStringify } from '../utils';
import { Appointment } from '@/types/appwrite.types';
import { revalidatePath } from 'next/cache';

export const createAppointment = async (appointmentData: CreateAppointmentParams) => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointmentData,
    );
    return parseStringify(newAppointment);
  } catch (error) {
    console.log(error);
  }
};
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
    );
    return parseStringify(appointment);
  } catch (error) {
    console.log(error);
  }
};
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [
      Query.orderDesc('$createdAt'),
    ]);
    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };
    const counts = (appointments.documents as Appointment[]).reduce((acc, appointment) => {
      switch (appointment.status) {
        case 'pending':
          acc.pendingCount += 1;
          break;
        case 'scheduled':
          acc.scheduledCount += 1;
          break;
        default:
          acc.cancelledCount += 1;
          break;
      }
      return acc;
    }, initialCounts);
    const data = {
      total: appointments.total,
      ...counts,
      documents: appointments.documents,
    };
    return parseStringify(data);
  } catch (error) {
    console.log(error);
  }
};
export const updateAppointment = async ({
  appointment,
  appointmentId,
  userId,
  type,
}: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment,
    );
    if (!updatedAppointment) {
      throw new Error('Appointment not found');
    }
    //TODO SMS notification
    const smsMessage = `
    Hi , it's CarePulse
    ${
      type === 'schedule'
        ? `Your appointment has been scheduled for ${formatDateTime(appointment.schedule!)}`
        : `We regret to inform you that your appointment has been cancelled for the following 
    reason : ${appointment.cancellationReason}`
    } 
    .`;
    await sendSmsNotification(userId, smsMessage);
    revalidatePath('/admin');
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.log(error);
  }
};
export const sendSmsNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(ID.unique(), content, [], [userId]);
    return parseStringify(message);
  } catch (error) {
    console.log(error);
  }
};
