import { useEffect, useState } from "react";

import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Users,
  FileText,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

const DEPARTMENTS_API =
  `${API_BASE}/api/manage_departments.php`;

function AdminDepartments() {
  const [departments, setDepartments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });


  useEffect(() => {
    loadDepartments();
  }, []);


  async function loadDepartments() {
    try {
      setLoading(true);
      setError("");

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

    } finally {

      setLoading(false);
    }
  }


  function openAddModal() {

    setEditingDepartment(null);

    setForm({
      name: "",
      description: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  }


  function openEditModal(department) {

    setEditingDepartment(department);

    setForm({
      name: department.name || "",
      description:
        department.description || "",
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

    setEditingDepartment(null);

    setForm({
      name: "",
      description: "",
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


  async function saveDepartment(event) {

    event.preventDefault();

    if (!form.name.trim()) {

      setError(
        "Department name is required."
      );

      return;
    }

    try {

      setSaving(true);
      setError("");
      setSuccess("");

      const method =
        editingDepartment
          ? "PUT"
          : "POST";

      const body =
        editingDepartment
          ? {
              id: editingDepartment.id,
              name: form.name.trim(),
              description:
                form.description.trim(),
            }
          : {
              name: form.name.trim(),
              description:
                form.description.trim(),
            };

      const response = await fetch(
        DEPARTMENTS_API,
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
            "Failed to save department."
        );
      }

      setSuccess(
        editingDepartment
          ? "Department updated successfully."
          : "Department created successfully."
      );

      await loadDepartments();

      setTimeout(() => {
        closeModal();
      }, 700);

    } catch (err) {

      setError(
        err.message ||
          "Unable to save department."
      );

    } finally {

      setSaving(false);
    }
  }


  async function deleteDepartment(
    department
  ) {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${department.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {

      setError("");
      setSuccess("");

      const response = await fetch(
        DEPARTMENTS_API,
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: department.id,
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
            "Failed to delete department."
        );
      }

      setSuccess(
        "Department deleted successfully."
      );

      await loadDepartments();

    } catch (err) {

      setError(
        err.message ||
          "Unable to delete department."
      );
    }
  }


  const filteredDepartments =
    departments.filter(
      (department) => {

        const value =
          search
            .toLowerCase()
            .trim();

        if (!value) {
          return true;
        }

        return (
          String(
            department.name || ""
          )
            .toLowerCase()
            .includes(value) ||

          String(
            department.description || ""
          )
            .toLowerCase()
            .includes(value)
        );
      }
    );


  return (
    <main className="admin-main">

      <div className="admin-topbar">

        <div>
          <h1>
            Departments
          </h1>

          <p>
            Manage municipal departments
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
            onClick={loadDepartments}
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
            <Plus size={17} />

            Add Department
          </button>

        </div>
      </div>


      {error && (
        <div className="admin-error">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

        </div>
      )}


      {success && (
        <div className="admin-success">

          <CheckCircle2 size={18} />

          <span>
            {success}
          </span>

        </div>
      )}


      <section className="reports-toolbar">

        <div className="reports-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search departments..."
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
            Loading departments...
          </p>

        </div>

      ) : filteredDepartments.length === 0 ? (

        <div className="reports-empty">

          <Building2 size={40} />

          <h3>
            No departments found
          </h3>

          <p>
            Add a department to get
            started.
          </p>

        </div>

      ) : (

        <div className="department-grid">

          {filteredDepartments.map(
            (department) => (

              <div
                className="department-card"
                key={department.id}
              >

                <div className="department-card-header">

                  <div className="department-icon">

                    <Building2
                      size={24}
                    />

                  </div>

                  <div
                    className="department-actions"
                  >

                    <button
                      className="department-edit-btn"
                      onClick={() =>
                        openEditModal(
                          department
                        )
                      }
                      title="Edit department"
                    >
                      <Pencil
                        size={16}
                      />
                    </button>

                    <button
                      className="department-delete-btn"
                      onClick={() =>
                        deleteDepartment(
                          department
                        )
                      }
                      title="Delete department"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>

                  </div>

                </div>


                <div className="department-card-body">

                  <h3>
                    {department.name}
                  </h3>

                  <p>
                    {department.description ||
                      "No description provided."}
                  </p>

                </div>


                <div className="department-card-stats">

                  <div>

                    <Users size={16} />

                    <span>
                      <strong>
                        {
                          department.officers_count ??
                          0
                        }
                      </strong>

                      Officers
                    </span>

                  </div>


                  <div>

                    <FileText
                      size={16}
                    />

                    <span>
                      <strong>
                        {
                          department.reports_count ??
                          0
                        }
                      </strong>

                      Reports
                    </span>

                  </div>

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
            className="department-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="report-modal-header">

              <div>

                <h2>
                  {editingDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p>
                  {editingDepartment
                    ? "Update department information."
                    : "Create a new municipal department."}
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
              onSubmit={saveDepartment}
            >

              <div className="management-field">

                <label>
                  Department Name
                </label>

                <input
                  type="text"
                  name="name"
                  className="management-input"
                  placeholder="e.g. Environmental Department"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              <div className="management-field">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  className="management-textarea"
                  rows="4"
                  placeholder="Describe the responsibilities of this department..."
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                />

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

                      {editingDepartment
                        ? "Update Department"
                        : "Create Department"}

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

export default AdminDepartments;
