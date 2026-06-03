export default function DataTable({ columns, rows, empty = "No data yet." }) {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead className="bg-zinc-50"><tr>{columns.map((col) => <th className="th" key={col.key}>{col.label}</th>)}</tr></thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.length === 0 ? <tr><td className="td" colSpan={columns.length}>{empty}</td></tr> : rows.map((row) => (
              <tr key={row.id || row.order_number}>{columns.map((col) => <td className="td" key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
