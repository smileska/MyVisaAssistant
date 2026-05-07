import Select from 'react-select'
import { COUNTRIES } from '../data/countries'

export default function CountrySelect({ value, onChange, placeholder = 'Select country...', id }) {
  const selected = COUNTRIES.find((c) => c.value === value) || null

  return (
    <Select
      inputId={id}
      options={COUNTRIES}
      value={selected}
      onChange={(opt) => onChange(opt ? opt.value : '')}
      placeholder={placeholder}
      isClearable
      isSearchable
      classNamePrefix="react-select"
      styles={{
        control: (base) => ({ ...base, minHeight: '44px' }),
      }}
    />
  )
}
