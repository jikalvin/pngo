import { ConfirmationResult } from 'firebase/auth';

export let confirmationResultHolder: ConfirmationResult | null = null;

export const setConfirmationResult = (res: ConfirmationResult | null) => {
  confirmationResultHolder = res;
};
