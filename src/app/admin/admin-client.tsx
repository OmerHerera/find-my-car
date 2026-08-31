'use client';

import './admin.css';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { CarIllustration } from '@/components/car-illustration';
import {
  addData,
  apiMode,
  loadData,
  removeData,
  updateData,
} from '@/lib/data-repository';
import { copy, type Locale } from '@/lib/translations';
import type { Car, CarStyle } from '@/lib/types';

type CarFormState = {
  name: string;
  color: string;
  carStyle: CarStyle;
  plate: string;
};

const defaultForm = (): CarFormState => ({
  name: '',
  color: '#109ef4',
  carStyle: 'sedan',
  plate: '',
});

const carColors = [
  '#109ef4',
  '#e8eef5',
  '#111111',
  '#51cba2',
  '#ff5c6a',
  '#fabc40',
];

const carStyles: CarStyle[] = ['sedan', 'suv', 'hatchback'];

export default function AdminClient({
  initialLocale,
}: {
  initialLocale: Locale;
}) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CarFormState>(defaultForm());
  const text = copy[initialLocale];

  const loadCars = async () => {
    const result = await loadData();
    setCars(result.cars);
  };

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await loadCars();
      } catch {
        setError(text.adminLoadError);
      } finally {
        setLoading(false);
      }
    })();
  }, [text.adminLoadError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        color: form.color,
        carStyle: form.carStyle,
        plate: form.plate.trim() || undefined,
      };

      const nextCars = editingId
        ? await updateData(cars, editingId, payload)
        : await addData(cars, payload);
      setCars(nextCars);
      setForm(defaultForm());
      setEditingId(null);
      setEditorOpen(false);
    } catch {
      setError(text.adminSaveError);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (car: Car) => {
    setEditingId(car.id);
    setEditorOpen(true);
    setForm({
      name: car.name,
      color: car.color,
      carStyle: car.carStyle,
      plate: car.plate ?? '',
    });
    setError(null);
  };

  const handleDelete = async (carId: string) => {
    const confirmed = window.confirm(text.deleteCarConfirm);
    if (!confirmed) return;

    setError(null);

    try {
      setCars(await removeData(cars, carId));
      if (editingId === carId) {
        setEditingId(null);
        setForm(defaultForm());
        setEditorOpen(false);
      }
    } catch {
      setError(text.adminDeleteError);
    }
  };

  return (
    <main className='admin-shell'>
      <header className='admin-header'>
        <div>
          <p className='brand'>{text.admin}</p>
          <h1>{text.manageCars}</h1>
        </div>
        <button
          type='button'
          className='secondary-button'
          onClick={() => {
            setEditingId(null);
            setForm(defaultForm());
            setError(null);
            setEditorOpen(true);
          }}
        >
          {text.newCar}
        </button>
      </header>

      <div className='dev-notice'>
        <span className='pulse' />
        {apiMode ? text.apiNotice : text.mockNotice}
      </div>

      {error && <div className='admin-alert'>{error}</div>}

      <section className={`admin-layout${editorOpen ? '' : ' cars-only'}`}>
        {editorOpen && (
          <form className='admin-panel edit-car-panel' onSubmit={handleSubmit}>
            <div className='edit-car-heading'>
              <h2>{editingId ? text.editCar : text.addCar}</h2>
              <button
                type='button'
                className='edit-close-button'
                aria-label={text.closeCarEditor}
                title={text.closeCarEditor}
                onClick={() => {
                  setEditingId(null);
                  setForm(defaultForm());
                  setError(null);
                  setEditorOpen(false);
                }}
              >
                <X aria-hidden='true' />
              </button>
            </div>

            <div className='edit-car-body'>
              <label className='edit-text-field'>
                <span className='visually-hidden'>{text.carName}</span>
                <input
                  className='text-input'
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder={text.carName}
                  required
                />
              </label>

              <label className='edit-text-field'>
                <span className='visually-hidden'>{text.licensePlate}</span>
                <input
                  className='text-input'
                  value={form.plate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      plate: event.target.value,
                    }))
                  }
                  placeholder={editingId ? text.licensePlate : text.plate}
                />
              </label>

              <fieldset className='edit-choice-group'>
                <legend>{text.color}</legend>
                <div className='color-swatches'>
                  {carColors.map((color) => (
                    <button
                      key={color}
                      type='button'
                      className={`color-swatch${form.color.toLowerCase() === color ? ' selected' : ''}`}
                      style={{ backgroundColor: color }}
                      aria-label={`${text.chooseCarColor}: ${color}`}
                      aria-pressed={form.color.toLowerCase() === color}
                      onClick={() =>
                        setForm((current) => ({ ...current, color }))
                      }
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset className='edit-choice-group'>
                <legend>{text.bodyStyle}</legend>
                <div className='style-options'>
                  {carStyles.map((style) => (
                    <button
                      key={style}
                      type='button'
                      className={`style-option${form.carStyle === style ? ' selected' : ''}`}
                      aria-pressed={form.carStyle === style}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          carStyle: style,
                        }))
                      }
                    >
                      <CarIllustration
                        color={form.color}
                        carStyle={style}
                        ariaLabel={`${text[style]} ${text.carIllustration}`}
                      />
                      <span>{text[style]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className='edit-car-preview' aria-live='polite'>
                <CarIllustration
                  color={form.color}
                  carStyle={form.carStyle}
                  ariaLabel={`${text[form.carStyle]} ${text.carIllustration}`}
                />
              </div>

              <button
                type='submit'
                className='primary-button edit-save-button'
                disabled={saving || !form.name.trim()}
              >
                {saving ? text.saving : editingId ? text.updateCar : text.save}
              </button>
            </div>
          </form>
        )}

        <div className='admin-panel table-panel'>
          <div className='panel-heading'>
            <h2>{text.cars}</h2>
          </div>

          {loading ? (
            <p className='admin-empty'>{text.loadingCars}</p>
          ) : cars.length === 0 ? (
            <p className='admin-empty'>{text.noCars}</p>
          ) : (
            <div className='admin-table-wrap'>
              <table className='admin-table'>
                <thead>
                  <tr>
                    <th>{text.carName}</th>
                    <th>{text.bodyStyle}</th>
                    <th>{text.licensePlate}</th>
                    <th>{text.actionsLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td data-label={text.carName}>
                        <div className='name-cell'>
                          <span
                            className='color-dot'
                            style={{ backgroundColor: car.color }}
                          />
                          {car.name}
                        </div>
                      </td>
                      <td data-label={text.bodyStyle}>{text[car.carStyle]}</td>
                      <td data-label={text.licensePlate}>{car.plate ?? '—'}</td>
                      <td data-label={text.actionsLabel}>
                        <div className='action-buttons'>
                          <button
                            type='button'
                            className='table-button small-button'
                            onClick={() => handleEdit(car)}
                          >
                            {text.editCar}
                          </button>
                          <button
                            type='button'
                            className='danger-button small-button'
                            onClick={() => void handleDelete(car.id)}
                          >
                            {text.removeCar}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
