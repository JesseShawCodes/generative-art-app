import { render, screen, fireEvent } from '@testing-library/react';
import RangeField from '../RangeField';

describe('RangeField', () => {
  it('renders label and range input with the given value', () => {
    const onValueChange = jest.fn();

    render(
      <RangeField
        id="width-input"
        label="Width"
        min={100}
        max={1000}
        value={400}
        onValueChange={onValueChange}
      />
    );

    expect(screen.getByLabelText('Width')).toBeInTheDocument();
    expect(screen.getByLabelText('Width')).toHaveValue('400');
  });

  it('calls onValueChange with the numeric value when the slider moves', () => {
    const onValueChange = jest.fn();

    render(
      <RangeField
        id="elements-input"
        label="Elements"
        min={1}
        max={500}
        value={50}
        onValueChange={onValueChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Elements'), {
      target: { value: '120' },
    });

    expect(onValueChange).toHaveBeenCalledWith(120);
  });
});
