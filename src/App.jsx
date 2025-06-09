import React, { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import DataTable from "react-data-table-component";
import Select from "react-select";
import AsyncSelect from "react-select/async";

const App = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [allKeys, setAllKeys] = useState([]);
  const [modBase, setModBase] = useState("");
  const [modRemainders, setModRemainders] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState({});

  useEffect(() => {
    fetch("/dataset_large.csv")
      .then((res) => res.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
        const d = parsed.data;
        setData(d);
        setFilteredData(d);

        const keys = Object.keys(d[0]).filter((k) => k !== "number");
        setAllKeys(keys);

        const initFilter = {};
        const initOptions = {};
        keys.forEach((key) => {
          initFilter[key] = [];
          const values = Array.from(new Set(d.map((row) => row[key])))
            .map((val) => ({ value: val, label: val }))
            .sort((a, b) => a.label.localeCompare(b.label));
          initOptions[key] = values;
        });
        setFilters(initFilter);
        setDropdownOptions(initOptions);
      });
  }, []);

  // Apply filters with current filters and mod filters
  const applyFilters = (selectedFilters, remainders = modRemainders, base = modBase) => {
    let filtered = data;

    filtered = filtered.filter((row) =>
      Object.entries(selectedFilters).every(([col, values]) =>
        values.length === 0 || values.includes(String(row[col]))
      )
    );

    if (base && remainders.length > 0) {
      filtered = filtered.filter((row) =>
        remainders.includes(String(row.number % base))
      );
    }

    setFilteredData(filtered);

    // Update dropdown options dynamically based on filtered data
    const newOptions = {};
    allKeys.forEach((key) => {
      const subFiltered = data.filter((row) =>
        Object.entries(selectedFilters).every(([col, values]) =>
          col === key || values.length === 0 || values.includes(String(row[col]))
        )
      );
      const values = Array.from(new Set(subFiltered.map((r) => r[key])))
        .map((val) => ({ value: val, label: val }))
        .sort((a, b) => a.label.localeCompare(b.label));
      newOptions[key] = values;
    });
    setDropdownOptions(newOptions);
  };

  // Handle changes in filters dropdowns
  const handleSelectChange = (selectedOptions, key) => {
    const updated = {
      ...filters,
      [key]: selectedOptions ? selectedOptions.map((v) => v.value) : [],
    };
    setFilters(updated);
    applyFilters(updated, modRemainders, modBase);
  };

  // Async loader for remainder options with filtering and limit
  const loadRemainderOptions = (inputValue, callback) => {
    if (!modBase) {
      callback([]);
      return;
    }
    const maxOptions = 100; // Limit number of options to 100 for performance
    const filtered = [];
    for (let i = 0; i < modBase; i++) {
      const val = String(i);
      if (!inputValue || val.includes(inputValue)) {
        filtered.push({ value: val, label: val });
        if (filtered.length >= maxOptions) break;
      }
    }
    callback(filtered);
  };

  const columns = useMemo(() => {
    const baseCols = [
      {
        name: "Number",
        selector: (row) => row.number,
        sortable: true,
      },
    ];
    allKeys.forEach((key) => {
      baseCols.push({
        name: key,
        selector: (row) => row[key],
        sortable: true,
      });
    });
    return baseCols;
  }, [allKeys]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Filter Dashboard</h1>

      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block text-sm mb-1 text-white">Modulo Base</label>
          <input
            type="number"
            min={1}
            value={modBase}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val > 0) {
                setModBase(val);
                setModRemainders([]);
                applyFilters(filters, [], val);
              } else {
                setModBase("");
                setModRemainders([]);
                applyFilters(filters, [], "");
              }
            }}
            className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white w-32"
          />
        </div>

        {modBase && (
          <div className="w-48">
            <label className="block text-sm mb-1 text-white">Remainders</label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadRemainderOptions}
              value={modRemainders.map((v) => ({ value: v, label: v }))}
              onChange={(selected) => {
                const updated = selected ? selected.map((v) => v.value) : [];
                setModRemainders(updated);
                applyFilters(filters, updated, modBase);
              }}
              isMulti
              placeholder="Select remainders"
              className="rounded text-black"
              closeMenuOnSelect={false}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {allKeys.map((key) => (
          <div key={key} className="w-48">
            <Select
              options={dropdownOptions[key] || []}
              value={(filters[key] || []).map((v) => ({ value: v, label: v }))}
              onChange={(selected) => handleSelectChange(selected, key)}
              isMulti
              placeholder={`Filter by ${key}`}
              className="rounded text-black"
              closeMenuOnSelect={false}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
        ))}
      </div>

      <div className="max-h-[500px] overflow-y-scroll mb-6 rounded border border-gray-700">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationPerPage={100}
          paginationRowsPerPageOptions={[100]}
          highlightOnHover
          fixedHeader
          persistTableHead
        />
      </div>
    </div>
  );
};

export default App;
