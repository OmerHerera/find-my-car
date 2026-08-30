"use client";

import "./admin.css";
import { useEffect, useState } from "react";
import type { Car, CarStyle } from "@/lib/types";

type CarFormState = {
  name: string;
  color: string;
  carStyle: CarStyle;
  plate: string;
};

const defaultForm = (): CarFormState => ({
  name: "",
  color: "#5bc0eb",
  carStyle: "sedan",
  plate: "",
});

export default function AdminClient() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CarFormState>(defaultForm());

  const loadCars = async () => {
    const response = await fetch("/api/cars", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load cars");
    }
    setCars(await response.json());
  };

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await loadCars();
      } catch {
        setError("Could not load cars from the server.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

      const response = await fetch(
        editingId ? `/api/cars/${editingId}` : "/api/cars",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const payloadText = await response.text();
        throw new Error(payloadText || "Request failed");
      }

      await loadCars();
      setForm(defaultForm());
      setEditingId(null);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save the car.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (car: Car) => {
    setEditingId(car.id);
    setForm({
      name: car.name,
      color: car.color,
      carStyle: car.carStyle,
      plate: car.plate ?? "",
    });
    setError(null);
  };

  const handleDelete = async (carId: string) => {
    const confirmed = window.confirm("Delete this car?");
    if (!confirmed) return;

    setError(null);

    try {
      const response = await fetch(`/api/cars/${carId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Delete request failed");
      }
      await loadCars();
      if (editingId === carId) {
        setEditingId(null);
        setForm(defaultForm());
      }
    } catch {
      setError("Could not delete the car.");
    }
  };

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="brand">Admin</p>
          <h1>Manage cars</h1>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setEditingId(null);
            setForm(defaultForm());
            setError(null);
          }}
        >
          New car
        </button>
      </header>

      {error && <div className="admin-alert">{error}</div>}

      <section className="admin-layout">
        <form className="admin-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <h2>{editingId ? "Edit car" : "Add car"}</h2>
          </div>

          <label className="field-group">
            <span className="field-label">Name</span>
            <input
              className="text-input"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="BMW 3 Series"
              required
            />
          </label>

          <div className="field-row">
            <label className="field-group">
              <span className="field-label">Color</span>
              <input
                type="color"
                className="color-input"
                value={form.color}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    color: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field-group">
              <span className="field-label">Style</span>
              <select
                className="text-input"
                value={form.carStyle}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    carStyle: event.target.value as CarStyle,
                  }))
                }
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
              </select>
            </label>
          </div>

          <label className="field-group">
            <span className="field-label">Plate</span>
            <input
              className="text-input"
              value={form.plate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  plate: event.target.value,
                }))
              }
              placeholder="123-45-678"
            />
          </label>

          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save changes" : "Create car"}
          </button>
        </form>

        <div className="admin-panel table-panel">
          <div className="panel-heading">
            <h2>Cars</h2>
          </div>

          {loading ? (
            <p className="admin-empty">Loading cars...</p>
          ) : cars.length === 0 ? (
            <p className="admin-empty">No cars yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Style</th>
                    <th>Plate</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td>
                        <div className="name-cell">
                          <span
                            className="color-dot"
                            style={{ backgroundColor: car.color }}
                          />
                          {car.name}
                        </div>
                      </td>
                      <td>{car.carStyle}</td>
                      <td>{car.plate ?? "—"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="table-button small-button"
                            onClick={() => handleEdit(car)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger-button small-button"
                            onClick={() => void handleDelete(car.id)}
                          >
                            Delete
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
