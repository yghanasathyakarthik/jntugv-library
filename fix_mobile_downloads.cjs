const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'frontend/src/pages/AdminPortal.jsx'),
  path.join(__dirname, 'frontend/src/pages/LibrarianPortal.jsx')
];

const newHandleExportCSV = `  const handleExportCSV = async () => {
    if (!stats) return;
    const csvContent = "Metric,Value\\n" 
        + \`Total Books,\${stats.totalBooks}\\n\`
        + \`Available,\${stats.availableBooks}\\n\`
        + \`Issued,\${stats.issuedBooks}\\n\`
        + \`Missing,\${stats.missingBooks}\\n\`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = "library_analytics_report.csv";

    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'text/csv' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Analytics Report' });
          return;
        } catch (err) {
          console.log('Share canceled', err);
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
  };`;

const newHandleExportStudentsReportEnd = `    const filename = \`Students_Library_\${timeframe.toUpperCase()}_Master_Report.csv\`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'text/csv' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Student Report' });
          return;
        } catch (err) {
          console.log('Share canceled', err);
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
  };`;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace handleExportCSV
  const csvRegex = /const handleExportCSV = \(\) => \{[\s\S]*?document\.body\.removeChild\(link\);\s*\};/m;
  content = content.replace(csvRegex, newHandleExportCSV);

  // Replace handleExportStudentsReport declaration
  content = content.replace(/const handleExportStudentsReport = \(timeframe = 'weekly'\) => \{/g, "const handleExportStudentsReport = async (timeframe = 'weekly') => {");

  // Replace handleExportStudentsReport ending
  const stuEndRegex = /const blob = new Blob\(\[csv\].*?\n\s*const url = URL\.createObjectURL\(blob\);[\s\S]*?document\.body\.removeChild\(link\);\s*\};/m;
  content = content.replace(stuEndRegex, newHandleExportStudentsReportEnd);

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
