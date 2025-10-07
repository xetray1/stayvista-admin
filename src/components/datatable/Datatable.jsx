import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { deleteResource, fetchCollection } from "../../api/services.js";

const Datatable = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const errorMessage =
    error?.response?.data?.message || error?.message || (error ? "Failed to load data" : "");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCollection(path);
      setRows(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const resourceCopy = useMemo(
    () => ({
      rooms: { singular: "room", definite: "this room" },
      hotels: { singular: "hotel", definite: "this hotel" },
      users: { singular: "member", definite: "this member" },
    }),
    []
  );

  const { singular: resourceSingular = "item", definite: resourceDefinite = "this item" } =
    resourceCopy[path] || {};

  const resourceLabel = useMemo(
    () => resourceSingular.charAt(0).toUpperCase() + resourceSingular.slice(1),
    [resourceSingular]
  );

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm(`Are you sure you want to remove ${resourceDefinite}?`);
      if (!confirmed) return;

      try {
        await deleteResource(path, id);
        setRows((prev) => prev.filter((item) => item._id !== id));
        setToast({ type: "success", message: `${resourceLabel} deleted successfully.` });
      } catch (err) {
        setError(err);
        const message =
          err?.response?.data?.message || err?.message || `Unable to delete ${resourceSingular}.`;
        setToast({ type: "error", message });
      }
    },
    [path, resourceDefinite, resourceLabel, resourceSingular]
  );

  const metaByPath = {
    rooms: {
      eyebrow: "Inventory",
      title: "Rooms inventory",
      subtitle:
        "Review every room type, rates, and the room numbers currently assigned to each hotel.",
      actionLabel: "Add room",
    },
    hotels: {
      eyebrow: "Portfolio",
      title: "Hotels directory",
      subtitle:
        "Keep property details sharp so teams can maintain availability, pricing, and photos with confidence.",
      actionLabel: "Add hotel",
    },
    users: {
      eyebrow: "Team",
      title: "Admin members",
      subtitle: "Manage who has access, adjust permissions, and keep roles aligned with responsibilities.",
      actionLabel: "Add member",
    },
  };

  const meta = metaByPath[path] || {
    title: path.charAt(0).toUpperCase() + path.slice(1),
    actionLabel: "Add new",
  };

  const actionColumn = useMemo(
    () => [
      {
        field: "action",
        headerName: "Action",
        width: 180,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/${path}/${params.row._id}`}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
            >
              View
            </Link>
            <button
              type="button"
              className="rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger transition hover:bg-danger/20"
              onClick={() => handleDelete(params.row._id)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [handleDelete, path]
  );

  const compactColumns = useMemo(
    () =>
      columns
        .filter((column) => column.field && column.field !== "action")
        .map((column) => ({
          field: column.field,
          headerName: column.headerName || column.field,
        })),
    [columns],
  );

  const renderCompactValue = (row, field) => {
    if (!field) return undefined;
    const value = row?.[field];
    if (value === undefined || value === null || value === "") return "—";
    if (typeof value === "number") return value.toLocaleString();
    if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
    if (typeof value === "object") {
      const label = value?.name || value?.title || value?.username || value?.email || value?._id;
      return label || JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <section className="space-y-6 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-medium backdrop-blur-xl dark:border-dark-border/70 dark:bg-dark-surface/60">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          {meta.eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {meta.eyebrow}
            </span>
          )}
          <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">
            {meta.title}
          </h2>
          {meta.subtitle && (
            <p className="max-w-2xl text-sm text-text-muted dark:text-dark-text-muted">
              {meta.subtitle}
            </p>
          )}
        </div>
        <Link
          to={`/${path}/new`}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-dark"
        >
          {meta.actionLabel || "Add new"}
        </Link>
      </header>

      {errorMessage && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {errorMessage}
        </div>
      )}

      {toast && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-soft ${
            toast.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      <div className="grid gap-4 lg:hidden">
        {loading ? (
          <div className="animate-pulse space-y-3 rounded-2xl border border-border/60 bg-surface/80 p-4 dark:border-dark-border/60 dark:bg-dark-surface/70">
            <div className="h-4 rounded bg-border/70 dark:bg-dark-border/60" />
            <div className="h-4 rounded bg-border/50 dark:bg-dark-border/40" />
            <div className="h-4 w-2/3 rounded bg-border/40 dark:bg-dark-border/30" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 text-sm text-text-muted dark:border-dark-border/60 dark:bg-dark-surface/70 dark:text-dark-text-muted">
            No records available yet.
          </div>
        ) : (
          rows.map((row) => {
            const primaryField = compactColumns[0]?.field;
            const secondaryField = compactColumns[1]?.field;
            const primaryText = renderCompactValue(row, primaryField) || row?.title || row?.name || row?._id || "Record";
            const secondaryText = renderCompactValue(row, secondaryField);

            return (
            <article
              key={row._id}
              className="space-y-3 rounded-2xl border border-border/60 bg-surface/95 p-4 shadow-soft dark:border-dark-border/60 dark:bg-dark-surface/80"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
                    {primaryText}
                  </p>
                  {secondaryField && (
                    <p className="text-xs text-text-muted dark:text-dark-text-muted">
                      {secondaryText}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/${path}/${row._id}`}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    className="rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger transition hover:bg-danger/20"
                    onClick={() => handleDelete(row._id)}
                  >
                    Delete
                  </button>
                </div>
              </header>
              <dl className="grid gap-2 text-xs">
                {compactColumns.slice(2).map((column) => (
                  <div key={column.field} className="flex flex-col gap-1 rounded-xl border border-border/40 bg-background/70 px-3 py-2 dark:border-dark-border/40 dark:bg-dark-background/60">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted dark:text-dark-text-muted">
                      {column.headerName}
                    </dt>
                    <dd className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                      {renderCompactValue(row, column.field)}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
            );
          })
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-[24px] border border-border/50 bg-surface/95 shadow-soft dark:border-dark-border/60 dark:bg-dark-surface/80 lg:block">
        <DataGrid
          className="min-w-[720px] !border-none !bg-transparent"
          autoHeight
          rows={rows}
          columns={[...columns, ...actionColumn]}
          getRowId={(row) => row._id}
          disableRowSelectionOnClick
          loading={loading}
          disableColumnMenu
          pageSizeOptions={[9, 18, 36]}
          initialState={{ pagination: { paginationModel: { pageSize: 9 } } }}
          rowHeight={64}
          columnHeaderHeight={56}
          sx={{
            borderRadius: "24px",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            boxShadow: "0 28px 80px -48px rgba(15, 23, 42, 0.35)",
            background: "linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(226,232,240,0.85) 100%)",
            fontSize: 14,
            "& .MuiDataGrid-columnHeaders": {
              position: "sticky",
              top: 0,
              zIndex: 2,
              background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(226,232,240,0.75) 100%)",
              backdropFilter: "blur(14px)",
              borderBottom: "1px solid rgba(148, 163, 184, 0.26)",
              padding: "0 16px",
            },
            "& .MuiDataGrid-columnHeader": {
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontWeight: 600,
              color: "rgba(30, 41, 59, 0.82)",
              fontFamily:
                '"General Sans", "Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
              padding: "0 8px",
              lineHeight: 1.4,
            },
            "& .MuiDataGrid-columnSeparator": {
              display: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
              color: "rgba(15, 23, 42, 0.9)",
              fontSize: "0.9rem",
              lineHeight: 1.4,
              padding: "12px 16px",
              alignItems: "center",
              display: "flex",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
            "& .MuiDataGrid-row": {
              transition: "background-color 180ms ease, transform 180ms ease",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(59, 130, 246, 0.08)",
              transform: "translateY(-2px)",
            },
            "& .MuiDataGrid-virtualScroller": {
              background: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(241,245,249,0.82) 100%)",
              overflowX: "hidden",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid rgba(148, 163, 184, 0.18)",
              background: "linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(226,232,240,0.8) 100%)",
              minHeight: 62,
              color: "rgba(30, 41, 59, 0.78)",
              letterSpacing: "0.1em",
              fontWeight: 600,
              padding: "0 16px",
            },
            ".dark &": {
              border: "1px solid rgba(71, 85, 105, 0.32)",
              background: "linear-gradient(180deg, rgba(8,11,18,0.97) 0%, rgba(8,11,18,0.84) 100%)",
              boxShadow: "0 30px 80px -48px rgba(15, 23, 42, 0.75)",
              "& .MuiDataGrid-columnHeaders": {
                background: "linear-gradient(135deg, rgba(8,11,18,0.98) 0%, rgba(8,11,18,0.9) 100%)",
                borderBottom: "1px solid rgba(71, 85, 105, 0.74)",
                boxShadow: "inset 0 -1px 0 rgba(8, 11, 18, 0.82)",
              },
              "& .MuiDataGrid-columnHeader--filler": {
                background: "linear-gradient(135deg, rgba(8,11,18,0.98) 0%, rgba(8,11,18,0.9) 100%)",
                borderBottom: "1px solid rgba(71, 85, 105, 0.74)",
              },
              "& .MuiDataGrid-columnHeadersInner": {
                background: "linear-gradient(135deg, rgba(8,11,18,0.98) 0%, rgba(8,11,18,0.9) 100%)",
              },
              "& .MuiDataGrid-filler": {
                background: "linear-gradient(135deg, rgba(8,11,18,0.98) 0%, rgba(8,11,18,0.9) 100%)",
                borderBottom: "1px solid rgba(71, 85, 105, 0.74)",
              },
              "& .MuiDataGrid-scrollbarFiller": {
                backgroundColor: "rgba(8, 11, 18, 0.94)",
                borderBottom: "1px solid rgba(71, 85, 105, 0.74)",
              },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "rgba(8, 11, 18, 0.94)",
                borderColor: "rgba(71, 85, 105, 0.74)",
                color: "rgba(248, 250, 252, 0.96)",
                letterSpacing: "0.18em",
                textShadow: "0 1px 0 rgba(8, 11, 18, 0.8)",
                padding: "0 8px",
                lineHeight: 1.4,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                color: "rgba(248, 250, 252, 0.96)",
                textShadow: "0 1px 0 rgba(8, 11, 18, 0.8)",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid rgba(51, 65, 85, 0.6)",
                color: "rgba(226, 232, 240, 0.9)",
                padding: "12px 16px",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "rgba(59, 130, 246, 0.16)",
              },
              "& .MuiDataGrid-virtualScroller": {
                background: "linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.78) 100%)",
                overflowX: "hidden",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid rgba(51, 65, 85, 0.65)",
                background: "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)",
                color: "rgba(226, 232, 240, 0.88)",
                letterSpacing: "0.1em",
                fontWeight: 600,
                padding: "0 16px",
              },
            },
          }}
        />
      </div>
    </section>
  );
};

export default Datatable;
