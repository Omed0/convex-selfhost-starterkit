import * as React from 'react';

/**
 * A custom hook that returns a boolean value indicating whether the component
 * is mounted or not.
 */
export const useMounted = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
