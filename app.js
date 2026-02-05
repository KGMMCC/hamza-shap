import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  push, 
  onValue, 
  update, 
  remove, 
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyAMH0BLHuBCVzT_veCPZEBSTS6eXyKUW44",
  authDomain: "hamza-shop-aa122.firebaseapp.com",
  databaseURL: "https://hamza-shop-aa122-default-rtdb.firebaseio.com",
  projectId: "hamza-shop-aa122",
  storageBucket: "hamza-shop-aa122.firebasestorage.app",
  messagingSenderId: "1044449319046",
  appId: "1:1044449319046:web:71d3e6f798148affde9907"
};

// Firebase ইনিশিয়ালাইজ
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ডম এলিমেন্ট রেফারেন্স
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const userEmail = document.getElementById('userEmail');
const currentDate = document.getElementById('currentDate');
const dailySales = document.getElementById('dailySales');
const totalOrders = document.getElementById('totalOrders');
const todayTotalSales = document.getElementById('todayTotalSales');
const todayTotalOrders = document.getElementById('todayTotalOrders');
const mostPopularItem = document.getElementById('mostPopularItem');
const averageBill = document.getElementById('averageBill');

// মডাল এলিমেন্ট
const modalOverlay = document.getElementById('modalOverlay');
const addItemModal = document.getElementById('addItemModal');
const addDueModal = document.getElementById('addDueModal');
const editPriceModal = document.getElementById('editPriceModal');
const quantityModal = document.getElementById('quantityModal');
const modalCloseButtons = document.querySelectorAll('.modal-close');

