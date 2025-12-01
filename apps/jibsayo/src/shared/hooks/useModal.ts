import { useState } from 'react';

interface Return {
  isOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useModal = (): Return => {
  const [isOpened, setIsOpened] = useState(false);

  const openModal = () => {
    setIsOpened(true);
  };

  const closeModal = () => {
    setIsOpened(false);
  };

  return { isOpened, openModal, closeModal };
};
