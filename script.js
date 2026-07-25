/**
 * BlueDrive Car Rental - Main JavaScript
 * Handles car filtering, booking logic, price calculation, and UI interactions
 */

// ==================== CAR DATA ====================
// Demo car database stored as a JSON array
const carsData = [
    {
        id: 1,
        name: "Toyota Corolla",
        category: "economy",
        price: 35,
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop",
        specs: { seats: 5, transmission: "Auto", fuel: "Petrol" }
    },
    {
        id: 2,
        name: "Honda Civic",
        category: "economy",
        price: 38,
        image: "https://images.unsplash.com/photo-1541899481282-d53b4054c3cf?w=600&h=400&fit=crop",
        specs: { seats: 5, transmission: "Auto", fuel: "Petrol" }
    },
    {
        id: 3,
        name: "Toyota Camry",
        category: "midsize",
        price: 55,
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop",
        specs: { seats: 5, transmission: "Auto", fuel: "Hybrid" }
    },
    {
        id: 4,
        name: "Honda Accord",
        category: "midsize",
        price: 58,
        image: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=600&h=400&fit=crop",
        specs: { seats: 5, transmission: "Auto", fuel: "Petrol" }
    },
    {
        id: 5,
        name: "BMW 5 Series",
        category: "luxury",
        price: 120,
        image: "https://images.unsplash.com/photo-1555215695-3004980adade?w=600&h=400&fit=crop",
        specs: { seats: 5, transmission: "Auto", fuel: "Diesel" }
    },
    {
        id: 6,
        name: "Mercedes E-Class",
        category: "luxury",
        price: 130,
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop",
        specs: { seats: 5, transmission: "Auto", fuel: "Hybrid" }
    },
    {
        id: 7,
        name: "Toyota RAV4",
        category: "suv",
        price: 70,
        image: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=600&h=400&fit=crop",
        specs: { seats: 7, transmission: "Auto", fuel: "Petrol" }
    },
    {
        id: 8,
        name: "Ford Explorer",
        category: "suv",
        price: 85,
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop",
        specs: { seats: 7, transmission: "Auto", fuel: "Petrol" }
    }
];

// Category display names for UI
const categoryLabels = {
    economy: "Economy",
    midsize: "Mid-size",
    luxury: "Luxury",
    suv: "SUV"
};

// ==================== DOM ELEMENT REFERENCES ====================
const elements = {
    // Navigation
    hamburger: document.getElementById('hamburger'),
    navLinks: document.getElementById('navLinks'),
    
    // Search Form
    searchForm: document.getElementById('searchForm'),
    searchCategory: document.getElementById('searchCategory'),
    searchPickup: document.getElementById('searchPickup'),
    searchReturn: document.getElementById('searchReturn'),
    
    // Cars Display
    carsGrid: document.getElementById('carsGrid'),
    noResults: document.getElementById('noResults'),
    activeFilters: document.getElementById('activeFilters'),
    
    // Booking Modal
    bookingModal: document.getElementById('bookingModal'),
    closeBookingModal: document.getElementById('closeBookingModal'),
    bookingForm: document.getElementById('bookingForm'),
    bookCategory: document.getElementById('bookCategory'),
    bookModel: document.getElementById('bookModel'),
    bookPickup: document.getElementById('bookPickup'),
    bookReturn: document.getElementById('bookReturn'),
    selectedCarInfo: document.getElementById('selectedCarInfo'),
    
    // Price Display
    dailyRateDisplay: document.getElementById('dailyRateDisplay'),
    durationDisplay: document.getElementById('durationDisplay'),
    totalPriceDisplay: document.getElementById('totalPriceDisplay'),
    
    // Confirmation Modal
    confirmationModal: document.getElementById('confirmationModal'),
    closeConfirmation: document.getElementById('closeConfirmation'),
    confirmationMessage: document.getElementById('confirmationMessage'),
    
    // Customer Fields
    customerName: document.getElementById('customerName'),
    customerEmail: document.getElementById('customerEmail'),
    customerPhone: document.getElementById('customerPhone'),
    submitBooking: document.getElementById('submitBooking')
};

// Store currently selected car for booking
let selectedCar = null;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format number as currency (USD)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

/**
 * Calculate number of days between two dates (minimum 1 day)
 */
function calculateDays(pickup, returnDate) {
    if (!pickup || !returnDate) return 0;
    
    const start = new Date(pickup);
    const end = new Date(returnDate);
    
    // Reset time portion for accurate day calculation
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
}

/**
 * Get today's date in YYYY-MM-DD format for input min values
 */
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
function getTomorrowString() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

// ==================== RENDER FUNCTIONS ====================

/**
 * Render car cards to the grid
 * @param {Array} cars - Array of car objects to display
 */
