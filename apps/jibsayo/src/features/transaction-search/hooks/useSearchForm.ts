import { Dispatch, SetStateAction, useState } from 'react';

import { SearchForm } from '../models/types';

interface Return {
  form: SearchForm;
  setForm: Dispatch<SetStateAction<SearchForm>>;
}

export const useSearchForm = (): Return => {
  const [form, setForm] = useState<SearchForm>({
    cityName: '',
    regionCode: '',
    date: new Date(),
  });

  return { form, setForm };
};
