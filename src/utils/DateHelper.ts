export interface PreviousMonthYear {
  year: string;
  monthNumber: string;
  monthLabel: string;
}

export function getPreviousMonthYear(): PreviousMonthYear {
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const rawLabel = previous.toLocaleString('pt-BR', { month: 'long' });

  return {
    year: String(previous.getFullYear()),
    monthNumber: String(previous.getMonth() + 1).padStart(2, '0'),
    monthLabel: rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1),
  };
}