function renderCars(cars) {
    elements.carsGrid.innerHTML = '';
    
    if (cars.length === 0) {
        elements.carsGrid.style.display = 'none';
        elements.noResults.style.display = 'block';
        return;
    }
    
    elements.carsGrid.style.display = 'grid';
    elements.noResults.style.display = 'none';
    
    cars.forEach(car => {
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
            <img src="${car.image}" alt="${car.name}" class="car-image" loading="lazy">
            <div class="car-details">
                <span class="car-category">${categoryLabels[car.category]}</span>
                <h3 class="car-name">${car.name}</h3>
                <div class="car-specs">
                    <span>👤 ${car.specs.seats} Seats</span>
                    <span>⚙️ ${car.specs.transmission}</span>
                    <span>⛽ ${car.specs.fuel}</span>
                </div>
                <div class="car-footer">
                    <div class="car-price">
                        ${formatCurrency(car.price)}<span>/day</span>
                    </div>
                    <button class="btn btn-primary" onclick="openBookingModal(${car.id})">
                        Book Now
                    </button>
                </div>
            </div>
        `;
        elements.carsGrid.appendChild(card);
    });
}

/**
 * Update the model dropdown based on selected category
 * @param {string} category - Selected category value
 * @param {number} preselectId - Optional car ID to preselect
 */
function updateModelDropdown(category, preselectId = null) {
    elements.bookModel.innerHTML = '<option value="">Select Model</option>';
    elements.bookModel.disabled = !category;
    
    if (!category) return;
    
    const filteredCars = carsData.filter(car => car.category === category);
    
    filteredCars.forEach(car => {
        const option = document.createElement('option');
        option.value = car.id;
        option.textContent = `${car.name} - ${formatCurrency(car.price)}/day`;
        if (preselectId && car.id === preselectId) {
            option.selected = true;
        }
        elements.bookModel.appendChild(option);
    });
}

/**
 * Update the selected car info display in booking modal
 */
function updateSelectedCarInfo() {
    if (!selectedCar) {
        elements.selectedCarInfo.style.display = 'none';
        return;
    }
    
    elements.selectedCarInfo.style.display = 'flex';
    elements.selectedCarInfo.innerHTML = `
        <img src="${selectedCar.image}" alt="${selectedCar.name}">
        <div>
            <h4>${selectedCar.name}</h4>
            <p>${formatCurrency(selectedCar.price)} / day</p>
        </div>
    `;
}

/**
 * Update price calculation display in booking modal
 */
function updatePriceCalculation() {
    const pickup = elements.bookPickup.value;
    const returnDate = elements.bookReturn.value;
    const modelId = elements.bookModel.value;
    
    if (!modelId) {
        elements.dailyRateDisplay.textContent = formatCurrency(0);
        elements.durationDisplay.textContent = '0 days';
        elements.totalPriceDisplay.textContent = formatCurrency(0);
        return;
    }
    
    const car = carsData.find(c => c.id === parseInt(modelId));
    if (!car) return;
    
    const days = calculateDays(pickup, returnDate);
    const total = days > 0 ? days * car.price : 0;
    
    elements.dailyRateDisplay.textContent = formatCurrency(car.price);
    elements.durationDisplay.textContent = `${days} day${days !== 1 ? 's' : ''}`;
    elements.totalPriceDisplay.textContent = formatCurrency(total);
}

// ==================== MODAL CONTROLS ====================

/**
 * Open the booking modal for a specific car
 * @param {number} carId - ID of the car to book
 */
function openBookingModal(carId) {
    selectedCar = carsData.find(car => car.id === carId) || null;
    
    // Reset form
    elements.bookingForm.reset();
    
    // Set category and update models
    if (selectedCar) {
        elements.bookCategory.value = selectedCar.category;
        updateModelDropdown(selectedCar.category, selectedCar.id);
    } else {
        elements.bookCategory.value = '';
        updateModelDropdown('');
    }
    
    // Set default dates
    elements.bookPickup.value = elements.searchPickup.value || getTodayString();
    elements.bookReturn.value = elements.searchReturn.value || getTomorrowString();
    
    // Update displays
    updateSelectedCarInfo();
    updatePriceCalculation();
    
    // Show modal
    elements.bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

/**
 * Close the booking modal
 */
function closeBookingModal() {
    elements.bookingModal.classList.remove('active');
    document.body.style.overflow = '';
    selectedCar = null;
}

/**
 * Show booking confirmation modal
 * @param {Object} bookingDetails - Booking information to display
 */
function showConfirmation(bookingDetails) {
    elements.confirmationMessage.innerHTML = `
        Thank you, <strong>${bookingDetails.name}</strong>!<br><br>
        Your <strong>${bookingDetails.carName}</strong> has been reserved 
        from <strong>${formatDate(bookingDetails.pickup)}</strong> to 
        <strong>${formatDate(bookingDetails.returnDate)}</strong>.<br><br>
        Total: <strong>${formatCurrency(bookingDetails.total)}</strong><br>
        A confirmation email has been sent to ${bookingDetails.email}.
    `;
    
    elements.bookingModal.classList.remove('active');
    elements.confirmationModal.classList.add('active');
}

/**
 * Close confirmation modal
 */
function closeConfirmationModal() {
    elements.confirmationModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== EVENT HANDLERS ====================

/**
 * Handle search form submission - filters cars by category
 */
function handleSearch(e) {
    e.preventDefault();
    
    const category = elements.searchCategory.value;
    const pickup = elements.searchPickup.value;
    const returnDate = elements.searchReturn.value;
    
    // Validate dates
    if (pickup && returnDate) {
        const days = calculateDays(pickup, returnDate);
        if (days <= 0) {
            alert('Return date must be after pickup date.');
            return;
        }
    }
    
    // Filter cars
    let filtered = carsData;
    if (category !== 'all') {
        filtered = carsData.filter(car => car.category === category);
        elements.activeFilters.textContent = `Showing: ${categoryLabels[category]}`;
    } else {
        elements.activeFilters.textContent = '';
    }
    
    renderCars(filtered);
    
    // Smooth scroll to cars section
    document.getElementById('cars').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Handle category change in booking form - updates model dropdown
 */
function handleBookCategoryChange() {
    const category = elements.bookCategory.value;
    updateModelDropdown(category);
    updatePriceCalculation();
}

/**
 * Handle model selection change - updates price calculation
 */
function handleBookModelChange() {
    const modelId = elements.bookModel.value;
    if (modelId) {
        selectedCar = carsData.find(car => car.id === parseInt(modelId));
    } else {
        selectedCar = null;
    }
    updateSelectedCarInfo();
    updatePriceCalculation();
}

/**
 * Handle date changes - recalculate price and validate
 */
function handleDateChange() {
    const pickup = elements.bookPickup.value;
    const returnDate = elements.bookReturn.value;
    
    if (pickup && returnDate) {
        const days = calculateDays(pickup, returnDate);
        if (days <= 0) {
            alert('Return date must be after pickup date.');
            elements.bookReturn.value = '';
            return;
        }
    }
    
    updatePriceCalculation();
}

/**
 * Handle booking form submission
 */
function handleBookingSubmit(e) {
    e.preventDefault();
    
    const modelId = elements.bookModel.value;
    if (!modelId) {
        alert('Please select a car model.');
        return;
    }
    
    const car = carsData.find(c => c.id === parseInt(modelId));
    const pickup = elements.bookPickup.value;
    const returnDate = elements.bookReturn.value;
    const days = calculateDays(pickup, returnDate);
    
    if (days <= 0) {
        alert('Please select valid dates.');
        return;
    }
    
    const total = days * car.price;
    
    const bookingDetails = {
        name: elements.customerName.value,
        email: elements.customerEmail.value,
        phone: elements.customerPhone.value,
        carName: car.name,
        category: categoryLabels[car.category],
        pickup: pickup,
        returnDate: returnDate,
        days: days,
        total: total
    };
    
    // Simulate API call with loading state
    elements.submitBooking.textContent = 'Processing...';
    elements.submitBooking.disabled = true;
    
    setTimeout(() => {
        showConfirmation(bookingDetails);
        elements.submitBooking.textContent = 'Confirm Booking';
        elements.submitBooking.disabled = false;
        elements.bookingForm.reset();
    }, 1200);
}

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
    elements.navLinks.classList.toggle('active');
}

/**
 * Handle navbar scroll effect
 */
function handleScroll() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
}

/**
 * Close modals when clicking outside content
 */
function handleModalClick(e) {
    if (e.target === elements.bookingModal) {
        closeBookingModal();
    }
    if (e.target === elements.confirmationModal) {
        closeConfirmationModal();
    }
}

// ==================== INITIALIZATION ====================

/**
 * Initialize the application
 */
function init() {
    // Set minimum dates for search inputs
    elements.searchPickup.min = getTodayString();
    elements.searchReturn.min = getTomorrowString();
    elements.bookPickup.min = getTodayString();
    elements.bookReturn.min = getTomorrowString();
    
    // Set default search dates
    elements.searchPickup.value = getTodayString();
    elements.searchReturn.value = getTomorrowString();
    
    // Render all cars initially
    renderCars(carsData);
    
    // Event Listeners
    elements.hamburger.addEventListener('click', toggleMobileMenu);
    window.addEventListener('scroll', handleScroll);
    
    // Search form
    elements.searchForm.addEventListener('submit', handleSearch);
    
    // Booking modal controls
    elements.closeBookingModal.addEventListener('click', closeBookingModal);
    elements.bookCategory.addEventListener('change', handleBookCategoryChange);
    elements.bookModel.addEventListener('change', handleBookModelChange);
    elements.bookPickup.addEventListener('change', handleDateChange);
    elements.bookReturn.addEventListener('change', handleDateChange);
    elements.bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Confirmation modal
    elements.closeConfirmation.addEventListener('click', closeConfirmationModal);
    
    // Close modals on outside click
    window.addEventListener('click', handleModalClick);
    
    // Close mobile menu when clicking a link
    elements.navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            elements.navLinks.classList.remove('active');
        });
    });
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

