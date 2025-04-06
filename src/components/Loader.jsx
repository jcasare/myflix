import { Spinner } from 'flowbite-react';

export function Loader() {
  return (
    <div className="flex justify-center">
      <Spinner aria-label="loading spinner" />
    </div>
  );
}
