import clsx from 'clsx';
import Image from 'next/image';
import React from 'react';

type Props = {
  count: number;
  label: string;
  type: 'appointments' | 'pending' | 'cancelled';
  icon: string;
};
const StatCard = ({ count = 0, label, icon, type }: Props) => {
  return (
    <div
      className={clsx('stat-card', {
        'bg-appointments': type === 'appointments',
        'bg-pending': type === 'pending',
        'bg-cancelled': type === 'cancelled',
      })}
    >
      <div className="flex items-center gap-4">
        <Image src={icon} height={32} width={32} className="size-8 w-fit" alt="logo" />
        <h2 className="text-32-bold text-white">{count}</h2>
      </div>
      <p className="text-14-regular">{label}</p>
    </div>
  );
};

export default StatCard;
