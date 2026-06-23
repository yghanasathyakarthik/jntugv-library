const fs = require('fs');
const path = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Move useEffect. We will remove it from the top and insert it after fetchRecommendations.
const useEffectRegex = /useEffect\(\(\) => \{[\s\S]*?\}, \[user\?\.id\]\);/;
const useEffectMatch = content.match(useEffectRegex);
if (useEffectMatch) {
  content = content.replace(useEffectRegex, '');
  const fetchRecRegex = /const fetchRecommendations = async \(\) => \{[\s\S]*?\};/;
  content = content.replace(fetchRecRegex, (match) => match + '\n\n  ' + useEffectMatch[0]);
}

// 2. Add missing functions & fix handleReserve -> handleReserveBook
content = content.replace('const handleReserve = async', 'const handleReserveBook = async');

const missingFunctions = `
  const handleSearch = async (e) => {
    e?.preventDefault();
    fetchBooksData();
  };

  const handleCameraScan = (data) => {
    if (data && data.text) {
       setSearchTerm(data.text);
       setActiveTab('search');
       fetchBooksData();
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.put(\`/api/notifications/\${id}/read\`);
      fetchNotifications();
    } catch(err) { console.error(err); }
  };

  const handlePhotoUpload = async (e) => {
    // dummy photo upload
  };
`;
// Insert missing functions before submitAppeal
content = content.replace('const submitAppeal =', missingFunctions + '\n  const submitAppeal =');

// 3. Fix Sidebar and TopBar to be render functions to avoid React component-in-render issues
content = content.replace('const Sidebar = () => (', 'const renderSidebar = () => (');
content = content.replace('const TopBar = () => (', 'const renderTopBar = () => (');
content = content.replace('<Sidebar />', '{renderSidebar()}');
content = content.replace('<TopBar />', '{renderTopBar()}');

fs.writeFileSync(path, content);
console.log('Fixed');
