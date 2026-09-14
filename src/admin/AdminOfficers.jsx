import { useEffect, useState } from "react";

import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Building2,
  FileText,
  Mail,
  Phone,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

const OFFICERS_API =
  `${API_BASE}/api/manage_officers.php`;

const DEPARTMENTS_API =
  `${API_BASE}/api/get_departments.php`;

function AdminOfficers() {
  const [officers, setOfficers] = useState([]);

  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingOfficer, setEditingOfficer] =
    useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    department_id: "",
  });


  useEffect(() => {
    loadOfficers();
    loadDepartments();
  }, []);


  async function loadOfficers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        OFFICERS_API
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load officers."
        );
      }

      setOfficers(data.officers || []);

    } catch (err) {
      setError(
        err.message ||
          "Unable to load officers."
      );
    } finally {
      setLoading(false);
    }
  }


  async function loadDepartments() {
    try {
      const response = await fetch(
        DEPARTMENTS_API
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load departments."
        );
      }

      setDepartments(
        data.departments || []
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to load departments."
      );
    }
  }


  function openAddModal() {
    setEditingOfficer(null);

    setForm({
      full_name: "",
      email: "",
      phone: "",
      department_id: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  }


  function openEditModal(officer) {
    setEditingOfficer(officer);

    setForm({
      full_name: officer.full_name || "",
      email: officer.email || "",
      phone: officer.phone || "",
      department_id:
        officer.department_id
          ? String(officer.department_id)
          : "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  }


  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingOfficer(null);

    setForm({
      full_name: "",
      email: "",
      phone: "",
      department_id: "",
    });
  }


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  async function saveOfficer(event) {
    event.preventDefault();

    if (!form.full_name.trim()) {
      setError(
        "Officer full name is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const method =
        editingOfficer
          ? "PUT"
          : "POST";

      const body = {
        ...(editingOfficer
          ? { id: editingOfficer.id }
          : {}),

        full_name:
          form.full_name.trim(),

        email:
          form.email.trim(),

        phone:
          form.phone.trim(),

        department_id:
          form.department_id
            ? Number(form.department_id)
            : null,
      };

      const response = await fetch(
        OFFICERS_API,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to save officer."
        );
      }

      setSuccess(
        editingOfficer
          ? "Officer updated successfully."
          : "Officer created successfully."
      );

      await loadOfficers();

      setTimeout(() => {
        closeModal();
      }, 700);

    } catch (err) {
      setError(
        err.message ||
          "Unable to save officer."
      );
    } finally {
      setSaving(false);
    }
  }


  async function deleteOfficer(officer) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${officer.full_name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        OFFICERS_API,
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: officer.id,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to delete officer."
        );
      }

      setSuccess(
        "Officer deleted successfully."
      );

      await loadOfficers();

    } catch (err) {
      setError(
        err.message ||
          "Unable to delete officer."
      );
    }
  }


  const filteredOfficers =
    officers.filter((officer) => {
      const value =
        search
          .toLowerCase()
          .trim();

      if (!value) {
        return true;
      }

      return (
        String(
          officer.full_name || ""
        )
          .toLowerCase()
          .includes(value) ||

        String(
          officer.email || ""
        )
          .toLowerCase()
          .includes(value) ||

        String(
          officer.phone || ""
        )
          .toLowerCase()
          .includes(value) ||

        String(
          officer.department_name || ""
        )
          .toLowerCase()
          .includes(value)
      );
    });


  const totalOfficers =
    officers.length;

  const assignedOfficers =
    officers.filter(
      (officer) =>
        Number(
          officer.reports_count || 0
        ) > 0
    ).length;


  return (
    <main className="admin-main">

      <div className="admin-topbar">

        <div>
          <h1>Officers</h1>

          <p>
            Manage municipal officers
            responsible for handling reports.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >

          <button
            className="admin-refresh-btn"
            onClick={() => {
              loadOfficers();
              loadDepartments();
            }}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            className="management-save-btn"
            onClick={openAddModal}
          >
            <UserPlus size={17} />

            Add Officer
          </button>

        </div>
      </div>


      {error && (
        <div className="admin-error">

          <AlertCircle size={18} />

          <span>{error}</span>

        </div>
      )}


      {success && (
        <div className="admin-success">

          <CheckCircle2 size={18} />

          <span>{success}</span>

        </div>
      )}


      <section className="management-stats">

        <div className="management-stat-card">

          <div className="management-stat-icon">
            <Users size={22} />
          </div>

          <div>
            <strong>
              {totalOfficers}
            </strong>

            <span>
              Total Officers
            </span>
          </div>

        </div>


        <div className="management-stat-card">

          <div className="management-stat-icon">
            <FileText size={22} />
          </div>

          <div>
            <strong>
              {assignedOfficers}
            </strong>

            <span>
              Assigned Officers
            </span>
          </div>

        </div>


        <div className="management-stat-card">

          <div className="management-stat-icon">
            <Building2 size={22} />
          </div>

          <div>
            <strong>
              {departments.length}
            </strong>

            <span>
              Departments
            </span>
          </div>

        </div>

      </section>


      <section className="reports-toolbar">

        <div className="reports-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search officers..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

      </section>


      {loading ? (

        <div className="reports-loading">

          <RefreshCw
            size={25}
            className="spin"
          />

          <p>
            Loading officers...
          </p>

        </div>

      ) : filteredOfficers.length === 0 ? (

        <div className="reports-empty">

          <Users size={40} />

          <h3>
            No officers found
          </h3>

          <p>
            Add an officer to get started.
          </p>

        </div>

      ) : (

        <div className="officer-grid">

          {filteredOfficers.map(
            (officer) => (

              <div
                className="officer-card"
                key={officer.id}
              >

                <div className="officer-card-top">

                  <div className="officer-avatar">
                    <Users size={25} />
                  </div>

                  <div className="officer-actions">

                    <button
                      className="department-edit-btn"
                      onClick={() =>
                        openEditModal(
                          officer
                        )
                      }
                      title="Edit officer"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="department-delete-btn"
                      onClick={() =>
                        deleteOfficer(
                          officer
                        )
                      }
                      title="Delete officer"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>


                <div className="officer-card-body">

                  <h3>
                    {officer.full_name}
                  </h3>

                  <div className="officer-info">

                    <div>
                      <Mail size={15} />

                      <span>
                        {officer.email ||
                          "No email"}
                      </span>
                    </div>

                    <div>
                      <Phone size={15} />

                      <span>
                        {officer.phone ||
                          "No phone"}
                      </span>
                    </div>

                    <div>
                      <Building2 size={15} />

                      <span>
                        {officer.department_name ||
                          "Unassigned"}
                      </span>
                    </div>

                  </div>

                </div>


                <div className="officer-card-footer">

                  <div>
                    <FileText size={16} />

                    <span>
                      <strong>
                        {
                          officer.reports_count ??
                          0
                        }
                      </strong>

                      Reports
                    </span>
                  </div>

                  <span className="officer-status">
                    Active
                  </span>

                </div>

              </div>
            )
          )}

        </div>
      )}


      {showModal && (

        <div
          className="report-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="department-modal officer-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="report-modal-header">

              <div>

                <h2>
                  {editingOfficer
                    ? "Edit Officer"
                    : "Add Officer"}
                </h2>

                <p>
                  {editingOfficer
                    ? "Update officer information."
                    : "Create a municipal officer account."}
                </p>

              </div>

              <button
                className="management-cancel-btn"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>


            <form
              onSubmit={saveOfficer}
            >

              <div className="management-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="full_name"
                  className="management-input"
                  placeholder="e.g. Ali Hassan"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="management-field">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  className="management-input"
                  placeholder="officer@municipality.local"
                  value={form.email}
                  onChange={handleChange}
                />

              </div>


              <div className="management-field">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  className="management-input"
                  placeholder="+255..."
                  value={form.phone}
                  onChange={handleChange}
                />

              </div>


              <div className="management-field">

                <label>
                  Department
                </label>

                <select
                  name="department_id"
                  className="management-input"
                  value={
                    form.department_id
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select Department
                  </option>

                  {departments.map(
                    (department) => (

                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="management-actions">

                <button
                  type="button"
                  className="management-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  <X size={17} />

                  Cancel
                </button>


                <button
                  type="submit"
                  className="management-save-btn"
                  disabled={saving}
                >

                  {saving ? (

                    <>
                      <RefreshCw
                        size={17}
                        className="spin"
                      />

                      Saving...
                    </>

                  ) : (

                    <>
                      <Save size={17} />

                      {editingOfficer
                        ? "Update Officer"
                        : "Create Officer"}
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

export default AdminOfficers;
