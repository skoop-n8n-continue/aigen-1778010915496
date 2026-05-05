async function loadAppData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to load app data:', error);
        return null;
    }
}

function updateClock(timezone) {
    const timeEl = document.getElementById('time-text');
    const dateEl = document.getElementById('date-text');

    if (!timeEl || !dateEl) return;

    const now = new Date();

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: timezone || 'UTC'
    };

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone || 'UTC'
    };

    try {
        timeEl.textContent = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
        dateEl.textContent = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
    } catch (e) {
        console.error('Invalid timezone:', timezone);
        // Fallback to UTC if provided timezone is invalid
        timeEl.textContent = new Intl.DateTimeFormat('en-US', { ...timeOptions, timeZone: 'UTC' }).format(now);
        dateEl.textContent = new Intl.DateTimeFormat('en-US', { ...dateOptions, timeZone: 'UTC' }).format(now);
    }
}

async function init() {
    const data = await loadAppData();
    if (!data) return;

    const settings = data.sections.app_settings;
    const content = data.sections.content;

    // Apply data-driven styles
    document.documentElement.style.setProperty('--primary-color', settings.primary_color.value);
    document.documentElement.style.setProperty('--background-color', settings.background_color.value);
    document.documentElement.style.setProperty('--text-color', settings.text_color.value);

    // Apply background image if present
    const appContainer = document.getElementById('app-container');
    if (content.background_image.value) {
        appContainer.style.backgroundImage = `url('${content.background_image.value}')`;
    }

    // Static text is handled by data-bind-text for live preview,
    // but we set it here for initial load.
    document.querySelector('.main-text').textContent = content.main_text.value;
    document.querySelector('.subtitle-text').textContent = content.subtitle_text.value;
    document.querySelector('.timezone').textContent = settings.timezone.value;

    // Initialize clock
    const tz = settings.timezone.value;
    updateClock(tz);
    setInterval(() => updateClock(tz), 1000);

    // Reveal the app
    appContainer.classList.add('loaded');
}

// Start the app
init();
