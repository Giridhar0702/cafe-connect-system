const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const fileMap = {
  'App.tsx': 'app/App.tsx',
  'main.tsx': 'app/main.tsx',
  'index.css': 'styles/globals.css',
  'App.css': 'styles/App.css',
  'components/Navbar.tsx': 'components/layout/Navbar/Navbar.tsx',
  'components/admin/AdminLayout.tsx': 'components/layout/Sidebar/AdminLayout.tsx',
  'context/StoreContext.tsx': 'store/StoreContext.tsx',
  'data/mockData.ts': 'mocks/mockData.ts',
  'types/index.ts': 'types/index.ts',
  'pages/About.tsx': 'pages/About/About.tsx',
  'pages/Cart.tsx': 'pages/Cart/CartPage.tsx',
  'pages/Checkout.tsx': 'pages/Checkout/CheckoutPage.tsx',
  'pages/FoodDetails.tsx': 'pages/FoodDetails/FoodDetails.tsx',
  'pages/Home.tsx': 'pages/Home/Home.tsx',
  'pages/Menu.tsx': 'pages/Restaurants/Menu.tsx',
  'pages/Offers.tsx': 'pages/Offers/OffersPage.tsx',
  'pages/Orders.tsx': 'pages/Orders/OrdersPage.tsx',
  'pages/OrderSuccess.tsx': 'pages/Orders/OrderSuccess.tsx',
  'pages/OrderTracking.tsx': 'pages/Orders/OrderTracking.tsx',
  'pages/Profile.tsx': 'pages/Profile/ProfilePage.tsx',
  'pages/admin/AddFood.tsx': 'pages/Admin/AddFood.tsx',
  'pages/admin/Dashboard.tsx': 'pages/Admin/Dashboard.tsx',
  'pages/admin/EditFood.tsx': 'pages/Admin/EditFood.tsx',
  'pages/admin/FoodManagement.tsx': 'pages/Admin/FoodManagement.tsx',
  'pages/admin/OffersManagement.tsx': 'pages/Admin/OffersManagement.tsx',
  'pages/admin/OrdersManagement.tsx': 'pages/Admin/OrdersManagement.tsx',
};

// Full paths mapping
const fullFileMap = {};
for (const [oldP, newP] of Object.entries(fileMap)) {
  fullFileMap[oldP] = newP;
}

// Read old files
const filesContent = {};
for (const oldP of Object.keys(fullFileMap)) {
  const fullOldPath = path.join(srcDir, oldP);
  if (fs.existsSync(fullOldPath)) {
    filesContent[oldP] = fs.readFileSync(fullOldPath, 'utf8');
  } else {
    console.warn('File not found:', fullOldPath);
  }
}

// Helper to get relative path
function getRelativeImportPath(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile);
  rel = rel.replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  // Strip extension
  rel = rel.replace(/\.tsx?$/, '');
  rel = rel.replace(/\.ts?$/, '');
  return rel;
}

function getRelativeImportPathAsset(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile);
  rel = rel.replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  return rel;
}

for (const [oldP, content] of Object.entries(filesContent)) {
  let newContent = content;
  const newP = fullFileMap[oldP];
  
  // Replace standard imports
  const importRegex = /(import|export)\s+(?:([^'"]*?)\s+from\s+)?['"]([^'"]+)['"]/g;
  newContent = newContent.replace(importRegex, (match, imp, before, importPath) => {
    if (!importPath.startsWith('.')) return match;
    
    // Resolve old import path
    const oldDir = path.dirname(path.join(srcDir, oldP));
    const resolvedOldExt = path.resolve(oldDir, importPath);
    
    let targetOldP = null;
    let isAssetOrCss = false;
    
    for (const p of Object.keys(fullFileMap)) {
      const fullP = path.join(srcDir, p);
      if (p.endsWith('.css') || p.endsWith('.png') || p.endsWith('.svg')) {
        if (fullP === resolvedOldExt || fullP === resolvedOldExt + '.css') {
          targetOldP = p;
          isAssetOrCss = true;
          break;
        }
      } else {
        if (
          fullP === resolvedOldExt || 
          fullP === resolvedOldExt + '.ts' || 
          fullP === resolvedOldExt + '.tsx' || 
          fullP === resolvedOldExt + '/index.ts' ||
          fullP === resolvedOldExt + '/index.tsx'
        ) {
          targetOldP = p;
          break;
        }
      }
    }
    
    if (targetOldP) {
      const targetNewP = fullFileMap[targetOldP];
      const newImportStr = isAssetOrCss 
          ? getRelativeImportPathAsset(newP, targetNewP)
          : getRelativeImportPath(newP, targetNewP);
          
      if (before) {
        return `${imp} ${before} from '${newImportStr}'`;
      } else {
        return `${imp} '${newImportStr}'`;
      }
    }
    
    return match;
  });

  filesContent[oldP] = newContent;
}

// Move files and write
for (const [oldP, content] of Object.entries(filesContent)) {
  const newP = fullFileMap[oldP];
  const oldFullPath = path.join(srcDir, oldP);
  const newFullPath = path.join(srcDir, newP);
  
  fs.mkdirSync(path.dirname(newFullPath), { recursive: true });
  fs.writeFileSync(newFullPath, content, 'utf8');
  
  if (oldFullPath !== newFullPath) {
    fs.unlinkSync(oldFullPath);
  }
}

console.log('Successfully migrated structure.');
