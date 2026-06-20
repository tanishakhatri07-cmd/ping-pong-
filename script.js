// List of all available time zones
const TIMEZONES = [
    { name: 'New York', tz: 'America/New_York' },
    { name: 'Los Angeles', tz: 'America/Los_Angeles' },
    { name: 'Chicago', tz: 'America/Chicago' },
    { name: 'Denver', tz: 'America/Denver' },
    { name: 'London', tz: 'Europe/London' },
    { name: 'Paris', tz: 'Europe/Paris' },
    { name: 'Berlin', tz: 'Europe/Berlin' },
    { name: 'Moscow', tz: 'Europe/Moscow' },
    { name: 'Dubai', tz: 'Asia/Dubai' },
    { name: 'India', tz: 'Asia/Kolkata' },
    { name: 'Bangkok', tz: 'Asia/Bangkok' },
    { name: 'Hong Kong', tz: 'Asia/Hong_Kong' },
    { name: 'Tokyo', tz: 'Asia/Tokyo' },
    { name: 'Sydney', tz: 'Australia/Sydney' },
    { name: 'Auckland', tz: 'Pacific/Auckland' },
    { name: 'Mexico City', tz: 'America/Mexico_City' },
    { name: 'Toronto', tz: 'America/Toronto' },
    { name: 'São Paulo', tz: 'America/Sao_Paulo' },
    { name: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires' },
    { name: 'Istanbul', tz: 'Europe/Istanbul' },
    { name: 'Singapore', tz: 'Asia/Singapore' },
    { name: 'Manila', tz: 'Asia/Manila' },
    { name: 'Jakarta', tz: 'Asia/Jakarta' },
    { name: 'Seoul', tz: 'Asia/Seoul' },
    { name: 'Beijing', tz: 'Asia/Shanghai' },
    { name: 'Athens', tz: 'Europe/Athens' },
    { name: 'Johannesburg', tz: 'Africa/Johannesburg' },
    { name: 'Cairo', tz: 'Africa/Cairo' },
    { name: 'Lagos', tz: 'Africa/Lagos' },
    { name: 'Auckland', tz: 'Pacific/Auckland' }
];

// Default time zones
const DEFAULT_TIMEZONES = [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
];

let selectedTimezones = [];
let modal = document.getElementById('timezoneModal');
let closeBtn = document.querySelector('.close');
let addBtn = document.getElementById('addTimezoneBtn');
let resetBtn = document.getElementById('resetBtn');
let searchInput = document.getElementById('timezoneSearch');
let clocksContainer = document.getElementById('clocksContainer');

// Event listeners
addBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
resetBtn.addEventListener('click', resetToDefault);
searchInput.addEventListener('input', filterTimezones);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Initialize the app
function init() {
    // Load saved timezones from localStorage
    const saved = localStorage.getItem('selectedTimezones');
    if (saved) {
        selectedTimezones = JSON.parse(saved);
    } else {
        selectedTimezones = DEFAULT_TIMEZONES;
    }
    
    renderClocks();
    setInterval(renderClocks, 1000); // Update every second
}

// Render timezone selector modal
function renderTimezoneList() {
    const list = document.getElementById('timezoneList');
    list.innerHTML = '';
    
    const search = searchInput.value.toLowerCase();
    
    TIMEZONES.forEach(tz => {
        if (search === '' || tz.name.toLowerCase().includes(search) || tz.tz.toLowerCase().includes(search)) {
            const item = document.createElement('div');
            item.className = 'timezone-item';
            
            // Get UTC offset
            const now = new Date();
            const offset = calculateOffset(now, tz.tz);
            
            item.innerHTML = `
                <div class="timezone-label">${tz.name}</div>
                <div class="timezone-offset">UTC ${offset}</div>
            `;
            
            item.addEventListener('click', () => {
                addTimezone(tz.tz);
                closeModal();
            });
            
            list.appendChild(item);
        }
    });
}

// Calculate UTC offset for a timezone
function calculateOffset(date, tz) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const tzDate = new Date(
        parseInt(parts[4].value), // year
        parseInt(parts[0].value) - 1, // month
        parseInt(parts[2].value), // day
        parseInt(parts[6].value), // hour
        parseInt(parts[8].value), // minute
        parseInt(parts[10].value) // second
    );
    
    const diff = (date - tzDate) / 60000; // difference in minutes
    const hours = Math.floor(Math.abs(diff) / 60);
    const minutes = Math.abs(diff) % 60;
    const sign = diff >= 0 ? '+' : '-';
    
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Add timezone to selected list
function addTimezone(tz) {
    if (!selectedTimezones.includes(tz)) {
        selectedTimezones.push(tz);
        saveToLocalStorage();
        renderClocks();
    }
}

// Remove timezone
function removeTimezone(tz) {
    selectedTimezones = selectedTimezones.filter(t => t !== tz);
    saveToLocalStorage();
    renderClocks();
}

// Reset to default timezones
function resetToDefault() {
    selectedTimezones = DEFAULT_TIMEZONES;
    saveToLocalStorage();
    renderClocks();
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('selectedTimezones', JSON.stringify(selectedTimezones));
}

// Render all clocks
function renderClocks() {
    clocksContainer.innerHTML = '';
    
    selectedTimezones.forEach(tz => {
        const tzObj = TIMEZONES.find(t => t.tz === tz);
        const location = tzObj ? tzObj.name : tz;
        
        const clock = createClockElement(location, tz);
        clocksContainer.appendChild(clock);
    });
}

// Create a single clock element
function createClockElement(location, tz) {
    const clockDiv = document.createElement('div');
    clockDiv.className = 'clock';
    
    const now = new Date();
    
    // Format time for this timezone
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const time = timeFormatter.format(now);
    const date = dateFormatter.format(now);
    const offset = calculateOffset(now, tz);
    
    clockDiv.innerHTML = `
        <button class="clock-remove" onclick="removeTimezone('${tz}')">×</button>
        <div class="clock-timezone">${tz}</div>
        <div class="clock-location">${location}</div>
        <div class="clock-time">${time}</div>
        <div class="clock-date">${date}</div>
        <div class="clock-details">
            <div class="clock-detail-item">
                <div class="detail-label">UTC Offset</div>
                <div class="detail-value">${offset}</div>
            </div>
            <div class="clock-detail-item">
                <div class="detail-label">Timezone</div>
                <div class="detail-value">${tz.split('/')[1] || tz}</div>
            </div>
        </div>
    `;
    
    return clockDiv;
}

// Modal functions
function openModal() {
    modal.style.display = 'flex';
    searchInput.value = '';
    renderTimezoneList();
    searchInput.focus();
}

function closeModal() {
    modal.style.display = 'none';
}

function filterTimezones() {
    renderTimezoneList();
}

// Start the app
init();
