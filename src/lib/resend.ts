/**
 * This file is now a wrapper around the Nodemailer service in @/lib/email.
 * It is maintained for backward compatibility.
 */

import { sendWelcomeEmail, sendAdminNewUserEmail as sendAdminNotif } from './email';

export const sendClientWelcomeEmail = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  return await sendWelcomeEmail(email, name);
};

export const sendAdminNewUserEmail = async ({
  email,
  name,
  phone,
}: {
  email: string;
  name: string;
  phone: string;
}) => {
  return await sendAdminNotif({ email, name, phone });
};