// বাটন এলিমেন্ট
const newOrderBtn = document.getElementById('newOrderBtn');
const quickSellBtn = document.getElementById('quickSellBtn');
const addCustomItemBtn = document.getElementById('addCustomItemBtn');
const generateReportBtn = document.getElementById('generateReportBtn');
const clearOrderBtn = document.getElementById('clearOrderBtn');
const saveOrderBtn = document.getElementById('saveOrderBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const refreshItemsBtn = document.getElementById('refreshItemsBtn');
const addDueBtn = document.getElementById('addDueBtn');

// ফর্ম এলিমেন্ট
const modalItemName = document.getElementById('modalItemName');
const modalItemPrice = document.getElementById('modalItemPrice');
const modalItemCategory = document.getElementById('modalItemCategory');
const modalItemDescription = document.getElementById('modalItemDescription');
const modalDueName = document.getElementById('modalDueName');
const modalDueItems = document.getElementById('modalDueItems');
const modalDueAmount = document.getElementById('modalDueAmount');
const modalDueDate = document.getElementById('modalDueDate');
const editItemName = document.getElementById('editItemName');
const editCurrentPrice = document.getElementById('editCurrentPrice');
const editNewPrice = document.getElementById('editNewPrice');
const editPriceReason = document.getElementById('editPriceReason');

// পরিমাণ মডাল এলিমেন্ট
const quantityItemName = document.getElementById('quantityItemName');
const quantityItemPrice = document.getElementById('quantityItemPrice');
const itemQuantity = document.getElementById('itemQuantity');
const quantityTotalPrice = document.getElementById('quantityTotalPrice');
const decreaseQuantity = document.getElementById('decreaseQuantity');
const increaseQuantity = document.getElementById('increaseQuantity');
const cancelQuantityBtn = document.getElementById('cancelQuantityBtn');
const addToOrderBtn = document.getElementById('addToOrderBtn');

// অর্ডার এলিমেন্ট
const currentOrderItems = document.getElementById('currentOrderItems');
const orderTotalAmount = document.getElementById('orderTotalAmount');
const checkoutTotal = document.getElementById('checkoutTotal');
const noOrderMessage = document.getElementById('noOrderMessage');

// মেনু এলিমেন্ট
const quickItemsGrid = document.getElementById('quickItemsGrid');
const menuItemsGrid = document.getElementById('menuItemsGrid');
const dueListContainer = document.getElementById('dueListContainer');
const noMenuMessage = document.getElementById('noMenuMessage');
const noDueMessage = document.getElementById('noDueMessage');
const searchMenu = document.getElementById('searchMenu');
const categoryButtons = document.querySelectorAll('.category-btn');

// মডাল বাটন
const cancelAddItemBtn = document.getElementById('cancelAddItemBtn');
const saveItemBtn = document.getElementById('saveItemBtn');
const cancelDueBtn = document.getElementById('cancelDueBtn');
const saveDueBtn = document.getElementById('saveDueBtn');
const cancelEditPriceBtn = document.getElementById('cancelEditPriceBtn');
const saveNewPriceBtn = document.getElementById('saveNewPriceBtn');

// ভেরিয়েবল
let currentUser = null;
let currentOrder = [];
let menuItems = [];
let dues = [];
let selectedItemForQuantity = null;
let selectedItemForEdit = null;
let selectedCategory = 'all';
let searchTerm = '';

// প্রি-ডিফাইন্ড আইটেম (আপনার দেওয়া আইটেম)
const predefinedItems = [
  { name: "তেহারি", price: 60, category: "বিরিয়ানি", description: "স্পেশাল তেহারি" },
  { name: "সাদা ভাত প্লেট", price: 20, category: "ভাত", description: "সাদা ভাত" },
  { name: "ডিম ভাজা", price: 20, category: "ডিম", description: "ডিম ভাজা" },
  { name: "ডিম সিদ্ধ", price: 20, category: "ডিম", description: "ডিম সিদ্ধ" },
  { name: "মুরগি মাংস প্লেট", price: 20, category: "মাংস", description: "মুরগি মাংস" },
  { name: "আলু ভর্তা পিস", price: 10, category: "অন্যান্য", description: "আলু ভর্তা" },
  { name: "ডাল এক বাটি", price: 10, category: "ডাল", description: "ডাল" },
  { name: "ফালুদা গ্লাস", price: 50, category: "পানীয়", description: "ফালুদা" },
  { name: "কোল ড্রিঙ্ক ২০", price: 20, category: "পানীয়", description: "কোল ড্রিঙ্ক" },
  { name: "কোল ড্রিঙ্ক ২৫", price: 25, category: "পানীয়", description: "বড় কোল ড্রিঙ্ক" },
  { name: "মিনারেল ওয়াটার", price: 15, category: "পানীয়", description: "মিনারেল ওয়াটার" }
];

// তারিখ আপডেট
function updateDate() {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  currentDate.textContent = now.toLocaleDateString('bn-BD', options);
  
  // তারিখ ইনপুট সেট করুন
  const today = now.toISOString().split('T')[0];
  if (modalDueDate) {
    modalDueDate.value = today;
    modalDueDate.max = today;
  }
}

// নোটিফিকেশন প্রদর্শন
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    ${message}
  `;
  notification.className = `notification ${type} show`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// স্ক্রিন পরিবর্তন
function switchScreen(screen) {
  if (screen === 'login') {
    loginScreen.classList.add('active');
    dashboardScreen.classList.remove('active');
  } else if (screen === 'dashboard') {
    loginScreen.classList.remove('active');
    dashboardScreen.classList.add('active');
    updateDate();
    loadInitialData();
  }
}

// মডাল প্রদর্শন
function showModal(modalId) {
  modalOverlay.classList.add('active');
  document.getElementById(modalId).style.display = 'block';
  
  // অন্যান্য মডাল লুকান
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (modal.id !== modalId) {
      modal.style.display = 'none';
    }
  });
}

// মডাল লুকান
function hideModal() {
  modalOverlay.classList.remove('active');
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
}

// অথেন্টিকেশন স্টেট ট্র্যাক
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    userEmail.textContent = user.email;
    switchScreen('dashboard');
    
    // প্রথমবারের জন্য প্রি-ডিফাইন্ড আইটেম যোগ করুন
    initializePredefinedItems();
  } else {
    currentUser = null;
    switchScreen('login');
  }
});

// লগইন ফাংশন
loginBtn.addEventListener('click', async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  
  if (!email || !password) {
    showNotification('ইমেইল এবং পাসওয়ার্ড পূরণ করুন', 'error');
    return;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showNotification('লগইন সফল!', 'success');
  } catch (error) {
    showNotification('লগইন ব্যর্থ: ' + error.message, 'error');
  }
});

// সাইনআপ ফাংশন
signupBtn.addEventListener('click', async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  
  if (!email || !password) {
    showNotification('ইমেইল এবং পাসওয়ার্ড পূরণ করুন', 'error');
    return;
  }
  
  if (password.length < 6) {
    showNotification('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', 'error');
    return;
  }
  
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showNotification('অ্যাকাউন্ট তৈরি সফল!', 'success');
  } catch (error) {
    showNotification('সাইনআপ ব্যর্থ: ' + error.message, 'error');
  }
});

// লগআউট ফাংশন
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    showNotification('লগআউট সফল!', 'info');
  } catch (error) {
    showNotification('লগআউট ব্যর্থ: ' + error.message, 'error');
  }
});

// প্রি-ডিফাইন্ড আইটেম ইনিশিয়ালাইজ
function initializePredefinedItems() {
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  const userItemsRef = ref(db, `users/${userId}/menuItems`);
  
  get(userItemsRef).then((snapshot) => {
    if (!snapshot.exists() || snapshot.size === 0) {
      // প্রি-ডিফাইন্ড আইটেম যোগ করুন
      predefinedItems.forEach(item => {
        push(userItemsRef, {
          ...item,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          isActive: true
        });
      });
      
      showNotification('প্রি-ডিফাইন্ড আইটেম যোগ করা হয়েছে!', 'success');
    }
  });
}

// প্রাথমিক ডেটা লোড
function loadInitialData() {
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  
  // মেনু আইটেম লোড
  loadMenuItems();
  
  // পাওনা লোড
  loadDues();
  
  // আজকের বিক্রির সারাংশ লোড
  loadTodaySalesSummary();
  
  // দ্রুত বিক্রির আইটেম লোড
  loadQuickSellItems();
}

// মেনু আইটেম লোড
function loadMenuItems() {
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  const userItemsRef = ref(db, `users/${userId}/menuItems`);
  
  onValue(userItemsRef, (snapshot) => {
    menuItems = [];
    menuItemsGrid.innerHTML = '';
    quickItemsGrid.innerHTML = '';
    
    if (!snapshot.exists()) {
      noMenuMessage.style.display = 'block';
      return;
    }
    
    noMenuMessage.style.display = 'none';
    
    snapshot.forEach(item => {
      const data = item.val();
      data.key = item.key;
      menuItems.push(data);
      
      // ফিল্টার অনুসারে আইটেম দেখান
      if (filterMenuItem(data)) {
        renderMenuItem(data);
      }
      
      // দ্রুত বিক্রির জন্য প্রথম ৮টি আইটেম
      if (menuItems.length <= 8) {
        renderQuickItem(data);
      }
    });
  });
}

// মেনু আইটেম ফিল্টার
function filterMenuItem(item) {
  // ক্যাটাগরি ফিল্টার
  if (selectedCategory !== 'all' && item.category !== selectedCategory) {
    return false;
  }
  
  // সার্চ ফিল্টার
  if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      !item.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
    return false;
  }
  
  return true;
}

// মেনু আইটেম রেন্ডার
function renderMenuItem(item) {
  const menuItem = document.createElement('div');
  menuItem.className = 'menu-item';
  menuItem.dataset.key = item.key;
  
  menuItem.innerHTML = `
    <div class="menu-item-header">
      <h4>${item.name}</h4>
      <div class="item-actions">
        <button class="item-action-btn edit-price-btn" title="দাম পরিবর্তন">
          <i class="fas fa-edit"></i>
        </button>
        <button class="item-action-btn toggle-item-btn" title="${item.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}">
          <i class="fas fa-${item.isActive ? 'eye-slash' : 'eye'}"></i>
        </button>
      </div>
    </div>
    <div class="menu-item-price">৳${item.price}</div>
    <div class="menu-item-category">${item.category}</div>
    ${item.description ? `<p class="menu-item-description">${item.description}</p>` : ''}
    <button class="btn btn-primary add-to-order-btn" style="width:100%; margin-top:10px;">
      <i class="fas fa-cart-plus"></i> অর্ডারে যোগ করুন
    </button>
  `;
  
  menuItemsGrid.appendChild(menuItem);
  
  // অর্ডারে যোগ করার ইভেন্ট
  const addBtn = menuItem.querySelector('.add-to-order-btn');
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedItemForQuantity = item;
    showQuantityModal(item);
  });
  
  // দাম এডিট করার ইভেন্ট
  const editBtn = menuItem.querySelector('.edit-price-btn');
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedItemForEdit = item;
    showEditPriceModal(item);
  });
  
  // আইটেম টগল করার ইভেন্ট
  const toggleBtn = menuItem.querySelector('.toggle-item-btn');
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenuItem(item);
  });
}

// দ্রুত বিক্রির আইটেম রেন্ডার
function renderQuickItem(item) {
  if (!item.isActive) return;
  
  const quickItem = document.createElement('div');
  quickItem.className = 'quick-item';
  quickItem.dataset.key = item.key;
  
  quickItem.innerHTML = `
    <h4>${item.name}</h4>
    <div class="item-price">৳${item.price}</div>
  `;
  
  quickItemsGrid.appendChild(quickItem);
  
  // ক্লিক ইভেন্ট
  quickItem.addEventListener('click', () => {
    selectedItemForQuantity = item;
    showQuantityModal(item);
  });
}

// দ্রুত বিক্রির আইটেম লোড
function loadQuickSellItems() {
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  const salesRef = ref(db, `users/${userId}/sales`);
  
  // আজকের বিক্রি থেকে সবচেয়ে জনপ্রিয় আইটেম খুঁজুন
  const today = new Date().toISOString().split('T')[0];
  const todaySalesRef = ref(db, `users/${userId}/sales/${today}`);
  
  get(todaySalesRef).then((snapshot) => {
    if (snapshot.exists()) {
      const itemCounts = {};
      
      snapshot.forEach(order => {
        const orderData = order.val();
        if (orderData.items) {
          orderData.items.forEach(item => {
            if (itemCounts[item.name]) {
              itemCounts[item.name] += item.quantity;
            } else {
              itemCounts[item.name] = item.quantity;
            }
          });
        }
      });
      
      // সবচেয়ে জনপ্রিয় আইটেম খুঁজুন
      let mostPopular = '';
      let maxCount = 0;
      
      for (const [itemName, count] of Object.entries(itemCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostPopular = itemName;
        }
      }
      
      if (mostPopular) {
        mostPopularItem.textContent = mostPopular;
      }
    }
  });
}

// পাওনা লোড
function loadDues() {
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  const userDueRef = ref(db, `users/${userId}/dues`);
  
  onValue(userDueRef, (snapshot) => {
    dues = [];
    dueListContainer.innerHTML = '';
    
    if (!snapshot.exists()) {
      noDueMessage.style.display = 'block';
      return;
    }
    
    noDueMessage.style.display = 'none';
    let totalDueAmount = 0;
    let unpaidCount = 0;
    
    snapshot.forEach(item => {
      const data = item.val();
      data.key = item.key;
      dues.push(data);
      
      if (!data.paid) {
        totalDueAmount += data.amount || 0;
        unpaidCount++;
      }
      
      renderDueItem(data);
    });
    
    // টোটাল পাওনা আপডেট
    const dueSummary = document.querySelector('.due-summary');
    if (!dueSummary) {
      const dueHeader = document.querySelector('.card-header h2');
      if (dueHeader) {
        dueHeader.innerHTML += ` <span class="due-summary">(${unpaidCount}টি অপরিশোধিত)</span>`;
      }
    }
  });
}

// পাওনা আইটেম রেন্ডার
function renderDueItem(due) {
  const dueItem = document.createElement('div');
  dueItem.className = 'due-item';
  
  const dueDate = due.date ? new Date(due.date).toLocaleDateString('bn-BD') : 'তারিখ নেই';
  
  dueItem.innerHTML = `
    <div class="due-info">
      <h4>${due.name}</h4>
      <p>${due.item}</p>
      <span class="due-date">${dueDate}</span>
    </div>
    <div>
      <div class="due-amount">৳${due.amount}</div>
      <div class="due-status ${due.paid ? 'paid' : 'unpaid'}">
        ${due.paid ? 'পরিশোধিত' : 'অপরিশোধিত'}
      </div>
    </div>
  `;
  
  dueListContainer.appendChild(dueItem);
}

// আজকের বিক্রির সারাংশ লোড
function loadTodaySalesSummary() {
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  const today = new Date().toISOString().split('T')[0];
  const todaySalesRef = ref(db, `users/${userId}/sales/${today}`);
  
  onValue(todaySalesRef, (snapshot) => {
    let totalSales = 0;
    let totalOrdersCount = 0;
    let totalItemsSold = 0;
    
    if (snapshot.exists()) {
      snapshot.forEach(order => {
        const orderData = order.val();
        totalOrdersCount++;
        totalSales += orderData.total || 0;
        
        if (orderData.items) {
          totalItemsSold += orderData.items.reduce((sum, item) => sum + item.quantity, 0);
        }
      });
    }
    
    // ড্যাশবোর্ড আপডেট
    dailySales.textContent = `৳ ${totalSales}`;
    totalOrders.textContent = totalOrdersCount;
    todayTotalSales.textContent = `৳ ${totalSales}`;
    todayTotalOrders.textContent = totalOrdersCount;
    
    const avgBill = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;
    averageBill.textContent = `৳ ${avgBill}`;
    
    // অর্ডার কাউন্টার আপডেট
    updateOrderCounter();
  });
}

// অর্ডার কাউন্টার আপডেট
function updateOrderCounter() {
  const today = new Date().toLocaleDateString('bn-BD');
  const orderCounter = currentOrder.reduce((sum, item) => sum + item.quantity, 0);
  
  if (orderCounter > 0) {
    document.querySelector('.header-stats').innerHTML = `
      <div class="stat-item">
        <i class="fas fa-money-bill-wave"></i>
        <span id="dailySales">${dailySales.textContent}</span>
      </div>
      <div class="stat-item">
        <i class="fas fa-shopping-cart"></i>
        <span id="totalOrders">${totalOrders.textContent}</span>
      </div>
      <div class="stat-item current-order">
        <i class="fas fa-list"></i>
        <span>অর্ডার: ${orderCounter}টি</span>
      </div>
    `;
  }
}

// পরিমাণ মডাল প্রদর্শন
function showQuantityModal(item) {
  selectedItemForQuantity = item;
  quantityItemName.textContent = item.name;
  quantityItemPrice.textContent = `৳${item.price}`;
  itemQuantity.value = 1;
  updateQuantityTotal();
  
  showModal('quantityModal');
}

// পরিমাণ মডালে টোটাল আপডেট
function updateQuantityTotal() {
  if (!selectedItemForQuantity) return;
  
  const quantity = parseInt(itemQuantity.value) || 1;
  const total = selectedItemForQuantity.price * quantity;
  quantityTotalPrice.textContent = `৳${total}`;
}

// অর্ডার আপডেট
function updateOrder() {
  currentOrderItems.innerHTML = '';
  
  if (currentOrder.length === 0) {
    noOrderMessage.style.display = 'block';
    orderTotalAmount.textContent = '৳ 0';
    checkoutTotal.textContent = '0';
    return;
  }
  
  noOrderMessage.style.display = 'none';
  
  let total = 0;
  
  currentOrder.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <strong>${item.name}</strong><br>
        <small>${item.category}</small>
      </td>
      <td>
        <div class="quantity-control">
          <button class="quantity-change-btn" data-index="${index}" data-change="-1">-</button>
          <span class="item-quantity">${item.quantity}</span>
          <button class="quantity-change-btn" data-index="${index}" data-change="1">+</button>
        </div>
      </td>
      <td>৳${item.price}</td>
      <td>৳${itemTotal}</td>
      <td>
        <button class="btn-icon remove-item-btn" data-index="${index}" title="মুছুন">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    currentOrderItems.appendChild(row);
  });
  
  orderTotalAmount.textContent = `৳ ${total}`;
  checkoutTotal.textContent = total;
  
  // কাউন্টার আপডেট
  updateOrderCounter();
  
  // ইভেন্ট লিসেনার যোগ করুন
  document.querySelectorAll('.quantity-change-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      const change = parseInt(e.target.dataset.change);
      updateOrderItemQuantity(index, change);
    });
  });
  
  document.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      removeOrderItem(index);
    });
  });
}

// অর্ডার আইটেম পরিমাণ আপডেট
function updateOrderItemQuantity(index, change) {
  if (index < 0 || index >= currentOrder.length) return;
  
  currentOrder[index].quantity += change;
  
  if (currentOrder[index].quantity <= 0) {
    currentOrder.splice(index, 1);
  }
  
  updateOrder();
}

// অর্ডার আইটেম মুছুন
function removeOrderItem(index) {
  if (index < 0 || index >= currentOrder.length) return;
  
  currentOrder.splice(index, 1);
  updateOrder();
}

// দাম এডিট মডাল প্রদর্শন
function showEditPriceModal(item) {
  selectedItemForEdit = item;
  editItemName.value = item.name;
  editCurrentPrice.value = `৳${item.price}`;
  editNewPrice.value = item.price;
  editPriceReason.value = '';
  
  showModal('editPriceModal');
}

// আইটেম টগল (সক্রিয়/নিষ্ক্রিয়)
function toggleMenuItem(item) {
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  const itemRef = ref(db, `users/${userId}/menuItems/${item.key}`);
  
  update(itemRef, {
    isActive: !item.isActive,
    lastUpdated: new Date().toISOString()
  }).then(() => {
    showNotification(`আইটেম ${!item.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`, 'success');
  });
}

// চেকআউট সম্পন্ন করুন
function completeCheckout() {
  if (currentOrder.length === 0) {
    showNotification('অর্ডার খালি', 'error');
    return;
  }
  
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString('bn-BD', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const orderData = {
    items: currentOrder.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category
    })),
    total: total,
    time: time,
    timestamp: new Date().toISOString()
  };
  
  const salesRef = ref(db, `users/${userId}/sales/${today}`);
  push(salesRef, orderData).then(() => {
    // বিক্রি হওয়া আইটেমের কাউন্ট আপডেট করুন
    updateItemSoldCounts();
    
    // অর্ডার রিসেট করুন
    currentOrder = [];
    updateOrder();
    
    showNotification(`বিক্রি সম্পন্ন! মোট: ৳${total}`, 'success');
    
    // বিল প্রিন্ট করার অপশন দিন
    if (confirm('বিল প্রিন্ট করতে চান?')) {
      printBill(orderData);
    }
  });
}

// আইটেমের বিক্রি কাউন্ট আপডেট
function updateItemSoldCounts() {
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  
  currentOrder.forEach(item => {
    // আইটেম খুঁজুন
    const itemIndex = menuItems.findIndex(menuItem => menuItem.name === item.name);
    if (itemIndex !== -1) {
      const menuItem = menuItems[itemIndex];
      const itemRef = ref(db, `users/${userId}/menuItems/${menuItem.key}`);
      
      const currentSold = menuItem.sold || 0;
      update(itemRef, {
        sold: currentSold + item.quantity,
        lastSold: new Date().toISOString()
      });
    }
  });
}

// বিল প্রিন্ট
function printBill(orderData) {
  let billContent = `
    <div style="font-family: 'Hind Siliguri', sans-serif; max-width: 300px; margin: 0 auto;">
      <h2 style="text-align: center; color: #e74c3c;">হামজার বিরিয়ানির দোকান</h2>
      <p style="text-align: center;">বিরিয়ানি ও তেহারির সেরা ঠিকানা</p>
      <hr>
      <p><strong>তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')}</p>
      <p><strong>সময়:</strong> ${orderData.time}</p>
      <hr>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #ddd;">আইটেম</th>
            <th style="text-align: right; border-bottom: 1px solid #ddd;">পরিমাণ</th>
            <th style="text-align: right; border-bottom: 1px solid #ddd;">মোট</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  orderData.items.forEach(item => {
    billContent += `
      <tr>
        <td>${item.name}</td>
        <td style="text-align: right;">${item.quantity} x ৳${item.price}</td>
        <td style="text-align: right;">৳${item.price * item.quantity}</td>
      </tr>
    `;
  });
  
  billContent += `
        </tbody>
      </table>
      <hr>
      <div style="text-align: right;">
        <h3>সর্বমোট: ৳${orderData.total}</h3>
      </div>
      <hr>
      <p style="text-align: center;">ধন্যবাদ! আবার আসবেন</p>
      <p style="text-align: center; font-size: 0.8em;">ফোন: ০১৭১২৩৪৫৬৭৮</p>
    </div>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>বিল - হামজার বিরিয়ানির দোকান</title>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${billContent}
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
            প্রিন্ট করুন
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            বন্ধ করুন
          </button>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// রিপোর্ট জেনারেট
function generateReport() {
  if (!currentUser) {
    showNotification('লগইন করুন প্রথমে', 'error');
    return;
  }
  
  showNotification('রিপোর্ট তৈরি করা হচ্ছে...', 'info');
  
  const userId = currentUser.uid;
  const itemsRef = ref(db, `users/${userId}/menuItems`);
  const duesRef = ref(db, `users/${userId}/dues`);
  
  // গত ৭ দিনের তারিখ তৈরি করুন
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // প্রতিটি দিনের বিক্রি ডেটা লোড করুন
  Promise.all([
    get(itemsRef),
    get(duesRef),
    ...dates.map(date => get(ref(db, `users/${userId}/sales/${date}`)))
  ]).then(results => {
    const itemsSnapshot = results[0];
    const duesSnapshot = results[1];
    const salesSnapshots = results.slice(2);
    
    let reportContent = 'হামজার বিরিয়ানির দোকান - বিক্রি রিপোর্ট\n';
    reportContent += '=========================================\n\n';
    reportContent += `রিপোর্ট তারিখ: ${new Date().toLocaleDateString('bn-BD')}\n`;
    reportContent += `রিপোর্ট সময়: ${new Date().toLocaleTimeString('bn-BD')}\n\n`;
    
    // আইটেম সারাংশ
    reportContent += 'আইটেম সারাংশ:\n';
    reportContent += '----------------\n';
    
    let totalItems = 0;
    let totalItemsSold = 0;
    let totalRevenue = 0;
    
    if (itemsSnapshot.exists()) {
      itemsSnapshot.forEach(item => {
        const data = item.val();
        totalItems++;
        totalItemsSold += data.sold || 0;
        totalRevenue += (data.price || 0) * (data.sold || 0);
        
        reportContent += `${data.name} - ৳${data.price} - ${data.sold || 0} বার - ৳${(data.price || 0) * (data.sold || 0)}\n`;
      });
    }
    
    reportContent += `\nমোট আইটেম: ${totalItems}\n`;
    reportContent += `মোট বিক্রি: ${totalItemsSold} বার\n`;
    reportContent += `মোট আয়: ৳${totalRevenue}\n\n`;
    
    // দৈনিক বিক্রি
    reportContent += 'দৈনিক বিক্রি (গত ৭ দিন):\n';
    reportContent += '-------------------------\n';
    
    let weeklyTotal = 0;
    let weeklyOrders = 0;
    
    dates.forEach((date, index) => {
      const salesData = salesSnapshots[index];
      let dayTotal = 0;
      let dayOrders = 0;
      
      if (salesData.exists()) {
        salesData.forEach(order => {
          const orderData = order.val();
          dayTotal += orderData.total || 0;
          dayOrders++;
        });
      }
      
      weeklyTotal += dayTotal;
      weeklyOrders += dayOrders;
      
      const dateFormatted = new Date(date).toLocaleDateString('bn-BD');
      reportContent += `${dateFormatted}: ৳${dayTotal} (${dayOrders} অর্ডার)\n`;
    });
    
    reportContent += `\nসাপ্তাহিক মোট: ৳${weeklyTotal}\n`;
    reportContent += `সাপ্তাহিক অর্ডার: ${weeklyOrders}\n`;
    reportContent += `গড় দৈনিক: ৳${Math.round(weeklyTotal / 7)}\n\n`;
    
    // পাওনা সারাংশ
    reportContent += 'পাওনা সারাংশ:\n';
    reportContent += '----------------\n';
    
    let totalDue = 0;
    let paidDue = 0;
    let unpaidDue = 0;
    
    if (duesSnapshot.exists()) {
      duesSnapshot.forEach(due => {
        const data = due.val();
        if (data.paid) {
          paidDue += data.amount || 0;
        } else {
          unpaidDue += data.amount || 0;
        }
        totalDue += data.amount || 0;
      });
    }
    
    reportContent += `মোট পাওনা: ৳${totalDue}\n`;
    reportContent += `পরিশোধিত: ৳${paidDue}\n`;
    reportContent += `অপরিশোধিত: ৳${unpaidDue}\n\n`;
    
    reportContent += '=========================================\n';
    reportContent += 'রিপোর্ট শেষ\n';
    
    // রিপোর্ট ডাউনলোড
    downloadReport(reportContent);
  });
}

// রিপোর্ট ডাউনলোড
function downloadReport(content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hamza-biryani-report-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('রিপোর্ট ডাউনলোড করা হয়েছে!', 'success');
}

// ইভেন্ট লিসেনার
// মডাল বন্ধ করার ইভেন্ট
modalCloseButtons.forEach(button => {
  button.addEventListener('click', hideModal);
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    hideModal();
  }
});

// ক্যাটাগরি বাটন ইভেন্ট
categoryButtons.forEach(button => {
  button.addEventListener('click', () => {
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    selectedCategory = button.dataset.category;
    loadMenuItems();
  });
});

// সার্চ ইভেন্ট
searchMenu.addEventListener('input', () => {
  searchTerm = searchMenu.value;
  loadMenuItems();
});

// পরিমাণ ইনপুট ইভেন্ট
decreaseQuantity.addEventListener('click', () => {
  const current = parseInt(itemQuantity.value) || 1;
  if (current > 1) {
    itemQuantity.value = current - 1;
    updateQuantityTotal();
  }
});

increaseQuantity.addEventListener('click', () => {
  const current = parseInt(itemQuantity.value) || 1;
  itemQuantity.value = current + 1;
  updateQuantityTotal();
});

itemQuantity.addEventListener('input', updateQuantityTotal);

// অর্ডারে যোগ করার ইভেন্ট
addToOrderBtn.addEventListener('click', () => {
  if (!selectedItemForQuantity) return;
  
  const quantity = parseInt(itemQuantity.value) || 1;
  
  // চেক করুন আইটেম আগে থেকে অর্ডারে আছে কিনা
  const existingIndex = currentOrder.findIndex(
    item => item.name === selectedItemForQuantity.name
  );
  
  if (existingIndex !== -1) {
    // পরিমাণ যোগ করুন
    currentOrder[existingIndex].quantity += quantity;
  } else {
    // নতুন আইটেম যোগ করুন
    currentOrder.push({
      ...selectedItemForQuantity,
      quantity: quantity
    });
  }
  
  updateOrder();
  hideModal();
  showNotification(`${selectedItemForQuantity.name} অর্ডারে যোগ করা হয়েছে`, 'success');
});

// নতুন আইটেম যোগ ইভেন্ট
addCustomItemBtn.addEventListener('click', () => {
  showModal('addItemModal');
  modalItemName.value = '';
  modalItemPrice.value = '';
  modalItemDescription.value = '';
  modalItemCategory.value = 'বিরিয়ানি';
});

// আইটেম সংরক্ষণ ইভেন্ট
saveItemBtn.addEventListener('click', () => {
  const name = modalItemName.value.trim();
  const price = parseFloat(modalItemPrice.value);
  const category = modalItemCategory.value;
  const description = modalItemDescription.value.trim();
  
  if (!name || !price) {
    showNotification('নাম এবং দাম পূরণ করুন', 'error');
    return;
  }
  
  if (price <= 0) {
    showNotification('দাম সঠিক নয়', 'error');
    return;
  }
  
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  const itemsRef = ref(db, `users/${userId}/menuItems`);
  
  push(itemsRef, {
    name: name,
    price: price,
    category: category,
    description: description || '',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    isActive: true,
    sold: 0
  }).then(() => {
    hideModal();
    showNotification(`${name} যোগ করা হয়েছে!`, 'success');
  });
});

// পাওনা যোগ ইভেন্ট
addDueBtn.addEventListener('click', () => {
  showModal('addDueModal');
  modalDueName.value = '';
  modalDueItems.value = '';
  modalDueAmount.value = '';
  modalDueDate.value = new Date().toISOString().split('T')[0];
});

// পাওনা সংরক্ষণ ইভেন্ট
saveDueBtn.addEventListener('click', () => {
  const name = modalDueName.value.trim();
  const items = modalDueItems.value.trim();
  const amount = parseFloat(modalDueAmount.value);
  const date = modalDueDate.value;
  
  if (!name || !items || !amount) {
    showNotification('সব তথ্য পূরণ করুন', 'error');
    return;
  }
  
  if (amount <= 0) {
    showNotification('টাকার পরিমাণ সঠিক নয়', 'error');
    return;
  }
  
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  const duesRef = ref(db, `users/${userId}/dues`);
  
  push(duesRef, {
    name: name,
    item: items,
    amount: amount,
    date: date,
    paid: false,
    createdAt: new Date().toISOString()
  }).then(() => {
    hideModal();
    showNotification(`${name}-এর পাওনা যোগ করা হয়েছে!`, 'success');
  });
});

// দাম আপডেট ইভেন্ট
saveNewPriceBtn.addEventListener('click', () => {
  const newPrice = parseFloat(editNewPrice.value);
  const reason = editPriceReason.value.trim();
  
  if (!newPrice || newPrice <= 0) {
    showNotification('নতুন দাম সঠিক নয়', 'error');
    return;
  }
  
  if (!selectedItemForEdit || !currentUser) return;
  
  const userId = currentUser.uid;
  const itemRef = ref(db, `users/${userId}/menuItems/${selectedItemForEdit.key}`);
  
  const updateData = {
    price: newPrice,
    lastUpdated: new Date().toISOString()
  };
  
  if (reason) {
    updateData.lastPriceChangeReason = reason;
    updateData.lastPriceChangeDate = new Date().toISOString();
  }
  
  update(itemRef, updateData).then(() => {
    hideModal();
    showNotification(`${selectedItemForEdit.name}-এর দাম আপডেট করা হয়েছে!`, 'success');
  });
});

// অন্যান্য বাটন ইভেন্ট
newOrderBtn.addEventListener('click', () => {
  currentOrder = [];
  updateOrder();
  showNotification('নতুন অর্ডার শুরু হয়েছে', 'info');
});

quickSellBtn.addEventListener('click', () => {
  // দ্রুত বিক্রির জন্য র‍্যান্ডম আইটেম নির্বাচন
  const activeItems = menuItems.filter(item => item.isActive);
  if (activeItems.length > 0) {
    const randomItem = activeItems[Math.floor(Math.random() * activeItems.length)];
    selectedItemForQuantity = randomItem;
    showQuantityModal(randomItem);
  }
});

clearOrderBtn.addEventListener('click', () => {
  if (currentOrder.length === 0) {
    showNotification('অর্ডার ইতিমধ্যে খালি', 'info');
    return;
  }
  
  if (confirm('সম্পূর্ণ অর্ডার মুছতে চান?')) {
    currentOrder = [];
    updateOrder();
    showNotification('অর্ডার মুছে ফেলা হয়েছে', 'info');
  }
});

saveOrderBtn.addEventListener('click', () => {
  if (currentOrder.length === 0) {
    showNotification('সংরক্ষণের জন্য অর্ডার খালি', 'error');
    return;
  }
  
  showNotification('এই ফিচারটি শীঘ্রই আসছে!', 'info');
});

checkoutBtn.addEventListener('click', completeCheckout);

refreshItemsBtn.addEventListener('click', () => {
  loadMenuItems();
  showNotification('আইটেম রিফ্রেশ করা হয়েছে', 'info');
});

generateReportBtn.addEventListener('click', generateReport);

// বাতিল বাটন ইভেন্ট
cancelAddItemBtn.addEventListener('click', hideModal);
cancelDueBtn.addEventListener('click', hideModal);
cancelEditPriceBtn.addEventListener('click', hideModal);
cancelQuantityBtn.addEventListener('click', hideModal);
