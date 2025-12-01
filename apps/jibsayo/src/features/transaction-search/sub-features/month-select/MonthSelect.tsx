import { MonthPicker } from '@package/ui';

import { SearchForm } from '../../types';

interface MonthSelectProps {
  form: SearchForm;
  onFormChange: (value: Partial<SearchForm>) => void;
}

export const MonthSelect = ({ form, onFormChange }: MonthSelectProps) => {
  return (
    <MonthPicker
      value={form.tradeDate}
      onChange={tradeDate => onFormChange({ tradeDate })}
    />
  );
};
