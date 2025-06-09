# 🧮 Filter Dashboard

A dynamic React-based dashboard that loads CSV data, allows multi-criteria filtering (including custom modulo filtering), and displays the results in a paginated data table. Built for scalability and responsiveness.

## 🚀 Features

- 📄 Load CSV dataset dynamically
- 🧠 Intelligent dropdown filters for each column
- ➗ Custom modulo filter for numerical operations
- 🔢 Supports large datasets with optimized rendering
- 📊 Paginated and sortable data table
- 🎨 Responsive dark-themed UI

## 🖥️ Tech Stack

- [React](https://reactjs.org/)
- [PapaParse](https://www.papaparse.com/) – CSV parsing
- [react-select](https://react-select.com/) – for filter dropdowns
- [react-data-table-component](https://www.npmjs.com/package/react-data-table-component) – for rendering data tables
- Tailwind CSS – for styling

## 🧪 Usage

* Each column is filterable with multi-select dropdowns.
* Enter a modulo base (e.g., 5), then select remainders to filter numeric data based on `number % base`.
* Data updates dynamically based on selected filters.

