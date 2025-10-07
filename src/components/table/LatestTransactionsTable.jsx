import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import dayjs from "dayjs";
import { fetchTransactions } from "../../api/services.js";

const MAX_RECENT_TRANSACTIONS = 6;

const normalizeText = (value, fallback = "—") => {
  if (!value) return fallback;
  return String(value);
};

const formatAmount = (amount) => {
  if (typeof amount !== "number") return "—";
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  });
};

const formatMethod = (method) => {
  if (!method) return "Manual";
  return method
    .toString()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  return status
    .toString()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
};

const LatestTransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTransactions({ limit: MAX_RECENT_TRANSACTIONS, sort: "-createdAt" });
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to load transactions.");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  return (
    <TableContainer
      component={Paper}
      className="relative w-full max-w-full overflow-x-auto rounded-[24px] border border-border/60 bg-surface/95 shadow-medium backdrop-blur-xl dark:border-dark-border/70 dark:bg-dark-surface/80"
    >
      <Table
        aria-label="latest transactions table"
        sx={{
          width: "100%",
          minWidth: 0,
          tableLayout: "fixed",
          borderCollapse: "separate",
          borderSpacing: 0,
          background: "linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(226,232,240,0.85) 100%)",
          "& thead": {
            position: "sticky",
            top: 0,
            zIndex: 1,
            background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(226,232,240,0.82) 100%)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(148, 163, 184, 0.28)",
          },
          "& th": {
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontSize: "0.68rem",
            fontWeight: 600,
            color: "rgba(30, 41, 59, 0.86)",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(148, 163, 184, 0.24)",
            textShadow: "0 1px 0 rgba(255,255,255,0.6)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
          "& td": {
            borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
            fontSize: "0.85rem",
            color: "rgba(15, 23, 42, 0.92)",
            padding: "18px 20px",
            verticalAlign: "top",
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          },
          "& tbody tr": {
            transition: "background-color 180ms ease, transform 180ms ease",
          },
          "& tbody tr:hover": {
            backgroundColor: "rgba(59, 130, 246, 0.08)",
            transform: "translateY(-2px)",
          },
          ".dark &": {
            background: "linear-gradient(180deg, rgba(17,24,39,0.95) 0%, rgba(15,23,42,0.82) 100%)",
            "& thead": {
              background: "linear-gradient(135deg, rgba(8,11,18,0.98) 0%, rgba(8,11,18,0.92) 100%)",
              borderBottom: "1px solid rgba(71, 85, 105, 0.75)",
              boxShadow: "inset 0 -1px 0 rgba(8, 11, 18, 0.8)",
            },
            "& th": {
              backgroundColor: "rgba(8, 11, 18, 0.96)",
              color: "rgba(248, 250, 252, 0.96)",
              borderBottom: "1px solid rgba(71, 85, 105, 0.75)",
              textShadow: "0 1px 0 rgba(8, 11, 18, 0.8)",
            },
            "& td": {
              borderBottom: "1px solid rgba(51, 65, 85, 0.55)",
              color: "rgba(226, 232, 240, 0.92)",
            },
            "& tbody tr:hover": {
              backgroundColor: "rgba(59, 130, 246, 0.18)",
            },
          },
        }}
      >
        <TableHead>
          <TableRow>
              <TableCell className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary dark:text-dark-text-primary">
                Transaction
              </TableCell>
              <TableCell className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary dark:text-dark-text-primary">
                Guest
              </TableCell>
              <TableCell className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary dark:text-dark-text-primary">
                Hotel
              </TableCell>
              <TableCell className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary dark:text-dark-text-primary">
                Amount
              </TableCell>
              <TableCell className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary dark:text-dark-text-primary">
                Method
              </TableCell>
              <TableCell className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary dark:text-dark-text-primary">
                Status
              </TableCell>
              <TableCell className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary dark:text-dark-text-primary">
                Created
              </TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-text-muted dark:text-dark-text-muted">
                  Loading latest transactions…
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-danger">
                  {error}
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-text-muted">
                  No transactions captured yet.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((row) => {
                const status = (row.status || "pending").toLowerCase();
                const methodValue = (row.method || "manual").toLowerCase();

                return (
                  <TableRow key={row._id} className="transition">
                    <TableCell className="font-mono text-xs text-text-muted dark:text-dark-text-muted">
                      {normalizeText(row._id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
                          {normalizeText(row.user?.username || row.user?.email, "Guest")}
                        </span>
                        <span className="text-xs text-text-muted dark:text-dark-text-muted">
                          {normalizeText(row.user?.email)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-text-primary dark:text-dark-text-primary">
                          {normalizeText(row.hotel?.name, "Unassigned hotel")}
                        </span>
                        <span className="text-xs text-text-muted dark:text-dark-text-muted">
                          {normalizeText(row.booking?._id, "No booking linked")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                      {formatAmount(row.amount)}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary dark:bg-primary/20 dark:text-primary/90">
                        {formatMethod(methodValue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${
                          status === "approved"
                            ? "bg-green-100 text-success dark:bg-green-500/15 dark:text-[#4ade80]"
                            : status === "pending"
                            ? "bg-amber-100 text-warning dark:bg-amber-500/15 dark:text-[#fbbf24]"
                            : "bg-red-100 text-danger dark:bg-red-500/15 dark:text-[#fca5a5]"
                        }`}
                      >
                        {formatStatus(row.status)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted dark:text-dark-text-muted">
                      {row.createdAt ? dayjs(row.createdAt).format("DD MMM, YYYY") : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LatestTransactionsTable;
