import { useState } from 'react';

export function useModalState() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [isMemoryPinModalOpen, setIsMemoryPinModalOpen] = useState(false);
  const [memoryPinCoords, setMemoryPinCoords] = useState<{ lat?: number; lng?: number }>({});
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openMemoryPinModal = (lat?: number, lng?: number) => {
    setMemoryPinCoords({ lat, lng });
    setIsMemoryPinModalOpen(true);
  };

  return {
    isShareModalOpen,
    setIsShareModalOpen,
    isPingModalOpen,
    setIsPingModalOpen,
    isMemoryPinModalOpen,
    setIsMemoryPinModalOpen,
    memoryPinCoords,
    openMemoryPinModal,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
  };
}
