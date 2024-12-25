document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    function showTab(tabId) {
        tabContents.forEach(content => {
            if (content.id === tabId) {
                content.style.display = 'grid';
            } else {
                content.style.display = 'none';
            }
        });
    }

    // Set initial state to show ebook tab
    showTab('ebook-favorites');
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === 'ebook') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const tabId = button.getAttribute('data-tab') + '-favorites';
            showTab(tabId);
        });
    });
});