import React, { useEffect, useState } from "react";
import {
  createFacility,
  deleteFacility,
  fetchFacilities,
  fetchFacilityStatuses,
  fetchFacilityTypes,
  updateFacility,
} from "../api";
import "../user/Facilities.css";

const blankForm = {
  name: "",
  type: "",
  capacity: "",
  location: "",
  availableFrom: "08:00",
  availableTo: "17:00",
  status: "ACTIVE",
  description: "",
};

function toLabel(value) {
  return value.replaceAll("_", " ");
}

function FacilitiesAdmin() {
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [facilityStatuses, setFacilityStatuses] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [types, statuses, facilityData] = await Promise.all([
        fetchFacilityTypes(),
        fetchFacilityStatuses(),
        fetchFacilities({ sortBy: "name", sortDir: "asc" }),
      ]);
      setFacilityTypes(types);
      setFacilityStatuses(statuses);
      setFacilities(facilityData);
      if (!form.type && types.length > 0) {
        setForm(prev => ({ ...prev, type: types[0] }));
      }
      if (!form.status && statuses.length > 0) {
        setForm(prev => ({ ...prev, status: statuses[0] }));
      }
    } catch (err) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setEditingId(null);
    setForm({
      ...blankForm,
      type: facilityTypes[0] || "",
      status: facilityStatuses[0] || "ACTIVE",
    });
  };

  const onEdit = facility => {
    setEditingId(facility.id);
    setForm({
      name: facility.name,
      type: facility.type,
      capacity: facility.capacity,
      location: facility.location,
      availableFrom: facility.availableFrom,
      availableTo: facility.availableTo,
      status: facility.status,
      description: facility.description,
    });
    setMessage("");
    setError("");
  };

  const onSubmit = async event => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const payload = {
      ...form,
      capacity: Number(form.capacity),
    };
    try {
      if (editingId) {
        await updateFacility(editingId, payload);
        setMessage("Facility updated successfully.");
      } else {
        await createFacility(payload);
        setMessage("Facility created successfully.");
      }
      clearForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to save facility");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async facilityId => {
    const confirmed = window.confirm("Delete this facility from the catalogue?");
    if (!confirmed) {
      return;
    }
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await deleteFacility(facilityId);
      setMessage("Facility deleted.");
      if (editingId === facilityId) {
        clearForm();
      }
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete facility");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="facility-shell">
      <h2>Admin - Facilities Management</h2>
      <p className="facility-subtitle">
        Manage catalogue records, operational status, and availability windows for bookable assets.
      </p>

      <form className="facility-admin-form" onSubmit={onSubmit}>
        <input name="name" value={form.name} onChange={onChange} placeholder="Resource name" required />
        <select name="type" value={form.type} onChange={onChange} required>
          <option value="" disabled>
            Select type
          </option>
          {facilityTypes.map(type => (
            <option key={type} value={type}>
              {toLabel(type)}
            </option>
          ))}
        </select>
        <input
          name="capacity"
          type="number"
          min="1"
          value={form.capacity}
          onChange={onChange}
          placeholder="Capacity"
          required
        />
        <input name="location" value={form.location} onChange={onChange} placeholder="Location" required />
        <input name="availableFrom" type="time" value={form.availableFrom} onChange={onChange} required />
        <input name="availableTo" type="time" value={form.availableTo} onChange={onChange} required />
        <select name="status" value={form.status} onChange={onChange} required>
          {facilityStatuses.map(status => (
            <option key={status} value={status}>
              {toLabel(status)}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          rows="3"
          value={form.description}
          onChange={onChange}
          placeholder="Short operational description"
          required
        />
        <div className="facility-admin-actions">
          <button type="submit" disabled={busy}>
            {editingId ? "Update Facility" : "Create Facility"}
          </button>
          <button type="button" className="secondary" onClick={clearForm} disabled={busy}>
            Reset
          </button>
        </div>
      </form>

      {loading && <p className="state-text">Loading admin catalogue...</p>}
      {error && <p className="state-text error">{error}</p>}
      {message && <p className="state-text success">{message}</p>}

      <div className="facility-admin-list">
        {facilities.map(facility => (
          <article className="facility-admin-item" key={facility.id}>
            <div>
              <h3>{facility.name}</h3>
              <p>
                {toLabel(facility.type)} | Capacity {facility.capacity} | {facility.location}
              </p>
              <p>
                {facility.availableFrom} - {facility.availableTo} | {toLabel(facility.status)}
              </p>
            </div>
            <div className="facility-inline-actions">
              <button type="button" onClick={() => onEdit(facility)} disabled={busy}>
                Edit
              </button>
              <button type="button" className="danger" onClick={() => onDelete(facility.id)} disabled={busy}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FacilitiesAdmin;
