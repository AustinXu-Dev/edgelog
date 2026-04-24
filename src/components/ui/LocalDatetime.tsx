'use client';

interface Props {
  iso: string;
}

export function LocalDatetime({ iso }: Props) {
  return (
    <>
      {new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </>
  );
}
