"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Clock3,
  Languages,
  LocateFixed,
  MapPin,
  Navigation,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { CarIllustration } from "@/components/car-illustration";
import {
  addData,
  apiMode,
  loadData,
  parkData,
  removeData,
  updateData,
} from "@/lib/data-repository";
import {
  defaultPreferences,
  loadPreferences,
  savePreferences,
} from "@/lib/preferences";
import { copy, type Locale } from "@/lib/translations";
import type { Car, CarStyle, NewCar, ParkingLocation } from "@/lib/types";

type Panel =
  | { kind: "park" | "history" | "edit" | "remove"; car: Car }
  | { kind: "add" | "settings" }
  | null;

export default function HomeClient({
  initialLocale,
}: {
  initialLocale: Locale;
}) {
  const [cars, setCars] = useState<Car[] | null>(null);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [userName, setUserName] = useState(defaultPreferences.userName);
  const [panel, setPanel] = useState<Panel>(null);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const text = copy[locale];

  useEffect(() => {
    queueMicrotask(() => {
      void loadData().then((result) => {
        setCars(result.cars);
        setBackendUnavailable(result.backendUnavailable);
      });
      const preferences = loadPreferences();
      setLocale(preferences.locale);
      setUserName(preferences.userName);
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);

  const greeting = userName ? `${text.greeting}, ${userName}` : text.greeting;
  const currentCars = cars ?? [];

  if (cars === null) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <p className="brand">{text.appName}</p>
            <h1>{greeting}</h1>
            <p className="subtitle">{text.subtitle}</p>
          </div>
          <button
            className="icon-button"
            aria-label={text.settings}
            onClick={() => setPanel({ kind: "settings" })}
          >
            <Settings />
          </button>
        </header>
        <div className="dev-notice">
          <span className="pulse" />
          {apiMode ? text.apiNotice : text.mockNotice}
        </div>
        <div className="loading-copy" aria-live="polite">
          {text.loadingCars}
        </div>
        <section
          className="car-grid loading-grid"
          aria-label={text.subtitle}
          aria-live="polite"
          aria-busy="true"
        >
          {[0, 1].map((item) => (
            <div key={item} className="car-skeleton">
              <div className="car-skeleton-line short" />
              <div className="car-skeleton-line long" />
              <div className="car-skeleton-box" />
              <div className="car-skeleton-line medium" />
            </div>
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="brand">{text.appName}</p>
          <h1>{greeting}</h1>
          <p className="subtitle">{text.subtitle}</p>
        </div>
        <button
          className="icon-button"
          aria-label={text.settings}
          onClick={() => setPanel({ kind: "settings" })}
        >
          <Settings />
        </button>
      </header>
      <div className="dev-notice">
        <span className="pulse" />
        {apiMode ? text.apiNotice : text.mockNotice}
      </div>
      {backendUnavailable && (
        <div className="error-banner">{text.backendUnavailable}</div>
      )}
      <section className="car-grid" aria-label={text.subtitle}>
        {currentCars.map((car, index) => (
          <CarCard
            key={car.id}
            car={car}
            featured={index === 0}
            locale={locale}
            onPark={() => setPanel({ kind: "park", car })}
            onHistory={() => setPanel({ kind: "history", car })}
            onEdit={() => setPanel({ kind: "edit", car })}
            onRemove={() => setPanel({ kind: "remove", car })}
          />
        ))}
        <button className="add-card" onClick={() => setPanel({ kind: "add" })}>
          <Plus />
          {text.addCar}
        </button>
      </section>
      {panel?.kind === "park" && (
        <ParkingDialog
          car={panel.car}
          locale={locale}
          onClose={() => setPanel(null)}
          onSave={async (location) => {
            setCars(
              await parkData(
                currentCars,
                panel.car.id,
                location,
                userName.trim() || null,
              ),
            );
            setPanel(null);
          }}
        />
      )}
      {panel?.kind === "history" && (
        <HistoryDialog
          car={panel.car}
          locale={locale}
          onClose={() => setPanel(null)}
        />
      )}
      {panel?.kind === "add" && (
        <AddDialog
          locale={locale}
          onClose={() => setPanel(null)}
          onSave={async (input) => {
            setCars(await addData(currentCars, input));
            setPanel(null);
          }}
        />
      )}
      {panel?.kind === "edit" && (
        <CarFormDialog
          car={panel.car}
          locale={locale}
          onClose={() => setPanel(null)}
          onSave={async (input) => {
            setCars(await updateData(currentCars, panel.car.id, input));
            setPanel(null);
          }}
        />
      )}
      {panel?.kind === "remove" && (
        <RemoveDialog
          car={panel.car}
          locale={locale}
          onClose={() => setPanel(null)}
          onRemove={async () => {
            setCars(await removeData(currentCars, panel.car.id));
            setPanel(null);
          }}
        />
      )}
      {panel?.kind === "settings" && (
        <SettingsDialog
          locale={locale}
          userName={userName}
          onClose={() => setPanel(null)}
          onSave={(preferences) => {
            savePreferences(preferences);
            setLocale(preferences.locale);
            setUserName(preferences.userName);
            setPanel(null);
          }}
        />
      )}
    </main>
  );
}

function CarCard({
  car,
  featured,
  locale,
  onPark,
  onHistory,
  onEdit,
  onRemove,
}: {
  car: Car;
  featured: boolean;
  locale: Locale;
  onPark: () => void;
  onHistory: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const text = copy[locale];
  const location = car.parking?.location;
  const where =
    location?.type === "manual"
      ? location.text
      : location
        ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
        : text.noLocationSaved;

  return (
    <article className={`car-card ${featured ? "featured" : ""}`}>
      <div className="card-heading">
        <div>
          <h2>{car.name}</h2>
        </div>
        <button className={`status ${car.parking ? "" : "unknown"}`}>
          <i />
          {car.parking ? text.parked : text.unknown}
        </button>
      </div>

      <div className="car-art">
        <CarIllustration color={car.color} carStyle={car.carStyle} />
      </div>

      <div className={`location-panel ${car.parking ? "" : "empty"}`}>
        <div className="location-panel-heading">
          <span className="pin">
            <MapPin />
          </span>
          <div>
            <span className="location-label">
              {car.parking ? text.parkedLocation : text.noLocationSaved}
            </span>
            <strong>{where}</strong>
          </div>
          {location?.type === "gps" && (
            <a
              className="navigate-button"
              href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation />
              <span>{text.navigate}</span>
            </a>
          )}
        </div>
        {car.parking && (
          <div className="location-meta">
            <span className="location-kind">
              {location?.type === "gps" ? text.gpsLabel : text.manualLabel}
            </span>
            {car.parking.memberName || text.unknownUser} ·{" "}
            {new Intl.DateTimeFormat(locale, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(car.parking.parkedAt))}
          </div>
        )}
      </div>

      <div className="actions">
        <button className="primary" onClick={onPark}>
          <MapPin />
          {text.parkHere}
        </button>
        <div className="action-icons">
          <button
            className="icon-button"
            aria-label={text.history}
            title={text.history}
            onClick={onHistory}
          >
            <Clock3 />
          </button>
          <button
            className="icon-button"
            aria-label={text.editCar}
            title={text.editCar}
            onClick={onEdit}
          >
            <Pencil />
          </button>
          <button
            className="icon-button danger-icon"
            aria-label={text.removeCar}
            title={text.removeCar}
            onClick={onRemove}
          >
            <Trash2 />
          </button>
        </div>
      </div>
    </article>
  );
}

// The dialog components are kept as-is and imported dynamically from the original file scope.
// For brevity they are referenced above but remain in other modules.

function ParkingDialog({
  car,
  locale,
  onClose,
  onSave,
}: {
  car: Car;
  locale: Locale;
  onClose: () => void;
  onSave: (location: ParkingLocation) => Promise<void>;
}) {
  const text = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const [manual, setManual] = useState("");
  const [selectedQuickPick, setSelectedQuickPick] = useState<string | null>(
    null,
  );
  const [gps, setGps] = useState<
    | (Extract<ParkingLocation, { type: "gps" }> & { address?: string })
    | undefined
  >();
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "loading" | "success" | "denied" | "timeout"
  >("idle");
  const [geoMessage, setGeoMessage] = useState("");
  const [accuracyWarning, setAccuracyWarning] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const quickPicks = [
    text.quickHome,
    text.quickOffice,
    text.quickBakery,
    text.quickMall,
    text.quickNarrow,
  ];

  const location: ParkingLocation | undefined =
    gps ??
    (manual.trim() ? { type: "manual", text: manual.trim() } : undefined);

  const formatAddress = (latitude: number, longitude: number) =>
    `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": locale === "he" ? "he" : "en",
            },
          },
        );

        if (!response.ok) return undefined;
        const data = (await response.json()) as {
          address?: {
            road?: string;
            street?: string;
            neighbourhood?: string;
            suburb?: string;
            town?: string;
            city?: string;
            village?: string;
            house_number?: string;
          };
        };

        const address = data.address;
        const road = address?.road ?? address?.street ?? "";
        const district =
          address?.suburb ??
          address?.neighbourhood ??
          address?.village ??
          address?.town ??
          address?.city ??
          "";
        const house = address?.house_number ?? "";
        const parts = [
          house ? `${house}` : "",
          road || "",
          district || "",
        ].filter(Boolean);

        return parts.length ? parts.join(", ") : undefined;
      } catch {
        return undefined;
      }
    },
    [locale],
  );

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setSelectedQuickPick(null);
      setGps(undefined);
      setManual("");
      setGeoStatus("denied");
      setGeoMessage(text.gpsFailed);
      setAccuracyWarning("");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    setGeoStatus("loading");
    setGeoMessage("");
    setAccuracyWarning("");
    setMessage(text.locating);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const nextGps = {
          type: "gps" as const,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        };
        const address = await reverseGeocode(coords.latitude, coords.longitude);

        setGps({ ...nextGps, address });
        setSelectedQuickPick(null);
        setManual(formatAddress(coords.latitude, coords.longitude));
        setGeoStatus("success");
        setGeoMessage("");
        setMessage(text.gpsReady);
        setAccuracyWarning(coords.accuracy > 50 ? text.lowAccuracyWarning : "");
      },
      (error) => {
        setSelectedQuickPick(null);
        setGps(undefined);
        setManual("");
        setMessage("");
        setGeoStatus(
          error.code === error.PERMISSION_DENIED ? "denied" : "timeout",
        );
        setGeoMessage(
          error.code === error.PERMISSION_DENIED
            ? text.locationAccessNeeded
            : text.gPSTimeout,
        );
        setAccuracyWarning("");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 10_000 },
    );
  }, [
    reverseGeocode,
    text.gPSTimeout,
    text.gpsFailed,
    text.gpsReady,
    text.locating,
    text.locationAccessNeeded,
    text.lowAccuracyWarning,
  ]);

  const openDeviceSettings = useCallback(() => {
    if (typeof navigator === "undefined") return;
    const userAgent = navigator.userAgent;
    const target = /iPhone|iPad|iPod/i.test(userAgent)
      ? "app-settings:"
      : /Android/i.test(userAgent)
        ? "app-settings:location"
        : undefined;

    if (target) {
      window.location.href = target;
      return;
    }

    locate();
  }, [locate]);

  const handleQuickPick = (value: string) => {
    setSelectedQuickPick(value);
    setManual(value);
    setGps(undefined);
    setGeoStatus("idle");
    setGeoMessage("");
    setAccuracyWarning("");
    setMessage("");
  };

  const handleManualChange = (value: string) => {
    if (selectedQuickPick && value !== selectedQuickPick) {
      setSelectedQuickPick(null);
    }
    if (value === "") {
      setSelectedQuickPick(null);
    }
    setGps(undefined);
    setManual(value);
    setGeoStatus("idle");
    setGeoMessage("");
    setAccuracyWarning("");
    setMessage("");
  };

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      locate();
    });

    return () => cancelAnimationFrame(frameId);
  }, [locate]);

  const mapBackground = gps
    ? `linear-gradient(180deg, rgba(6, 13, 18, 0.08), rgba(6, 13, 18, 0.18)), url("https://staticmap.openstreetmap.de/staticmap.php?center=${gps.latitude},${gps.longitude}&zoom=18&size=1000x420&maptype=mapnik")`
    : undefined;

  const previewAriaLabel = gps
    ? `Current location: ${gps.address ?? formatAddress(gps.latitude, gps.longitude)}`
    : "Current location preview";

  const locationLabel =
    gps?.address ??
    (gps ? formatAddress(gps.latitude, gps.longitude) : text.addressUnknown);

  return (
    <Dialog
      title={`${text.parkTitle} ${car.name}`}
      close={text.close}
      onClose={onClose}
    >
      <div className="parking-dialog">
        <div className="location-picker-header">{text.selectLocationType}</div>

        <button
          type="button"
          className={`location-preview ${gps ? "has-location" : ""} ${
            geoStatus === "loading" ? "loading" : ""
          }`}
          onClick={locate}
          aria-label={previewAriaLabel}
        >
          <span className="preview-badge">{text.livePreview}</span>

          {geoStatus === "loading" ? (
            <div className="preview-loading" aria-live="polite">
              <span className="spinner" />
              <span>{text.locating}</span>
            </div>
          ) : geoStatus === "success" && gps ? (
            <>
              <div
                className="map-surface"
                style={
                  mapBackground ? { backgroundImage: mapBackground } : undefined
                }
                role="img"
                aria-label={previewAriaLabel}
              >
                <div className="map-pin" aria-hidden="true">
                  <span className="map-pin-core" />
                </div>
              </div>
              <div className="preview-meta">
                <span className="preview-address">{locationLabel}</span>
              </div>
              {typeof gps.accuracy === "number" && (
                <span className="accuracy-pill">
                  ± {Math.round(gps.accuracy)} m {text.accuracyLabel}
                </span>
              )}
            </>
          ) : (
            <div className="preview-empty" aria-live="polite">
              <span className="capture-marker">
                <LocateFixed />
              </span>
              <span className="capture-copy">{text.useGps}</span>
            </div>
          )}
        </button>

        {geoStatus === "denied" && (
          <div className="geo-inline-state error">
            <p>{geoMessage || text.locationAccessNeeded}</p>
            <div className="geo-actions">
              <button
                type="button"
                className="inline-action"
                onClick={openDeviceSettings}
              >
                {text.openSettings}
              </button>
              <button
                type="button"
                className="inline-action secondary"
                onClick={locate}
              >
                {text.retry}
              </button>
            </div>
          </div>
        )}

        {geoStatus === "timeout" && (
          <div className="geo-inline-state warning">
            <p>{geoMessage || text.gPSTimeout}</p>
            <button
              type="button"
              className="inline-action secondary"
              onClick={locate}
            >
              {text.retry}
            </button>
          </div>
        )}

        {accuracyWarning && (
          <p className="helper warning-inline">{accuracyWarning}</p>
        )}

        <div className="quick-picks-label">{text.quickSelect}</div>
        <div className="quick-picks">
          {quickPicks.map((value) => (
            <button
              key={value}
              type="button"
              className={
                selectedQuickPick === value ? "quick-pick active" : "quick-pick"
              }
              onClick={() => handleQuickPick(value)}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="manual-entry-label">{text.orEnterManually}</div>
        <div className="search-field">
          <Search />
          <input
            ref={inputRef}
            value={manual}
            onChange={(event) => handleManualChange(event.target.value)}
            placeholder={text.manualHint}
            aria-label={text.manualHint}
          />
          {manual && (
            <button
              type="button"
              className="clear-input"
              aria-label={text.clearInput}
              onClick={() => {
                setSelectedQuickPick(null);
                setGps(undefined);
                setManual("");
                setGeoStatus("idle");
                setGeoMessage("");
                setAccuracyWarning("");
                setMessage("");
              }}
            >
              <X />
            </button>
          )}
        </div>

        {message && <p className="helper">{message}</p>}

        <button
          className="confirm"
          disabled={!location || saving}
          onClick={async () => {
            if (!location) return;
            setSaving(true);
            try {
              await onSave(location);
            } catch {
              setMessage(text.saveFailed);
              setSaving(false);
            }
          }}
        >
          {text.confirm}
        </button>
      </div>
    </Dialog>
  );
}

function AddDialog(props: {
  locale: Locale;
  onClose: () => void;
  onSave: (input: NewCar) => Promise<void>;
}) {
  return <CarFormDialog {...props} />;
}

function SettingsDialog({
  locale,
  userName,
  onClose,
  onSave,
}: {
  locale: Locale;
  userName: string;
  onClose: () => void;
  onSave: (preferences: { locale: Locale; userName: string }) => void;
}) {
  const text = copy[locale];
  const [draftLocale, setDraftLocale] = useState(locale);
  const [draftName, setDraftName] = useState(userName);
  return (
    <Dialog title={text.settings} close={text.close} onClose={onClose}>
      <p className="field-label">{text.userName}</p>
      <div className="input-with-icon">
        <UserRound />
        <input
          value={draftName}
          maxLength={80}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder={text.userNameHint}
        />
      </div>
      <p className="helper">{text.anonymousHint}</p>
      <p className="field-label">{text.language}</p>
      <div className="segments">
        <button
          className={draftLocale === "en" ? "active" : ""}
          onClick={() => setDraftLocale("en")}
        >
          <Languages /> English
        </button>
        <button
          className={draftLocale === "he" ? "active" : ""}
          onClick={() => setDraftLocale("he")}
        >
          <Languages /> עברית
        </button>
      </div>
      <button
        className="confirm"
        onClick={() =>
          onSave({ locale: draftLocale, userName: draftName.trim() })
        }
      >
        {text.savePreferences}
      </button>
    </Dialog>
  );
}

function CarFormDialog({
  car,
  locale,
  onClose,
  onSave,
}: {
  car?: Car;
  locale: Locale;
  onClose: () => void;
  onSave: (input: NewCar) => Promise<void>;
}) {
  const text = copy[locale];
  const [name, setName] = useState(car?.name ?? "");
  const [plate, setPlate] = useState(car?.plate ?? "");
  const [color, setColor] = useState(car?.color ?? "#159bf3");
  const [carStyle, setCarStyle] = useState<CarStyle>(car?.carStyle ?? "sedan");
  const [error, setError] = useState("");
  const swatches = [
    "#159bf3",
    "#e7edf4",
    "#111111",
    "#50c99a",
    "#ff5c6c",
    "#f5b942",
  ];
  return (
    <Dialog
      title={car ? text.editCar : text.addCar}
      close={text.close}
      onClose={onClose}
    >
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={text.carName}
      />
      <input
        value={plate}
        onChange={(event) => setPlate(event.target.value)}
        placeholder={text.plate}
      />
      <p className="field-label">{text.color}</p>
      <div className="swatches">
        {swatches.map((value) => (
          <button
            key={value}
            className={color === value ? "selected" : ""}
            style={{ background: value }}
            aria-label={`${text.color} ${value}`}
            onClick={() => setColor(value)}
          />
        ))}
      </div>
      <p className="field-label">{text.bodyStyle}</p>
      <div className="car-style-options">
        {(["sedan", "suv", "hatchback"] as const).map((style) => (
          <button
            key={style}
            className={carStyle === style ? "selected" : ""}
            aria-pressed={carStyle === style}
            onClick={() => setCarStyle(style)}
          >
            <CarIllustration color={color} carStyle={style} />
            <span>{text[style]}</span>
          </button>
        ))}
      </div>
      <div className="car-preview">
        <CarIllustration color={color} carStyle={carStyle} />
      </div>
      {error && <p className="helper">{error}</p>}
      <button
        className="confirm"
        disabled={!name.trim()}
        onClick={async () => {
          try {
            await onSave({
              name: name.trim(),
              plate: plate.trim() || undefined,
              color,
              carStyle,
            });
          } catch {
            setError(text.saveFailed);
          }
        }}
      >
        {car ? text.updateCar : text.save}
      </button>
    </Dialog>
  );
}

function RemoveDialog({
  car,
  locale,
  onClose,
  onRemove,
}: {
  car: Car;
  locale: Locale;
  onClose: () => void;
  onRemove: () => Promise<void>;
}) {
  const text = copy[locale];
  const [error, setError] = useState("");
  const title = text.removeTitle.replace("{{name}}", car.name);
  return (
    <Dialog title={title} close={text.close} onClose={onClose}>
      <p className="remove-warning">{text.removeWarning}</p>
      {error && <p className="helper">{error}</p>}
      <div className="dialog-actions">
        <button className="secondary" onClick={onClose}>
          {text.close}
        </button>
        <button
          className="danger-button"
          onClick={async () => {
            try {
              await onRemove();
            } catch {
              setError(text.saveFailed);
            }
          }}
        >
          <Trash2 />
          {text.removeConfirm}
        </button>
      </div>
    </Dialog>
  );
}

function HistoryDialog({
  car,
  locale,
  onClose,
}: {
  car: Car;
  locale: Locale;
  onClose: () => void;
}) {
  const text = copy[locale];
  return (
    <Dialog title={text.history} close={text.close} onClose={onClose}>
      <div className="history-list">
        {car.history.length === 0 ? (
          <p className="helper">{text.noHistory}</p>
        ) : (
          car.history.map((event) => (
            <div className="history-item" key={event.id}>
              <span className="pin">
                <MapPin />
              </span>
              <div>
                <strong>
                  {event.location.type === "manual"
                    ? event.location.text
                    : `${event.location.latitude.toFixed(5)}, ${event.location.longitude.toFixed(5)}`}
                </strong>
                <small>
                  {event.memberName || text.unknownUser} ·{" "}
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(event.parkedAt))}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </Dialog>
  );
}

function Dialog({
  title,
  close,
  onClose,
  children,
}: {
  title: string;
  close: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="dialog-layer"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <header>
          <h2 id="dialog-title">{title}</h2>
          <button className="icon-button" aria-label={close} onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="dialog-content">{children}</div>
      </section>
    </div>
  );
}
