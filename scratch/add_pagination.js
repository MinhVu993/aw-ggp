const fs = require('fs');

const filePath = 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\requests\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state for pagination
const stateInsertionPoint = `  const [filterSearchQuery, setFilterSearchQuery] = useState("");`;
const paginationState = `
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, selectedCodesFilter, selectedTimesFilter, selectedAreasFilter, selectedPeopleFilter, selectedRequestersFilter, selectedStatusesFilter]);
`;
content = content.replace(stateInsertionPoint, stateInsertionPoint + paginationState);

// 2. Add derived paginatedRequests
const paginatedRequestsInsertion = `
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);
`;
const insertionPoint2 = `  }, [requests, statusFilter, searchQuery, user, selectedCodesFilter, selectedTimesFilter, selectedAreasFilter, selectedPeopleFilter, selectedRequestersFilter, selectedStatusesFilter]);`;
content = content.replace(insertionPoint2, insertionPoint2 + '\n' + paginatedRequestsInsertion);


// 3. Replace filteredRequests.map with paginatedRequests.map in table body
content = content.replace(`{filteredRequests.map((item, index) => (`, `{paginatedRequests.map((item, index) => (`);

// 4. Update the bottom div to include pagination controls
const oldBottomDiv = `<div style={{ display: "flex", justifyContent: "flex-start", marginTop: "1rem", padding: "0 1rem" }}>`;
const newBottomDiv = `<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", padding: "0 1rem", marginBottom: "1.5rem" }}>`;
content = content.replace(oldBottomDiv, newBottomDiv);

const oldExportButtonEnd = `          <span>{t("export_csv") || "Xuất CSV"}</span>
        </button>
      </div>`;

const newPaginationUI = `          <span>{t("export_csv") || "Xuất CSV"}</span>
        </button>

        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginRight: "0.5rem" }}>
              {t("page") || "Trang"} {currentPage} / {totalPages}
            </span>
            <button
              className={styles.btnOutline}
              style={{ padding: "0.25rem 0.5rem", minWidth: "32px" }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              &lt;
            </button>
            <button
              className={styles.btnOutline}
              style={{ padding: "0.25rem 0.5rem", minWidth: "32px" }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              &gt;
            </button>
          </div>
        )}
      </div>`;
content = content.replace(oldExportButtonEnd, newPaginationUI);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Pagination added successfully!");
