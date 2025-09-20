import { useEffect, useRef } from 'react';

export const useOnceEffect = (flag: boolean, effect: () => void) => {
  const isEffect = useRef(false);

  useEffect(() => {
    if (!isEffect.current && flag) {
      effect();
      isEffect.current = true;
    }
  }, [flag]);
};
